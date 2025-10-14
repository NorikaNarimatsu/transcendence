import type { JSX } from 'react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ButtonPurple from '../../components/ButtonPurple';
import { useUser } from '../user/UserContext';
import { useSelectedPlayer } from '../user/PlayerContext';
import type { SelectedPlayer } from '../user/PlayerContext';

import { SnakeGameEngine, SNAKE_VELOCITY } from '../../gameEngines/SnakeEngine';
import { calculateSnakeGameConfig, type SnakeGameConfig } from '../../gameEngines/SnakeConfig';

export default function SnakeGame(): JSX.Element {
    const { user } = useUser();
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode') || 'single';
    
    const { selectedPlayer, guestPlayer } = useSelectedPlayer();

    // Game engine reference
    const [gameConfig, setGameConfig] = useState<SnakeGameConfig>(calculateSnakeGameConfig());
    const gameEngineRef = useRef<SnakeGameEngine | null>(null);
    const [, forceUpdate] = useState({});

    const getOpponent = (): SelectedPlayer | null => {
        if (mode === 'single') {
            return null; // No opponent in single mode
        } else if (mode === '2players') {
            // If a player is selected, use them; otherwise use Guest
            return selectedPlayer || guestPlayer;
        }
        return null;
    };
    
    const opponent = getOpponent();

    useEffect(() => {
        const isMultiplayer = mode === '2players';
        const player1Name = user?.name || 'Player 1';
        const player2Name = opponent?.name || 'Guest';

        console.log('=== SNAKE GAME STARTED ===');
        console.log('Game Mode:', mode);
        console.log('Player 1 (User):', {
            name: user?.name,
            userID: user?.userID,
            avatarUrl: user?.avatarUrl
        });
        
        if (mode === '2players') {
            console.log('Player 2 (Opponent):', {
                name: opponent?.name,
                userID: opponent?.userID,
                avatarUrl: opponent?.avatarUrl,
                type: selectedPlayer ? 'Selected Player' : 'Guest'
            });
            console.log('Global Context Players:', {
                selectedPlayer: selectedPlayer,
                guestPlayer: guestPlayer
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
    }, [mode, user?.name, opponent]);

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
                    winnerID = user?.userID;
                } else if (winner === 'player2') {
                    winnerID = opponent?.userID || 2;
                }
                else
                    winnerID = 0;

            const matchData = {
                matchType: 'snake',
                matchMode: mode,
                user1ID: user?.userID, // Current user
                user2ID: mode === '2players' ? (opponent?.userID || 2) : null, // Opponent or Guest (userID=2) or null for single
                user1Score: engine.snake1.score,
                user2Score: engine.isMultiplayer ? (engine.snake2?.score || 0) : 0,
                winnerID: winnerID
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
            } else {
                const error = await response.json();
                console.error('Failed to save match:', error);
            }
        } catch (error) {
            console.error('Error sending match result:', error);
        }
    };
    
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
            gameEngineRef.current?.handleInput(e.code === 'Space' ? 'Space' : e.key);
            forceUpdate({}); // Force re-render for immediate feedback
        };

        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

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
                    <h1 className="player-name">{user.name}</h1>
                    <img src={user.avatarUrl} alt="Avatar" className="avatar" />
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
                            src={opponent?.avatarUrl || '/avatars/Avatar_2.png'} 
                            alt="Opponent Avatar" 
                            className="avatar" 
                        />
                        <h2 className="player-name">
                            {opponent?.name || 'Guest'}
                        </h2>
                    </div>
                )}
            </header>

            {/* Game Area */}
            <section className="flex-1 bg-pink-dark-grid bg-pink-dark flex items-center justify-center">
                <div
                    className="relative bg-pink-light shadow-no-blur-70"
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
                            background: '#7c3aed',
                            zIndex: 3,
                        }}
                    />

                   {/* Waiting to Start */}
                    {engine.waitingToStart && (
                        <div 
                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50"
                            style={{ zIndex: 100 }}
                        >
                            <p className="text-white text-2xl font-pixelify">
                                Press SPACE to start
                            </p>
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
                                        <div className="text-lg text-green-400 mt-2">🎉 Goal Achieved!</div>
                                    )}
                                </div>
                            )}
                                <div className="flex flex-col gap-4">
                                    <p className="text-white text-xl font-pixelify opacity-75">
                                        Press SPACE to play again
                                    </p>
                                    <ButtonPurple to="/playerProfile">
                                        Return to Profile
                                    </ButtonPurple>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Bottom bar */}
            <footer className="h-40 bg-blue-deep">
                <h1 className="font-pixelify text-pink-light text-opacity-25 text-9xl text-center m-[15px]">
                    SNAKE GAME
                </h1>
            </footer>
        </main>
    );
}