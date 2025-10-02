import type { JSX } from 'react';
import ButtonPurple from '../../components/ButtonPurple';
import avatar2 from '../../assets/avatars/Avatar 2.png';
import { useUser } from '../user/UserContext';
import { SnakeGameEngine, GRID_SIZE_X, GRID_SIZE_Y, CELL_SIZE, SNAKE_VELOCITY } from '../../gameEngines/SnakeEngine';

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function SnakeGame(): JSX.Element {
    const { user } = useUser();
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode');
    const player2 = params.get('player2') || 'Guest';

    // Game engine reference
    const gameEngineRef = useRef<SnakeGameEngine | null>(null);
    const [, forceUpdate] = useState({});

    // Initialize game engine
    useEffect(() => {
        const isMultiplayer = mode === '2players';
        gameEngineRef.current = new SnakeGameEngine(isMultiplayer, user?.name || 'Player 1', player2);
    }, [mode, user?.name, player2]);

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
                    <img src={user.avatar || avatar2} alt="Avatar" className="avatar" />
                </div>
                <div className="flex justify-center">
                    <p className="player-name">
                        {engine.isMultiplayer 
                            ? `${engine.snake1.score} - ${engine.snake2?.score || 0}` 
                            : engine.snake1.score
                        }
                    </p>
                </div>
                {engine.isMultiplayer && (
                    <div className="flex items-center justify-end gap-2">
                        <img src={avatar2} alt="Avatar 2" className="avatar" />
                        <h2 className="player-name">{player2}</h2>
                    </div>
                )}
            </header>

            {/* Game Area */}
            <section className="flex-1 bg-pink-dark-grid bg-pink-dark flex items-center justify-center">
                <div
                    className="relative bg-pink-light shadow-no-blur-70"
                    style={{
                        width: GRID_SIZE_X * CELL_SIZE,
                        height: GRID_SIZE_Y * CELL_SIZE,
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
                                    left: seg.x * CELL_SIZE,
                                    top: seg.y * CELL_SIZE,
                                    width: CELL_SIZE,
                                    height: CELL_SIZE,
                                    zIndex: 2,
                                }}
                            >
                                <div
                                    className="snake-head snake-head-pink absolute"
                                    style={{
                                        left: 12,
                                        top: '60%',
                                        transform: 'translateY(-70%)',
                                        width: CELL_SIZE * 0.4,
                                        height: CELL_SIZE * 0.4,
                                    }}
                                />
                            </div>
                        ) : (
                            // Body segments
                            <div
                                key={idx}
                                className="snake snake-blue snake-border-pink absolute"
                                style={{
                                    left: seg.x * CELL_SIZE,
                                    top: seg.y * CELL_SIZE,
                                    width: CELL_SIZE,
                                    height: CELL_SIZE,
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
                                    left: seg.x * CELL_SIZE,
                                    top: seg.y * CELL_SIZE,
                                    width: CELL_SIZE,
                                    height: CELL_SIZE,
                                    zIndex: 2,
                                }}
                            >
                                <div
                                    className="snake-head snake-head-blue absolute"
                                    style={{
                                        left: 12,
                                        top: '60%',
                                        transform: 'translateY(-70%)',
                                        width: CELL_SIZE * 0.4,
                                        height: CELL_SIZE * 0.4,
                                    }}
                                />
                            </div>
                        ) : (
                            <div
                                key={idx}
                                className="snake snake-pink snake-border-blue absolute"
                                style={{
                                    left: seg.x * CELL_SIZE,
                                    top: seg.y * CELL_SIZE,
                                    width: CELL_SIZE,
                                    height: CELL_SIZE,
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
                            left: engine.food.x * CELL_SIZE + 10,
                            top: engine.food.y * CELL_SIZE + 10,
                            width: CELL_SIZE * 0.6,
                            height: CELL_SIZE * 0.6,
                            background: '#7c3aed',
                            zIndex: 3,
                        }}
                    />

                    {/* Waiting to Start */}
                    {engine.waitingToStart && (
                        <div
                            style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '5rem',
                            zIndex: 10,
                            }}
                        >
                            Press Space to Start
                        </div>
                    )}

                    {/* Game Over Message */}
                    {engine.gameOver && (
                        <div
                            style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '5rem',
                            zIndex: 10,
                            }}
                        >
                            Game Over!
                            {engine.isMultiplayer && (
                                <div style={{ fontSize: '2rem' }}>
                                    Winner: {engine.getWinnerName()}
                                </div>
                            )}
                            <div style={{ fontSize: '1rem', marginTop: '2rem' }}>
                                Press Space to Play Again
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    gap: '2rem',
                                    marginTop: '2rem',
                                    justifyContent: 'center',
                                }}
                            >
                                <ButtonPurple to="/playerProfile">
                                    Return to Profile
                                </ButtonPurple>
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
