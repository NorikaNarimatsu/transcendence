import { useNavigate } from 'react-router-dom';

interface User {
    id: number;
    name: string;
    avatarUrl?: string;
}

interface TournamentRegistrationProps {
    open: boolean;
    onClose: () => void;
    allUsers: User[];
    tournamentPlayers: number;
    setTournamentPlayers: (n: number) => void;
    selectedParticipants: User[];
    setSelectedParticipants: (users: User[]) => void;
    setVerifyingUser: (user: User | null) => void;
}

export function TournamentRegistration({
    open,
    onClose,
    allUsers,
    tournamentPlayers,
    setTournamentPlayers,
    selectedParticipants,
    setSelectedParticipants,
    setVerifyingUser,
}: TournamentRegistrationProps) {
    const navigate = useNavigate();

    if (!open) return null;

    return (
            <div className="bg-pink-light p-6 rounded-lg w-[370px] max-h-[95vh] flex flex-col items-center overflow-y-auto shadow-xl border-2 border-blue-deep" style={{ boxSizing: 'border-box' }}>
                <h3 className="font-pixelify text-blue-deep text-2xl mb-4 text-center w-full" style={{ marginTop: 0, paddingTop: 0, lineHeight: '2.2rem' }}>
                    Registration
                </h3>
                <label className="font-pixelify text-blue-deep mb-2 w-full text-left">
                    Number of players (3-8):
                </label>
                <input
                    type="number"
                    min={3}
                    max={8}
                    value={tournamentPlayers}
                    onChange={e => {
                        setTournamentPlayers(Number(e.target.value));
                        setSelectedParticipants([]);
                    }}
                    className="w-full px-3 py-2 mb-3 border rounded font-pixelify text-center bg-pink-light"
                    style={{ fontSize: '1.3rem' }}
                />
                <div className="mb-4 w-full">
                    <span className="font-pixelify text-blue-deep mb-2 block">Select Participants:</span>
                    <div className="flex flex-wrap gap-2 mt-2 overflow-y-auto" style={{ maxHeight: '110px' }}>
                        {allUsers.map(user => (
                            <button
                                key={user.id}
                                disabled={selectedParticipants.some(p => p.id === user.id) || selectedParticipants.length >= tournamentPlayers - 1}
                                onClick={() => {
                                    if (user.name === 'Guest') {
                                        setSelectedParticipants([...selectedParticipants, user]);
                                    } else {
                                        setVerifyingUser(user);
                                    }
                                }}
                                className={`px-3 py-2 rounded border ${selectedParticipants.some(p => p.id === user.id) ? 'bg-gray-300' : 'bg-blue-light text-blue-deep hover:bg-blue-medium'} font-pixelify w-[120px]`}
                                style={{ fontSize: '1.1rem' }}
                            >
                                {user.avatarUrl && (
                                    <img src={user.avatarUrl} alt={user.name} className="inline-block w-6 h-6 rounded-full mr-2" />
                                )}
                                {user.name}
                            </button>
                        ))}
                        <button
                            disabled={selectedParticipants.some(p => p.name === 'Guest') || selectedParticipants.length >= tournamentPlayers - 1}
                            onClick={() => setSelectedParticipants([...selectedParticipants, { id: 0, name: 'Guest' }])}
                            className="px-3 py-2 rounded border bg-pink-medium text-blue-deep hover:bg-pink-dark font-pixelify w-[120px]"
                            style={{ fontSize: '1.1rem' }}
                        >
                            🎮 Guest
                        </button>
                    </div>
                </div>
                <div className="mb-4 w-full">
                    <span className="font-pixelify text-blue-deep mb-2 block">Selected:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {selectedParticipants.map(user => (
                            <span key={user.id + user.name} className="flex items-center gap-1 bg-pink-light px-2 py-1 rounded font-pixelify text-blue-deep" style={{ fontSize: '1.1rem' }}>
                                {user.avatarUrl && (
                                    <img src={user.avatarUrl} alt={user.name} className="w-5 h-5 rounded-full" />
                                )}
                                {user.name}
                                <button
                                    onClick={() => setSelectedParticipants(selectedParticipants.filter(p => p.id !== user.id || p.name !== user.name))}
                                    className="ml-1 text-xs text-red-600"
                                >
                                    ✕
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
                <div className="flex w-full gap-2 mb-2">
                    <button
                        onClick={() => {
                            if (selectedParticipants.length !== tournamentPlayers - 1) {
                                return;
                            }
                            navigate(`/tournament?players=${tournamentPlayers}&ids=me,${selectedParticipants.map(u => u.id).join(',')}`);
                        }}
                        disabled={selectedParticipants.length !== tournamentPlayers - 1}
                        className="button-pp-blue shadow-no-blur flex-1 flex items-center justify-center font-pixelify"
                        style={{
                            fontSize: '1.2rem',
                            minHeight: '40px',
                            opacity: selectedParticipants.length === tournamentPlayers - 1 ? 1 : 0.5
                        }}
                    >
                        Start
                    </button>
                    <button
                        onClick={onClose}
                        className="button-pp-blue shadow-no-blur flex-1 flex items-center justify-center font-pixelify"
                        style={{
                            fontSize: '1.2rem',
                            minHeight: '40px'
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
    );
}