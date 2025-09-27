import type { JSX } from 'react';
import ButtonPurple from '../components/ButtonPurple';
import ButtonPink from '../components/ButtonDarkPink';
import avatar1 from '../assets/avatars/Avatar 1.png'
import avatar2 from '../assets/avatars/Avatar 2.png' // just necessary in a multiplayer

import { useState, useEffect, useRef } from 'react';

let winner: number;
const userEmail = "test1@gmail.com"; // Just for test need to be replace with dynamic value from login/session
const GRID_SIZE_X = 20; // number of cells horizontally
const GRID_SIZE_Y = 12; // number of cells vertically
const CELL_SIZE = 50; // 50x50px
const SNAKE_VELOCITY = 120; // can be change to modify difficult! - slower = 500 - impossible = 5

type Position = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

function getRandomPosition(): Position {
    return {
        x: Math.floor(Math.random() * GRID_SIZE_X),
        y: Math.floor(Math.random() * GRID_SIZE_Y),
    };
}

export default function SnakeGame(): JSX.Element {
    const [userName, setUserName] = useState('');
    const [userAvatar, setUserAvatar] = useState('');
    // 1. Game State
    // Multiplayer Addition
    const [gameMode, setGameMode] = useState<null | 'single' | 'multi'>(null);
    const [isMultiplayer, setIsMultiplayer] = useState(false);
    const [snake2, setSnake2] = useState<Position[]>([{ x: 5, y: 5 }]);
    const [direction2, setDirection2] = useState<Direction>('LEFT');
    const [score2, setScore2] = useState(0);

    // Single Player
    const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
    const [direction, setDirection] = useState<Direction>('RIGHT');
    const [food, setFood] = useState<Position>(getRandomPosition());
    const [score, setScore] = useState(0);
    const [waitingToStart, setWaitingToStart] = useState(true);
    const [gameOver, setGameOver] = useState(false);

    // To avoid stale closures in setInterval
    const directionRef = useRef(direction);
    directionRef.current = direction;

    // get user name
    useEffect(() => {
        fetch(`/api/user/profile?email=${encodeURIComponent(userEmail)}`)
            .then(res => res.json())
            .then(data => {
                setUserName(data.name);
                setUserAvatar(data.avatarUrl);
        })
        .catch(err => {
            // handle error, fallback to default
            setUserName('Player');
            setUserAvatar('batata');
        });
    }, []);

    // 2. Game Loop
    useEffect(() => {
        if (gameOver || waitingToStart) return;
        const interval = setInterval(() => {
            // Always update snake 1
            setSnake(prevSnake => {
                const head = prevSnake[0];
                let newPosition: Position;
                switch (directionRef.current) {
                    case 'UP': newPosition = { x: head.x, y: head.y - 1 }; break;
                    case 'DOWN': newPosition = { x: head.x, y: head.y + 1 }; break;
                    case 'LEFT': newPosition = { x: head.x - 1, y: head.y }; break;
                    case 'RIGHT': newPosition = { x: head.x + 1, y: head.y }; break;
                }

                // Collision detection for snake 1
                if (
                    newPosition.x < 0 || newPosition.x >= GRID_SIZE_X ||
                    newPosition.y < 0 || newPosition.y >= GRID_SIZE_Y ||
                    prevSnake.some(seg => seg.x === newPosition.x && seg.y === newPosition.y) ||
                    (isMultiplayer && snake2.some(seg => seg.x === newPosition.x && seg.y === newPosition.y))
                ) {
                    winner = 2;
                    setGameOver(true);
                    return prevSnake;
                }

                let newSnake = [newPosition, ...prevSnake];
                if (newPosition.x === food.x && newPosition.y === food.y) {
                    setFood(getRandomPosition());
                    setScore(score => score + 1);
                } else {
                    newSnake.pop();
                }
                return newSnake;
            });

            // Only update snake 2 in multiplayer mode
            if (isMultiplayer) {
                setSnake2(prevSnake2 => {
                    const head2 = prevSnake2[0];
                    let newPosition2: Position;
                    switch (direction2) {
                        case 'UP': newPosition2 = { x: head2.x, y: head2.y - 1 }; break;
                        case 'DOWN': newPosition2 = { x: head2.x, y: head2.y + 1 }; break;
                        case 'LEFT': newPosition2 = { x: head2.x - 1, y: head2.y }; break;
                        case 'RIGHT': newPosition2 = { x: head2.x + 1, y: head2.y }; break;
                    }

                    // Collision detection for snake 2
                    if (
                        newPosition2.x < 0 || newPosition2.x >= GRID_SIZE_X ||
                        newPosition2.y < 0 || newPosition2.y >= GRID_SIZE_Y ||
                        prevSnake2.some(seg => seg.x === newPosition2.x && seg.y === newPosition2.y) ||
                        snake.some(seg => seg.x === newPosition2.x && seg.y === newPosition2.y)
                    ) {
                        winner = 1;
                        setGameOver(true);
                        return prevSnake2;
                    }

                    let newSnake2 = [newPosition2, ...prevSnake2];
                    if (newPosition2.x === food.x && newPosition2.y === food.y) {
                        setFood(getRandomPosition());
                        setScore2(score2 => score2 + 1);
                    } else {
                        newSnake2.pop();
                    }
                    return newSnake2;
                });
            }
        }, SNAKE_VELOCITY);
        return () => clearInterval(interval);
    }, [food, gameOver, waitingToStart, isMultiplayer, direction2, snake2, snake]);

    // 5. Keyboard Input
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (waitingToStart && e.code === 'Space') {
                // Start the game Single
                setWaitingToStart(false);
                setGameOver(false);
                setScore(0);
                setSnake([{ x: 10, y: 10 }]);
                setFood(getRandomPosition());
                setDirection('RIGHT');
                if (isMultiplayer === true)
                {
                    setSnake2([{ x: 5, y: 5 }]);
                    setDirection2('LEFT');
                    setScore2(0);
                }
                return;
            }
            if (gameOver || waitingToStart) return;
            // Player 1 (arrow keys)
            switch (e.key) {
                case 'ArrowUp': if (direction !== 'DOWN') setDirection('UP'); break;
                case 'ArrowDown': if (direction !== 'UP') setDirection('DOWN'); break;
                case 'ArrowLeft': if (direction !== 'RIGHT') setDirection('LEFT'); break;
                case 'ArrowRight': if (direction !== 'LEFT') setDirection('RIGHT'); break;
            }
            // Player 2 (WASD)
            switch (e.key) {
                case 'w': if (direction2 !== 'DOWN') setDirection2('UP'); break;
                case 's': if (direction2 !== 'UP') setDirection2('DOWN'); break;
                case 'a': if (direction2 !== 'RIGHT') setDirection2('LEFT'); break;
                case 'd': if (direction2 !== 'LEFT') setDirection2('RIGHT'); break;

            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [direction, direction2, gameOver, waitingToStart]);

    let winnerName = userName;
    if (isMultiplayer) {
        if (winner == 1) winnerName = userName;
        else if (winner == 2) winnerName = "Guest";
    }

    // 6. Render
    if (gameMode === null) {
        return (
            <main className="min-h-screen flex flex-col bg-pink-dark">
                <section className="flex-1 bg-pink-dark-grid bg-pink-dark flex items-center justify-center">
                    <div
                        style={{
                            width: GRID_SIZE_X * CELL_SIZE,
                            height: GRID_SIZE_Y * CELL_SIZE,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <div className="flex justify-center items-center gap-8">
                            <ButtonPink
                                style={{
                                    minWidth: '180px',
                                    fontSize: '2rem',
                                    padding: '0.5rem 1.5rem',
                                }}
                                onClick={() => {
                                    setGameMode('single');
                                    setIsMultiplayer(false);
                                }}
                            >
                                Single Player
                            </ButtonPink>
                            <ButtonPurple
                                style={{
                                    minWidth: '180px',
                                    fontSize: '2rem',
                                    padding: '0.5rem 1.5rem',
                                }}
                                onClick={() => {
                                    setGameMode('multi');
                                    setIsMultiplayer(true);
                                }}
                            >
                                Multiplayer
                            </ButtonPurple>
                        </div>
                    </div>
                </section>
                <footer className="h-40 bg-blue-deep">
                    <h1 className="font-pixelify text-pink-light text-opacity-25 text-9xl text-center m-[15px]">
                        Choose Mode
                    </h1>
                </footer>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex flex-col">
            {/* Top bar */}
            <header className="h-40 bg-blue-deep grid grid-cols-3 items-center">
                <div className="flex items-center justify-start gap-2">
                    <h1 className="player-name">{userName}</h1>
                    <img src={userAvatar} alt="Avatar 1" className="avatar" />
                </div>
                <div className="flex justify-center">
                    <p className="player-name">
                        {isMultiplayer ? `${score} - ${score2}` : score}
                    </p>
                </div>
                { isMultiplayer && (
                    <div className="flex items-center justify-end gap-2">
                        <img src={avatar2} alt="Avatar 2" className="avatar" />
                        <h2 className="player-name">Guest</h2>
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
                    {/* Snake  Single*/}
                    {snake.map((seg, idx) => (
                        idx === 0 ? (
                            // Head segment: parent is body, child is head
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
                    {/* Snake 2 only Multiplayer */}
                    { isMultiplayer && snake2.map((seg, idx) => (
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
                    {
                    <div
                        className="snake-food"
                        style={{
                            position: 'absolute',
                            left: food.x * CELL_SIZE + 10,
                            top: food.y * CELL_SIZE + 10,
                            width: CELL_SIZE * 0.6,
                            height: CELL_SIZE * 0.6,
                            background: '#7c3aed',
                            zIndex: 3, // for food apear on top of snake segments
                        }}
                    />
                    }
                    { waitingToStart && (
                        <div
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                // background: 'rgba(0,0,0,0.7)',
                                color: '#fff',
                                // padding: '2rem',
                                // borderRadius: '1rem',
                                fontSize: '3rem',
                                zIndex: 10,
                            }}
                        >
                            Press Space to Start
                        </div>
                    )}
                    {/* Game Over Message */}
                    {gameOver && (
                        <div
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                // background: 'rgba(0,0,0,0.7)',
                                color: '#fff',
                                // padding: '2rem',
                                // borderRadius: '1rem',
                                fontSize: '5rem',
                                zIndex: 10,
                            }}
                        >
                            Game Over!
                            {isMultiplayer && (
                                <div style={{ fontSize: '2rem'}}>
                                    Winner: {winnerName}
                                </div>
                            )}
                            <div
                                style={{
                                    display: 'flex',
                                    gap: '2rem',
                                    marginTop: '2rem',
                                    justifyContent: 'center',
                                }}
                            >
                            <ButtonPink
                                    onClick={() => {
                                        setWaitingToStart(true);
                                        setGameOver(false);
                                        setScore(0);
                                        setSnake([{ x: 10, y: 10 }]);
                                        setFood(getRandomPosition());
                                        setDirection('RIGHT');
                                    }}
                                >
                                    Again
                                </ButtonPink>
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
                <h1 className="font-pixelify text-pink-light text-opacity-25 text-9xl text-center m-[15px]">SNAKE GAME</h1>
            </footer>
        </main>
    );
}
