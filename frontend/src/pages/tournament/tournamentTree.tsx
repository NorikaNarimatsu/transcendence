import { useLocation } from 'react-router-dom';

// Dummy avatar for demonstration
const defaultAvatar = '../assets/avatars/Avatar 1.png';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

// Helper to parse participant info (id:name:avatarUrl)
function parseParticipants(ids: string[]) {
    // Example: ["1:Eduarda:/assets/avatars/Avatar 1.png", ...]
    return ids.map(str => {
        const [id, name, avatarUrl] = str.split(':');
        return {
            id,
            name,
            avatarUrl: avatarUrl || defaultAvatar,
        };
    });
}

function getRounds(participants: { id: string, name: string, avatarUrl: string }[]) {
    // Single-elimination bracket
    const rounds: { players: typeof participants }[] = [];
    let current = [...participants];
    while (current.length > 1) {
        rounds.push({ players: current });
        current = Array(Math.ceil(current.length / 2)).fill({ name: '', avatarUrl: defaultAvatar, id: '' });
    }
    rounds.push({ players: [{ name: 'Winner', avatarUrl: defaultAvatar, id: 'winner' }] });
    return rounds;
}

export default function TournamentTree() {
    const query = useQuery();
    const players = Number(query.get('players')) || 0;
    // ids should be sent as "id:name:avatarUrl" from registration for full info
    const ids = query.get('ids')?.split(',') || [];
    const participants = parseParticipants(ids);

    const rounds = getRounds(participants);

    return (
        <div className="min-h-screen bg-pink-light flex items-center justify-center">
            <div className="bg-pink-dark rounded-lg shadow-xl border-2 border-blue-deep p-8 flex flex-col items-center w-[700px] mx-auto">
                <h1 className="font-pixelify text-blue-deep text-3xl mb-6 text-center">Tournament Bracket</h1>
                <p className="font-pixelify text-blue-deep text-lg mb-4 text-center">
                    Number of players: <b>{players}</b>
                </p>
                <div className="flex flex-row gap-8 w-full justify-center overflow-x-auto">
                    {rounds.map((round, roundIdx) => (
                        <div key={roundIdx} className="flex flex-col items-center">
                            <div className="font-pixelify text-pink-medium text-xl mb-2">
                                {roundIdx === 0 ? 'Round 1' : roundIdx === rounds.length - 1 ? 'Winner' : `Round ${roundIdx + 1}`}
                            </div>
                            {round.players.map((player, idx) => (
                                <div
                                    key={player.id + idx}
                                    className="bg-pink-light border border-blue-deep rounded-lg px-4 py-2 mb-4 font-pixelify text-blue-deep text-lg w-[140px] text-center flex flex-col items-center"
                                    style={{ minHeight: '60px', marginBottom: '16px' }}
                                >
                                    <img
                                        src={player.avatarUrl}
                                        alt={player.name}
                                        className="w-8 h-8 rounded-full mb-2"
                                        style={{ objectFit: 'cover', background: '#fff' }}
                                    />
                                    <span>{player.name || <span className="text-gray-400">TBD</span>}</span>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}