import { useLocation } from 'react-router-dom';

const defaultAvatar = '../assets/avatars/Avatar 1.png';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function parseParticipants(ids: string[]) {
    return ids.map(str => {
        const [id, displayName, avatarUrl] = str.split(':');
        let decodedAvatar = decodeURIComponent(avatarUrl || '');
        if (!decodedAvatar || decodedAvatar === 'undefined') {
            decodedAvatar = defaultAvatar;
        }
        return {
            id,
            displayName: decodeURIComponent(displayName || ''),
            avatarUrl: decodedAvatar,
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
            console.log(
                `Round ${roundIdx}, Box ${idx}:`,
                'Left', left,
                'Right', right,
                'Top', top,
                'Bottom', bottom
            );
        });
    });

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
                </div>
            </section>
            <footer className="h-40 bg-blue-deep"></footer>
        </div>
    );
}