import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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

export default function TournamentTree() {
    const query = useQuery();
    const navigate = useNavigate();
    const players = Number(query.get('players')) || 0;
    const ids = query.get('ids')?.split(',') || [];
    const initialParticipants = parseParticipants(ids);

    const [displayNames, setDisplayNames] = useState(
        Object.fromEntries(initialParticipants.map(p => [p.id, p.displayName]))
    );
    const [editing, setEditing] = useState<string | null>(null);
    // Always show edit mode
    const showEdit = true;

    return (
        <div className="min-h-screen flex flex-col">
            <header className="h-40 bg-blue-deep flex">
                <div className="font-pixelify text-white text-opacity-25 text-7xl m-auto">Tournament Registration</div>
            </header>
            <section className="flex-1 bg-pink-grid flex items-center justify-center">
                <div className="relative bg-pink-dark w-[825px] h-[600px] m-[10px] flex justify-between items-center px-[50px]">
                    <div className="bg-pink-dark rounded-lg p-8 flex flex-col items-center w-[700px] mx-auto">
                        <div className="w-full mb-8">
                            <h2 className="font-pixelify text-blue-deep text-xl mb-2 text-center">Participants</h2>
                            <div
                                className={`grid gap-4 justify-center`}
                                style={{
                                    gridTemplateColumns:
                                        initialParticipants.length <= 4
                                            ? `repeat(${initialParticipants.length}, minmax(120px, 1fr))`
                                            : `repeat(4, minmax(120px, 1fr))`
                                }}
                            >
                                {initialParticipants.map((player, idx) => (
                                    <div
                                        key={player.id + idx}
                                        className="bg-pink-light px-4 py-2 font-pixelify text-blue-deep text-lg flex flex-col items-center rounded-lg"
                                    >
                                        <img
                                            src={player.avatarUrl}
                                            alt={player.displayName}
                                            className="w-10 h-10 rounded-full mb-2"
                                            style={{ objectFit: 'cover', background: '#fff' }}
                                        />
                                        <div className="flex items-center gap-2">
                                            {showEdit && editing === player.id ? (
                                                <input
                                                    type="text"
                                                    value={displayNames[player.id] || ""}
                                                    onChange={e =>
                                                        setDisplayNames({ ...displayNames, [player.id]: e.target.value })
                                                    }
                                                    onBlur={() => setEditing(null)}
                                                    onKeyDown={e => {
                                                        if (e.key === "Enter") setEditing(null);
                                                    }}
                                                    className="px-2 py-1 border-2 border-blue-deep rounded font-pixelify text-center text-blue-deep bg-white"
                                                    style={{ fontSize: '1.1rem', width: 110 }}
                                                    autoFocus
                                                />
                                            ) : (
                                                <span
                                                    onClick={() => showEdit && setEditing(player.id)}
                                                    className={showEdit ? "cursor-pointer hover:underline flex items-center gap-1" : ""}
                                                    title={showEdit ? "Click to edit display name" : ""}
                                                    style={{ minWidth: 80 }}
                                                >
                                                    {displayNames[player.id] || <span className="text-gray-400">No Name</span>}
                                                    {showEdit && (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="inline w-4 h-4 text-blue-deep ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m-2 2h6" />
                                                        </svg>
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                        {showEdit && (
                                            <span className="text-xs text-blue-deep mt-1 opacity-60">Click name to edit</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <p className="font-pixelify text-blue-deep text-lg mb-4 text-center">
                            Number of players: <b>{players}</b>
                        </p>
                        <button
                            className="button-pp-blue font-pixelify px-6 py-2 rounded mt-2 text-lg flex justify-center items-center text-center"
                            style={{ minWidth: 100 }}
                            onClick={() => {
                                // Shuffle participants
                                const shuffled = [...initialParticipants].sort(() => Math.random() - 0.5);
                                // Pass display names and avatars as bracket data
                                navigate(`/tournament/bracket?players=${players}&ids=${shuffled
                                    .map(p => `${p.id}:${encodeURIComponent(displayNames[p.id] || p.displayName)}:${encodeURIComponent(p.avatarUrl || '')}`)
                                    .join(',')}`);
                            }}
                        >
                            Start
                        </button>
                    </div>
                </div>
            </section>
            <footer className="h-40 bg-blue-deep"></footer>
        </div>
    );
}