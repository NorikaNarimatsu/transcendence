import type { JSX } from 'react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ButtonPink from '../../components/ButtonDarkPink';
import { useUser } from '../user/UserContext';
import { useSelectedPlayer } from '../user/PlayerContext';
import type { SelectedPlayer } from '../user/PlayerContext';
import { useTournament } from '../tournament/tournamentContext';

import { SnakeGameEngine, SNAKE_VELOCITY } from '../../gameEngines/SnakeEngine';
import { calculateSnakeGameConfig, type SnakeGameConfig } from '../../gameEngines/SnakeConfig';

//Icons import
import home_icon from '../../assets/icons/Home.png'
import gear_icon from '../../assets/icons/Settings.png'

//Import Game Instructions + Settings + Stats
import GameInstructions from '../../components/GameInstructionsSnakeGame';
import GameSettings from '../../components/SettingsGames';

export default function SnakeGame(): JSX.Element {
    const { user } = useUser();
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode') || 'single';
    // const tournamentBracketID = params.get('tournamentBracketID') || null;
    // const tournamentMatchID  = params.get('tournamentMatchID') || null;
    
    const { selectedPlayer, guestPlayer } = useSelectedPlayer();
    const { currentMatch } = useTournament();

    // Game engine reference
    const [gameConfig, setGameConfig] = useState<SnakeGameConfig>(calculateSnakeGameConfig());
    const gameEngineRef = useRef<SnakeGameEngine | null>(null);
    const [, forceUpdate] = useState({});

     // Handle going back to profile
    const handleBackToProfile = () => {
        navigate('/playerProfile');
    };

    const [view, setView] = useState<"game"|"instructions"|"settings">('instructions');
    const [backgroundColor, setBackgroundColor] = useState<string>('bg-pink-light');
    
    const getPlayer1 = (): SelectedPlayer => {
        if (mode === 'tournament') {
            return currentMatch?.player1;
        } else {
            return user;
        }
    };

    const getPlayer2 = (): SelectedPlayer | null => {
        if (mode === 'single') {
            return null; // No opponent in single mode
        } else if (mode === '2players') {
            return selectedPlayer || guestPlayer;
        } else if (mode === 'tournament') {
            return currentMatch?.player2 || null;
        }
        return null;
    };

    const player1 = getPlayer1();
    const player2 = getPlayer2();

    useEffect(() => {
        const isMultiplayer = mode === '2players' || mode === 'tournament'; // Add tournament
        const player1Name = player1?.name || 'Player 1';
        const player2Name = player2?.name || 'Guest';

        console.log('=== SNAKE GAME STARTED ===');
        console.log('Game Mode:', mode);
        console.log('Is Multiplayer:', isMultiplayer);
        console.log('Player 1 (User):', {
            name: player1.name,
            userID: player1.userID,
            avatarUrl: player1.avatarUrl
        });
        
        if (isMultiplayer) {
            console.log('Player 2 (Opponent):', {
                name: player2?.name,
                userID: player2?.userID,
                avatarUrl: player2?.avatarUrl,
                type: mode === 'tournament' ? 'Tournament Player' : (selectedPlayer ? 'Selected Player' : 'Guest')
            });
        } else {
            console.log('Single player mode - no opponent');
        }
        
        console.log('Final Player Names:', {
            player1Name: player1Name,
            player2Name: player2Name || 'None (Single Mode)'
        });
        console.log('========================');

        gameEngineRef.current = new SnakeGameEngine(gameConfig, isMultiplayer, player1Name, player2Name);
    }, [gameConfig, mode, player1.name, player2?.name]); // Fix: Use stable references

    useEffect(() => {
        const handleResize = () => {
            const newConfig = calculateSnakeGameConfig();
            setGameConfig(newConfig);
            if (gameEngineRef.current) {
                gameEngineRef.current.updateConfig(newConfig);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const sendMatchResult = async (engine: SnakeGameEngine) => {
        try {
            let winnerID: number;

                const winner = engine.getWinner();
                if (winner === 'player1') {
                    winnerID = player1.userID;
                } else if (winner === 'player2') {
                    winnerID = player2?.userID || 2;
                }
                else
                    winnerID = 0;

            const matchData = {
                matchType: 'snake',
                matchMode: mode,
                tournamentBracketID: mode === 'tournament' ? currentMatch?.tournamentBracketID : null,
                tournamentMatchID: mode === 'tournament' ? currentMatch?.tournamentMatchID : null,
                user1ID: user?.userID, // Current user
                user2ID: mode === '2players' ? (player2?.userID || 2) : null, // Opponent or Guest (userID=2) or null for single
                user1Score: engine.snake1.score,
                user2Score: engine.isMultiplayer ? (engine.snake2?.score || 0) : 0,
                winnerID: winnerID,
                startedAt: engine.startedAt,
                endedAt: engine.endedAt
            };

            console.log('=== SENDING SNAKE MATCH RESULT ===');
            console.log('Match Data:', matchData);

            const response = await fetch('https://localhost:8443/match', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(matchData)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Match saved successfully:', result);
                console.log('Winner:', result.winner, 'Winner ID:', result.winnerID);
                if (result.duration) {
                    console.log('Match Duration:', result.duration, 'seconds');
                }

                // Navigate back to bracket after tournament match
                if (mode === 'tournament' && response.ok) {
                    navigate('/tournament/bracket');
                }
            } else {
                const error = await response.json();
                console.error('Failed to save match:', error);
            }
        } catch (error) {
            console.error('Error sending match result:', error);
        }
    };

    // Add tournament validation
    useEffect(() => {
        if (mode === 'tournament' && !currentMatch) {
            console.error('Tournament mode requires match info');
            navigate('/tournament/bracket');
            return;
        }
    }, [mode, currentMatch, navigate]);
    
    // Game loop
    useEffect(() => {
        if (!gameEngineRef.current) return;

        const interval = setInterval(() => {
            gameEngineRef.current!.update();
            forceUpdate({});
        }, SNAKE_VELOCITY);

        return () => clearInterval(interval);
    }, []);

    // Keyboard input
    useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
        // Prevent SPACE from triggering button clicks
        if (e.code === 'Space') {
            e.preventDefault();
        }
        
        gameEngineRef.current?.handleInput(e.code === 'Space' ? 'Space' : e.key);
        forceUpdate({}); // Force re-render for immediate feedback
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
}, []);

// Also add a useEffect to reset view when game starts:
useEffect(() => {
    if (gameEngineRef.current && !gameEngineRef.current.waitingToStart && !gameEngineRef.current.gameOver) {
        // Game is running, make sure settings are closed
        setView("instructions");
    }
}, [gameEngineRef.current?.waitingToStart, gameEngineRef.current?.gameOver]);


    useEffect(() => {
        if (gameEngineRef.current?.gameOver) {
            console.log('Snake game ended, sending match result...');
            sendMatchResult(gameEngineRef.current);
        }
    }, [gameEngineRef.current?.gameOver]);


    // User authentication check
    useEffect(() => {
        if (!user) {
            navigate('/signup');
        }
    }, [user, navigate]);

    if (!user || !gameEngineRef.current) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-pink-grid">
                <p className="text-blue-deep font-dotgothic text-xl">Loading...</p>
            </div>
        );
    }

    const engine = gameEngineRef.current;

    return (
        <main className="min-h-screen flex flex-col">
            {/* Top bar */}
            <header className="h-40 bg-blue-deep grid grid-cols-3 items-center">
                <div className="flex items-center justify-start gap-2">
                    <h1 className="player-name">{player1.name}</h1>
                    <img src={player1.avatarUrl} alt="Avatar" className="avatar" />
                </div>

                {/* Center Score */}
                <div className="flex justify-center">
                    <p className="player-name">
                        {engine.isMultiplayer 
                            ? `${engine.snake1.score} - ${engine.snake2?.score || 0}` 
                            : `Score: ${engine.snake1.score}`
                        }
                    </p>
                </div>

                {engine.isMultiplayer && (
                    <div className="flex items-center justify-end gap-2">
                        <img 
                            src={player2?.avatarUrl || '/avatars/Avatar_2.png'} 
                            alt="Opponent Avatar" 
                            className="avatar" 
                        />
                        <h2 className="player-name">
                            {player2?.name || 'Guest'}
                        </h2>
                    </div>
                )}
            </header>

            {/* Game Area */}
            <section className="flex-1 bg-pink-dark-grid bg-pink-dark flex items-center justify-center">
                <div
                    className={`relative shadow-no-blur-70 ${backgroundColor}`}
                    style={{
                        width: gameConfig.gameWidth,
                        height: gameConfig.gameHeight,
                    }}
                >
                    {/* Snake 1 */}
                    {engine.snake1.body.map((seg, idx) => (
                        idx === 0 ? (
                            // Head segment
                            <div
                                key={idx}
                                className="snake snake-blue snake-border-pink absolute"
                                style={{
                                    left: seg.x * gameConfig.cellSize,
                                    top: seg.y * gameConfig.cellSize,
                                    width: gameConfig.cellSize,
                                    height: gameConfig.cellSize,
                                    zIndex: 2,
                                }}
                            >
                                <div
                                    className="snake-head snake-head-pink absolute"
                                    style={{
                                        left: gameConfig.cellSize * 0.25,
                                        top: '60%',
                                        transform: 'translateY(-70%)',
                                        width: gameConfig.cellSize * 0.4,
                                        height: gameConfig.cellSize * 0.4,
                                    }}
                                />
                            </div>
                        ) : (
                            // Body segments
                            <div
                                key={idx}
                                className="snake snake-blue snake-border-pink absolute"
                                style={{
                                    left: seg.x * gameConfig.cellSize,
                                    top: seg.y * gameConfig.cellSize,
                                    width: gameConfig.cellSize,
                                    height: gameConfig.cellSize,
                                    zIndex: 1,
                                }}
                            />
                        )
                    ))}

                    {/* Snake 2 (only in multiplayer) */}
                    {engine.isMultiplayer && engine.snake2 && engine.snake2.body.map((seg, idx) => (
                        idx === 0 ? (
                            <div
                                key={idx}
                                className="snake snake-pink snake-border-blue absolute"
                                style={{
                                    left: seg.x * gameConfig.cellSize,
                                    top: seg.y * gameConfig.cellSize,
                                    width: gameConfig.cellSize,
                                    height: gameConfig.cellSize,
                                    zIndex: 2,
                                }}
                            >
                                <div
                                    className="snake-head snake-head-blue absolute"
                                    style={{
                                        left: gameConfig.cellSize * 0.25,
                                        top: '60%',
                                        transform: 'translateY(-70%)',
                                        width: gameConfig.cellSize * 0.4,
                                        height: gameConfig.cellSize * 0.4,
                                    }}
                                />
                            </div>
                        ) : (
                            <div
                                key={idx}
                                className="snake snake-pink snake-border-blue absolute"
                                style={{
                                    left: seg.x * gameConfig.cellSize,
                                    top: seg.y * gameConfig.cellSize,
                                    width: gameConfig.cellSize,
                                    height: gameConfig.cellSize,
                                    zIndex: 1,
                                }}
                            />
                        )
                    ))}

                    {/* Food */}
                    <div
                        className="snake-food"
                        style={{
                            position: 'absolute',
                            left: engine.food.x * gameConfig.cellSize + gameConfig.cellSize * 0.2,
                            top: engine.food.y * gameConfig.cellSize + gameConfig.cellSize * 0.2,
                            width: gameConfig.cellSize * 0.6,
                            height: gameConfig.cellSize * 0.6,
                            zIndex: 3,
                        }}
                    />

                   {/* Waiting to Start */}
                    {engine.waitingToStart && (
                        <div className="absolute inset-0" style={{ zIndex: 200}}>
                            <GameInstructions></GameInstructions>
                        </div>
                    )}

                    {view === "settings" && (
                        <div className="absolute inset-0" style={{ zIndex: 200}}>
                            <GameSettings
                                onClose={() => setView("instructions")}
                                onBackgroundChange={setBackgroundColor}
                                currentBackground={backgroundColor}
                            />
                        </div>
                    )}

                    {engine.gameOver && (
                        <div 
                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50"
                            style={{ zIndex: 100 }}
                        >
                            <div className="text-center">
                                <p className="text-white text-4xl font-pixelify mb-6">
                                    Game Over!
                                </p>
                                {engine.isMultiplayer ? (
                                    <div className="text-white text-2xl font-pixelify mb-4">
                                    <div>Winner: {engine.getWinnerName()}</div>
                                    <div className="text-lg mt-3">
                                        <p>{engine.snake1.name}: {engine.snake1.score}/10 foods</p>
                                        {engine.snake2 && (
                                            <p>{engine.snake2.name}: {engine.snake2.score}/10 foods</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-white text-2xl font-pixelify mb-4">
                                    <div>Final Score: {engine.snake1.score}/10 foods</div>
                                    {engine.snake1.score >= 10 && (
                                        <div className="text-lg text-400 mt-2">🎉 Goal Achieved! You WIN!</div>
                                    )}
                                </div>
                            )}
                                <div className="flex flex-col gap-4">
                                    <p className="text-white text-xl font-pixelify opacity-75">
                                        Press SPACE to play again
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Bottom bar */}
            <footer className="h-40 bg-blue-deep grid place-items-center">
                <div className="col-start-1 row-start-1">
                    <h1 className="font-pixelify text-pink-light text-opacity-25 text-9xl animate-marquee">PONG GAME</h1>
                </div>
                <div className="col-start-1 row-start-1 z-10 flex gap-4">
                    <ButtonPink onClick={handleBackToProfile} className="!mt-0">
                        <img src={home_icon} alt="Home" className="h-8 w-auto"/>
                    </ButtonPink>
                    <ButtonPink onClick={() => {
                        if (view === "settings"){
                        setView("instructions")
                        } else {
                        setView("settings")
                        }
                    }
                        } className="!mt-0" >
                        <img src={gear_icon} alt="Game Settings" className="h-8 w-auto"/>
                    </ButtonPink>
                </div>
            </footer>
        </main>
    );
}