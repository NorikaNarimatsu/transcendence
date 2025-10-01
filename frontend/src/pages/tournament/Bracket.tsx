import { useLocation } from 'react-router-dom';

const defaultAvatar = '../assets/avatars/Avatar 1.png';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function parseParticipants(ids: string[]) {
    return ids.map(str => {
        const [id, displayName, avatarUrl] = str.split(':');
        return {
            id,
            displayName,
            avatarUrl: avatarUrl || defaultAvatar,
        };
    });
}

function getBracketRounds(participants: any[]) {
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
    const query = useQuery();
    const ids = query.get('ids')?.split(',') || [];
    const participants = parseParticipants(ids);

    const rounds = getBracketRounds(participants);

    // Layout constants
    const boxHeight = 60;
    const boxWidth = 200;
    const baseGap = 40;
    const colGap = 60;

    // Calculate SVG size
    const svgWidth = rounds.length * (boxWidth + colGap);
    const svgHeight = Math.max(...rounds.map(r => r.length)) * (boxHeight + baseGap);

    // Calculate box positions for SVG lines
    const boxPositions: { x: number; y: number }[][] = [];
    rounds.forEach((round, roundIdx) => {
        const colX = roundIdx * (boxWidth + colGap);
        let y = 0;
        const positions: { x: number; y: number }[] = [];
        for (let i = 0; i < round.length; ++i) {
            let marginTop = 0;
            if (roundIdx > 0 && i % 2 === 0) {
                marginTop = baseGap * Math.pow(2, roundIdx - 1);
            }
            if (i === 0) {
                y += marginTop;
            } else {
                y += boxHeight + (roundIdx === 0 ? baseGap : baseGap * Math.pow(2, roundIdx - 1));
            }
            positions.push({ x: colX, y });
        }
        boxPositions.push(positions);
    });

    return (
        <div className="min-h-screen flex flex-col">
            <header className="h-40 bg-blue-deep flex">
                <div className="font-pixelify text-white text-opacity-25 text-7xl m-auto">Tournament Bracket</div>
            </header>
            <section className="flex-1 bg-pink-grid flex items-center justify-center">
                <div className="relative bg-pink-dark w-full max-w-6xl min-h-[600px] m-[10px] flex justify-center items-center px-[50px]">
                    {/* SVG lines */}
                    <svg
                        width={svgWidth}
                        height={svgHeight}
                        style={{ position: 'absolute', left: 0, top: 0, zIndex: 0, pointerEvents: 'none' }}
                    >
                        {rounds.slice(0, -1).map((round, roundIdx) =>
                            round.map((_, idx) => {
                                if (roundIdx < boxPositions.length - 1 && idx % 2 === 0) {
                                    const from = boxPositions[roundIdx][idx];
                                    const from2 = boxPositions[roundIdx][idx + 1];
                                    const to = boxPositions[roundIdx + 1][Math.floor(idx / 2)];
                                    if (!from || !from2 || !to) return null;
                                    // Draw from bottom of first, top of second, to center of next
                                    return (
                                        <g key={`${roundIdx}-${idx}`}>
                                            {/* Line from first box */}
                                            <line
                                                x1={from.x + boxWidth}
                                                y1={from.y + boxHeight / 2}
                                                x2={to.x}
                                                y2={to.y + boxHeight / 2}
                                                stroke="#2563eb"
                                                strokeWidth={3}
                                            />
                                            {/* Line from second box */}
                                            <line
                                                x1={from2.x + boxWidth}
                                                y1={from2.y + boxHeight / 2}
                                                x2={to.x}
                                                y2={to.y + boxHeight / 2}
                                                stroke="#2563eb"
                                                strokeWidth={3}
                                            />
                                        </g>
                                    );
                                }
                                return null;
                            })
                        )}
                    </svg>
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
                                            }}
                                        >
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
                </div>
            </section>
            <footer className="h-40 bg-blue-deep"></footer>
        </div>
    );
}