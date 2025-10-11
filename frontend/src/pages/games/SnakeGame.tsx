import type { JSX } from 'react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ButtonPurple from '../../components/ButtonPurple';
import { useUser } from '../user/UserContext';
import { useSelectedPlayer } from '../user/PlayerContext';

import { SnakeGameEngine, SNAKE_VELOCITY } from '../../gameEngines/SnakeEngine';
import { calculateSnakeGameConfig, type SnakeGameConfig } from '../../gameEngines/SnakeConfig';


export default function SnakeGame(): JSX.Element {
    const { user } = useUser();
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode');
    const { selectedPlayer } = useSelectedPlayer();

    // Game engine reference
    const [gameConfig, setGameConfig] = useState<SnakeGameConfig>(calculateSnakeGameConfig());
    const gameEngineRef = useRef<SnakeGameEngine | null>(null);
    const [, forceUpdate] = useState({});


    // Initialize game engine
    useEffect(() => {
        const isMultiplayer = mode === '2players';
        const player1Name = user?.name || 'Player 1';
        const player2Name = selectedPlayer?.name || 'Guest';
        gameEngineRef.current = new SnakeGameEngine(gameConfig, isMultiplayer, player1Name, player2Name);
    }, [mode, user?.name, selectedPlayer?.name]);

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
                    <img src={user.avatar} alt="Avatar" className="avatar" />
                </div>

                {/* Center Score */}
                <div className="flex justify-center">
                    <p className="player-name">
                        {engine.isMultiplayer 
                            ? `${engine.snake1.score} - ${engine.snake2?.score || 0}` 
                            : engine.snake1.score
                        }
                    </p>
                </div>

                {/* Second Player*/}
                {engine.isMultiplayer && (
                    <div className="flex items-center justify-end gap-2">
                        <img src={selectedPlayer?.avatarUrl || '/avatars/Avatar_2.png' } alt="Avatar Player 2" className="avatar" />
                        <h2 className="player-name">
                            {selectedPlayer?.name || 'Guest'}
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

                    {/* Game Over Message */}
                    {engine.gameOver && (
                        <div 
                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50"
                            style={{ zIndex: 100 }}
                        >
                            <div className="text-center">
                                <p className="text-white text-4xl font-pixelify mb-6">
                                    Game Over!
                                </p>
                                {engine.isMultiplayer && (
                                    <div className="text-white text-2xl font-pixelify mb-4">
                                        Winner: {engine.getWinnerName()}
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
