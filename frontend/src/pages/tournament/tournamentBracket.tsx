import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTournament } from './tournamentContext';
import type { TournamentMatch } from './tournamentContext';


function getBracketRounds(participants: any[]) {
    console.log('Generating bracket rounds for participants:', participants);
    const rounds = [];
    let current = participants;
    while (current.length > 1) {
        rounds.push(current);
        current = Array(Math.ceil(current.length / 2)).fill(null);
    }
    rounds.push([null]); // Winner box
    return rounds;
}

export default function Bracket() {
    const navigate = useNavigate();
    const { tournamentData, setCurrentMatch } = useTournament();
    const [matchCounter, setMatchCounter] = useState(1);

    console.log('Tournament Data:', tournamentData);

    useEffect(() => {
        if (!tournamentData) {
            navigate('/playerProfile');
        }
    }, [tournamentData, navigate]);

    if (!tournamentData) {
        return <div>Loading...</div>;
    }

    const participants = tournamentData.participants.map(p => ({
        id: p.userID.toString(),
        displayName: p.name,
        avatarUrl: p.avatarUrl,
    }));

    const rounds = getBracketRounds(participants);

    // Layout constants
    const boxHeight = 60;
    const boxWidth = 200;
    const baseGap = 40;
    const colGap = 60;

    // Calculate SVG size
    const svgWidth = rounds.length * (boxWidth + colGap);
    // Calculate the height of each column
    const columnHeights = rounds.map(round => round.length * boxHeight + (round.length - 1) * baseGap);
    const maxColumnHeight = Math.max(...columnHeights);
    const svgHeight = maxColumnHeight;

    // The container width must match your .max-w-6xl (which is 72rem = 1152px)
    const containerWidth = 1152;
    // Calculate the offset to center the SVG over the boxes
    const offsetX = (containerWidth - svgWidth) / 2;

    // Calculate box positions for SVG lines and dots, centered vertically per column
    const boxPositions: { x: number; y: number }[][] = [];
    rounds.forEach((round, roundIdx) => {
        const colX = roundIdx * (boxWidth + colGap);
        const columnHeight = round.length * boxHeight + (round.length - 1) * baseGap;
        const offsetY = (maxColumnHeight - columnHeight) / 2;
        let y = offsetY;
        const positions: { x: number; y: number }[] = [];
        for (let i = 0; i < round.length; ++i) {
            if (i !== 0) {
                y += boxHeight + baseGap;
            }
            positions.push({ x: colX, y });
        }
        boxPositions.push(positions);
    });

    // Debug: print all dot coordinates
    boxPositions.forEach((round, roundIdx) => {
        round.forEach((pos, idx) => {
            const left = { x: pos.x, y: pos.y + boxHeight / 2 };
            const right = { x: pos.x + boxWidth, y: pos.y + boxHeight / 2 };
            const top = { x: pos.x + boxWidth / 2, y: pos.y };
            const bottom = { x: pos.x + boxWidth / 2, y: pos.y + boxHeight };
            // console.log(
            //     `Round ${roundIdx}, Box ${idx}:`,
            //     'Left', left,
            //     'Right', right,
            //     'Top', top,
            //     'Bottom', bottom
            // );
        });
    });

    const startMatch = (player1: any, player2: any) => {
        const gameType = tournamentData?.gameType || 'pong';

        const match: TournamentMatch = {
            player1: {
                userID: parseInt(player1.id),
                name: player1.displayName,
                avatarUrl: player1.avatarUrl
            },
            player2: {
                userID: parseInt(player2.id),
                name: player2.displayName,
                avatarUrl: player2.avatarUrl
            },
            tournamentBracketID: tournamentData.tournamentBracketID || 0,
            tournamentMatchID: 0
        };
        
        console.log('Starting tournament match:', match);
        setCurrentMatch(match);
        
        // Increment match counter for display purposes
        setMatchCounter(prev => prev + 1);
        console.log("*******this is the game type", gameType);
        if (gameType === 'snake') {
            navigate(`/playerProfile/snakeGame?mode=tournament`);
        } else {
            navigate(`/playerProfile/pongGame?mode=tournament`);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <header className="h-40 bg-blue-deep flex">
                <div className="font-pixelify text-white text-opacity-25 text-7xl m-auto">Tournament Bracket</div>
            </header>
            <section className="flex-1 bg-pink-grid flex items-center justify-center">
                <div
                    className="relative bg-pink-dark w-full max-w-6xl min-h-[600px] m-[10px] flex justify-center items-center px-[50px]"
                    style={{ width: containerWidth }}
                >
                    {/* Bracket columns */}
                    <div className="flex flex-row gap-[60px] w-full justify-center items-start" style={{ minHeight: svgHeight }}>
                        {rounds.map((round, roundIdx) => (
                            <div key={roundIdx} className="flex flex-col items-center justify-start h-full w-[200px]" style={{ position: 'relative' }}>
                                {round.map((player, idx) => {
                                    const pos = boxPositions[roundIdx][idx];
                                    return (
                                        <div
                                            key={idx}
                                            className="bg-pink-light border border-blue-deep rounded-lg px-4 py-2 font-pixelify text-blue-deep text-lg w-[200px] flex flex-row items-center gap-2 justify-center absolute"
                                            style={{
                                                minHeight: `${boxHeight}px`,
                                                left: 0,
                                                top: pos.y,
                                                width: `${boxWidth}px`,
                                            }}
                                        >
                                            {/* Dots on four sides */}
                                            <span style={{
                                                position: 'absolute',
                                                left: -7,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                width: 10,
                                                height: 10,
                                                background: '#2563eb',
                                                borderRadius: '50%',
                                                display: 'block',
                                            }} />
                                            <span style={{
                                                position: 'absolute',
                                                right: -7,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                width: 10,
                                                height: 10,
                                                background: '#2563eb',
                                                borderRadius: '50%',
                                                display: 'block',
                                            }} />
                                            <span style={{
                                                position: 'absolute',
                                                left: '50%',
                                                top: -7,
                                                transform: 'translateX(-50%)',
                                                width: 10,
                                                height: 10,
                                                background: '#2563eb',
                                                borderRadius: '50%',
                                                display: 'block',
                                            }} />
                                            <span style={{
                                                position: 'absolute',
                                                left: '50%',
                                                bottom: -7,
                                                transform: 'translateX(-50%)',
                                                width: 10,
                                                height: 10,
                                                background: '#2563eb',
                                                borderRadius: '50%',
                                                display: 'block',
                                            }} />
                                            {/* Profile content */}
                                            {player ? (
                                                <>
                                                    <img
                                                        src={player.avatarUrl}
                                                        alt={player.displayName}
                                                        className="w-10 h-10 rounded-full"
                                                        style={{ objectFit: 'cover', background: '#fff' }}
                                                    />
                                                    <span>{player.displayName}</span>
                                                </>
                                            ) : (
                                                <span className="text-gray-400">Empty</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            
                        ))}
                    </div>
                    {/* <button
                        onClick={() => {
                            // Example: start match between first two participants
                            if (participants.length >= 2) {
                                startMatch(participants[0], participants[1], 'pong');
                            }
                        }}
                        >
                        Start Game
                    </button>
                </div>
            </section>
            <footer className="h-40 bg-blue-deep"></footer>
        </div>
    );
} */}
                    <div className="absolute bottom-4 flex gap-2">
                        <button
                            className="button-pp-blue font-pixelify px-4 py-2 rounded"
                            onClick={() => {
                                if (participants.length >= 2) {
                                    startMatch(participants[0], participants[1]);
                                }
                            }}
                        >
                            Start Match #{matchCounter}
                        </button>
                    </div>
                </div>
            </section>
            <footer className="h-40 bg-blue-deep"></footer>
        </div>
    );
}

