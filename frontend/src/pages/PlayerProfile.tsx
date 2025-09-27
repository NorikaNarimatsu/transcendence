import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import avatar1 from '../assets/avatars/Avatar 1.png'
import bgimage from '../assets/Player_Page.jpg'
import arrow_icon from '../assets/icons/arrow.png'

// User interface for the database users
interface User {
    id: number;
    name: string;
    avatarUrl?: string;
}

export default function PlayerProfile(): JSX.Element {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [showPlayerSelection, setShowPlayerSelection] = useState<boolean>(false);
    const [showPasswordVerification, setShowPasswordVerification] = useState<boolean>(false);
    const [showAddFriends, setShowAddFriends] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedPlayer, setSelectedPlayer] = useState<User | null>(null);
    const [password, setPassword] = useState<string>('');
    const [passwordError, setPasswordError] = useState<string>('');
    const [showTournamentRegistration, setShowTournamentRegistration] = useState(false);
    const [tournamentPlayers, setTournamentPlayers] = useState<number>(3);
    const [tournamentError, setTournamentError] = useState<string>('');
    const [selectedParticipants, setSelectedParticipants] = useState<User[]>([]);
    const [verifyingUser, setVerifyingUser] = useState<User | null>(null);
    const [verifyPassword, setVerifyPassword] = useState('');
    const [verifyError, setVerifyError] = useState('');
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('https://localhost:8443/listUsers');
                if (response.ok) {
                    const responseText = await response.text();
                    try {
                        const users = JSON.parse(responseText);
                        setUsers(users);
                        setAllUsers(users);
                    } catch (parseError) {
                        console.error('JSON parse error:', parseError);
                    }
                } else {
                    console.error('Failed to fetch users - Status:', response.status);
                }
            } catch (error) {
                console.error('Network error fetching users:', error);
            }
        };
        fetchUsers();
    }, []);

    const handlePlayerSelect = (player: User | null) => {
        setSelectedPlayer(player);
        if (player === null) {
            navigate('./pongGame?mode=2players&player2=guest');
        } else {
            setShowPasswordVerification(true);
            setShowPlayerSelection(false);
        }
    };

    const handlePasswordSubmit = async () => {
        try {
            const response = await fetch('https://localhost:8443/validatePasswordbyName', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: selectedPlayer!.name, password }),
            });
            if (response.ok) {
                navigate(`./pongGame?mode=2players&player2=${selectedPlayer!.name}`);
            } else {
                setPasswordError('Incorrect password. Please try again.');
            }
        } catch (error) {
            setPasswordError('Error verifying password. Please try again.');
        }
    };

    const resetToPlayerSelection = () => {
        setShowPasswordVerification(false);
        setShowPlayerSelection(true);
        setPassword('');
        setPasswordError('');
        setSelectedPlayer(null);
    };

    const handleVerifyPassword = async () => {
        if (!verifyingUser) return;
        try {
            const response = await fetch('https://localhost:8443/validatePasswordbyName', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: verifyingUser.name, password: verifyPassword }),
            });
            if (response.ok) {
                setSelectedParticipants([...selectedParticipants, verifyingUser]);
                setVerifyingUser(null);
                setVerifyPassword('');
                setVerifyError('');
            } else {
                setVerifyError('Incorrect password. Please try again.');
            }
        } catch {
            setVerifyError('Error verifying password. Please try again.');
        }
    };

    const getButtonsForCategory = (category: string) => {
        switch(category) {
            case 'Games' :
                return [
                    { name: 'Play Pong', action: () => setSelectedCategory('Pong') },
                    { name: 'Play Snake', action: () => setSelectedCategory('Snake') }
                ];
            case 'Pong' :
                return [
                    { name: 'Single', action: () => navigate('./pongGame?mode=single') },
                    { 
                        name: '2 Players', 
                        action: () => {
                            setShowPlayerSelection(true);
                            setSelectedCategory(null);
                        }
                    },
                    { name: 'Tournaments', action: () => setShowTournamentRegistration(true) }
                ];
            case 'Snake' :
                return [
                    { name: 'Single', action: () => navigate('./snakeGame?mode=single') },
                    { name: '2 Players', action: () => navigate('./snakeGame?mode=2players') },
                    { name: 'Tournaments', action: () => setShowTournamentRegistration(true) }
                ];
            case 'Friends' :
                return [
                    { name: 'See Friends', action: () => console.log('See Friends') },
                    { 
                        name: 'Add Friend', 
                        action: async () => {
                            setShowAddFriends(true);
                            try {
                                const response = await fetch('https://localhost:8443/listUsers');
                                if (response.ok) {
                                    const users = await response.json();
                                    setAllUsers(users);
                                }
                            } catch (error) {
                                console.error('Failed to fetch users:', error);
                            }
                        }
                    },
                    { name: 'Friend Requests', action: () => console.log('Friends Requests')}
                ];
            case 'Scores' :
                return [
                    { name: 'See Scores', action: () => console.log('Seeing Scores')},
                    { name: 'Reset all Scores', action: () => console.log('Reseting all scores')},
                ];
            case 'Settings' :
                return [
                    { name: 'Delete Account', action: () => console.log('Deleting account')},
                    { name: 'Update data', action: () => console.log('Updating account data')},
                ];
            default:
                return [];
        }
    };

    return (
        <main className="min-h-screen flex flex-col">
            <header className="h-40 bg-blue-deep flex">
                <div className="font-pixelify text-white text-opacity-25 text-7xl m-auto">What should we play today?</div>
            </header>
            <section className="flex-1 bg-pink-grid flex items-center justify-center">
                <div className="relative bg-pink-dark w-[825px] h-[600px] m-[10px] flex justify-between items-center px-[50px]">
                    {/* Player Card */}
                    <div className="shadow-no-blur-50-purple-bigger bg-pink-light w-[350px] h-[500px] flex flex-col justify-between py-6">
                        {/* PLAYER INFO title */}
                        <div className="font-pixelify text-white text-5xl text-center text-shadow mb-6">PLAYER INFO</div>
                        {/* Avatar and player info */}
                        <div className="bg-pink-dark mx-[25px] h-[125px] border-purple flex flex-row justify-center items-center px-4">
                            <img src={avatar1} alt="Avatar 1" className="avatar m-auto" style={{borderColor: '#7a63fe'}}/>
                            <div className="flex flex-col m-auto">
                                <div className="font-pixelify text-white text-[40px]">Eduarda</div>
                                <div className="font-dotgothic font-bold text-white text-2xl text-border-blue">700 XP</div>
                            </div>
                        </div>
                        {/* Buttons container - evenly distributed */}
                        <div className="flex flex-col justify-between flex-grow mx-[25px] py-4">
                            <button className="button-pp-blue shadow-no-blur flex items-center justify-between "
                                    onClick={() => setSelectedCategory('Games')}
                            >
                                Games
                                <img src={arrow_icon} alt="Arrow" className="h-5 m-4"/>
                            </button>
                            <button className="button-pp-blue shadow-no-blur flex items-center justify-between"
                                    onClick={() => setSelectedCategory('Friends')}
                            >
                                Friends
                                <img src={arrow_icon} alt="Arrow" className="h-5 m-4"/>
                            </button>
                            <button className="button-pp-blue shadow-no-blur flex items-center justify-between"
                                    onClick={() => setSelectedCategory('Scores')}
                            >
                                Scores
                                <img src={arrow_icon} alt="Arrow" className="h-5 m-4"/>
                            </button>
                            <button className="button-pp-blue-settings shadow-no-blur flex items-center justify-between"
                                    onClick={() => setSelectedCategory('Settings')}
                            >
                                Settings
                                <img src={arrow_icon} alt="Arrow" className="h-3 m-5"/>
                            </button>
                        </div>
                    </div>
                    {/* Right side content */}
                    <div className="w-[350px] h-[500px] overflow-hidden bg-cover bg-center relative border-img"
                        style={{ backgroundImage: `url(${bgimage})`, opacity: 0.5, boxShadow: 'inset 8px 0 2px -4px rgba(0, 0, 0, 0.6), inset 0 8px 2px -4px rgba(0, 0, 0, 0.6)'}}>
                        <div className="absolute inset-0 overflow-y-auto">

                        {/* Player Selection Modal */}
                        {showPlayerSelection && (
                            <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
                                <div className="bg-pink-light p-6 rounded-lg max-h-[400px] overflow-y-auto w-[300px]">
                                    <h3 className="font-pixelify text-blue-deep text-2xl mb-4 text-center">Select Player 2</h3>
                                    <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto">
                                        {users.map((user) => (
                                            <button
                                                key={user.id}
                                                onClick={() => handlePlayerSelect(user)}
                                                className="px-4 py-2 bg-blue-light text-white font-pixelify rounded hover:bg-blue-medium transition-colors flex items-center gap-2"
                                            >
                                                {user.avatarUrl && (
                                                    <img 
                                                        src={`http://localhost:3000${user.avatarUrl}`} 
                                                        alt={user.name} 
                                                        className="w-6 h-6 rounded-full object-cover"
                                                    />
                                                )}
                                                {user.name}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => handlePlayerSelect(null)}
                                            className="px-4 py-2 bg-pink-medium text-blue-deep font-pixelify rounded hover:bg-pink-dark transition-colors mt-2"
                                        >
                                            🎮 Play as Guest
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowPlayerSelection(false);
                                            setSelectedCategory('Pong');
                                        }}
                                        className="w-full px-4 py-2 bg-gray-500 text-white font-pixelify rounded hover:bg-gray-600 transition-colors mt-4"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                        {/* Password Verification Modal */}
                        {showPasswordVerification && selectedPlayer && (
                            <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
                                <div className="bg-pink-light p-6 rounded-lg w-[300px]">
                                    <h3 className="font-pixelify text-blue-deep text-2xl mb-4 text-center">
                                        Verify Password
                                    </h3>
                                    <div className="flex items-center gap-2 mb-4 justify-center">
                                        {selectedPlayer.avatarUrl && (
                                            <img 
                                                src={`http://localhost:3000${selectedPlayer.avatarUrl}`} 
                                                alt={selectedPlayer.name} 
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        )}
                                        <p className="font-pixelify text-blue-deep text-lg">
                                            {selectedPlayer.name}
                                        </p>
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setPasswordError('');
                                        }}
                                        placeholder="Enter password"
                                        className="w-full px-3 py-2 mb-3 border rounded font-pixelify"
                                        onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                                    />
                                    {passwordError && (
                                        <p className="text-red-500 font-pixelify text-sm mb-3 text-center">
                                            {passwordError}
                                        </p>
                                    )}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handlePasswordSubmit}
                                            disabled={!password.trim()}
                                            className="flex-1 px-4 py-2 bg-blue-light text-white font-pixelify rounded hover:bg-blue-medium transition-colors disabled:bg-gray-400"
                                        >
                                            Verify
                                        </button>
                                        <button
                                            onClick={resetToPlayerSelection}
                                            className="flex-1 px-4 py-2 bg-gray-500 text-white font-pixelify rounded hover:bg-gray-600 transition-colors"
                                        >
                                            Back
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Regular category content */}
                        {selectedCategory && !showPlayerSelection && !showPasswordVerification && (
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col gap-4">
                                {getButtonsForCategory(selectedCategory).map((button, index) => (
                                    <button
                                        key={index}
                                        className="button-pp-purple shadow-no-blur-60"
                                        onClick={button.action}
                                    >
                                        {button.name}
                                    </button>
                                ))}
                                {selectedCategory === 'Pong' && (
                                    <button
                                        className="button-pp-blue shadow-no-blur-60 mt-2"
                                        onClick={() => setSelectedCategory('Games')}
                                    >
                                        ← Back to Games
                                    </button>
                                )}
                            </div>
                        )}
                        {showAddFriends && (
                            <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
                                <div className="bg-pink-light p-6 rounded-lg max-h-[400px] overflow-y-auto w-[300px]">
                                    <h3 className="font-pixelify text-blue-deep text-2xl mb-4 text-center">Add Friend</h3>
                                    <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto">
                                        {allUsers.map((user) => (
                                            <button
                                                key={user.id}
                                                className="px-4 py-2 bg-blue-light text-white font-pixelify rounded hover:bg-blue-medium transition-colors flex items-center gap-2"
                                                onClick={() => {
                                                    alert(`Friend request sent to ${user.name}`);
                                                }}
                                            >
                                                {user.avatarUrl && (
                                                    <img 
                                                        src={`http://localhost:3000${user.avatarUrl}`} 
                                                        alt={user.name} 
                                                        className="w-6 h-6 rounded-full object-cover"
                                                    />
                                                )}
                                                {user.name}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setShowAddFriends(false)}
                                        className="w-full px-4 py-2 bg-gray-500 text-white font-pixelify rounded hover:bg-gray-600 transition-colors mt-4"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                        {/* Tournament Registration Modal */}
                        {showTournamentRegistration && (
                            <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
                                <div className="bg-pink-light p-6 rounded-lg w-[350px] flex flex-col items-center overflow-y-auto max-h-[90vh]">
                                    <h3 className="font-pixelify text-blue-deep text-2xl mb-4 text-center">
                                        Registration
                                    </h3>
                                    <label className="font-pixelify text-blue-deep mb-2">
                                        Number of players (3-8):
                                    </label>
                                    <input
                                        type="number"
                                        min={3}
                                        max={8}
                                        value={tournamentPlayers}
                                        onChange={e => {
                                            setTournamentPlayers(Number(e.target.value));
                                            setTournamentError('');
                                            setSelectedParticipants([]);
                                        }}
                                        className="w-full px-3 py-2 mb-3 border rounded font-pixelify text-center"
                                    />
                                    {tournamentError && (
                                        <p className="text-red-500 font-pixelify text-sm mb-3 text-center">
                                            {tournamentError}
                                        </p>
                                    )}
                                    <div className="mb-4 w-full">
                                        <span className="font-pixelify text-blue-deep mb-2">Select Participants:</span>
                                        <div className="flex flex-wrap gap-2 mt-2 max-h-[180px] overflow-y-auto">
                                            {allUsers.map(user => (
                                                <button
                                                    key={user.id}
                                                    disabled={selectedParticipants.some(p => p.id === user.id) || selectedParticipants.length >= tournamentPlayers}
                                                    onClick={() => {
                                                        if (user.name === 'Guest') {
                                                            setSelectedParticipants([...selectedParticipants, user]);
                                                        } else {
                                                            setVerifyingUser(user);
                                                        }
                                                    }}
                                                    className={`px-3 py-2 rounded border ${selectedParticipants.some(p => p.id === user.id) ? 'bg-gray-300' : 'bg-blue-light text-white hover:bg-blue-medium'}`}
                                                >
                                                    {user.avatarUrl && (
                                                        <img src={user.avatarUrl} alt={user.name} className="inline-block w-6 h-6 rounded-full mr-2" />
                                                    )}
                                                    {user.name}
                                                </button>
                                            ))}
                                            <button
                                                disabled={selectedParticipants.some(p => p.name === 'Guest') || selectedParticipants.length >= tournamentPlayers}
                                                onClick={() => setSelectedParticipants([...selectedParticipants, { id: 0, name: 'Guest' }])}
                                                className="px-3 py-2 rounded border bg-pink-medium text-white hover:bg-pink-dark"
                                            >
                                                🎮 Guest
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mb-4 w-full">
                                        <span className="font-pixelify text-blue-deep mb-2">Selected:</span>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {selectedParticipants.map(user => (
                                                <span key={user.id + user.name} className="flex items-center gap-1 bg-pink-light px-2 py-1 rounded">
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
                                    <button
                                        onClick={() => {
                                            if (selectedParticipants.length !== tournamentPlayers) {
                                                setTournamentError('Select the correct number of participants.');
                                            } else {
                                                setShowTournamentRegistration(false);
                                                navigate(`/tournament?players=${tournamentPlayers}&ids=${selectedParticipants.map(u => u.id).join(',')}`);
                                            }
                                        }}
                                        disabled={selectedParticipants.length !== tournamentPlayers}
                                        className="font-pixelify text-blue-deep mb-2"
                                    >
                                        Start Tournament
                                    </button>
                                    <button
                                        onClick={() => setShowTournamentRegistration(false)}
                                        className="mt-2 px-6 py-2 bg-gray-500 text-white rounded font-pixelify hover:bg-gray-600 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                                {/* Password Verification Modal for Tournament */}
                                {verifyingUser && (
                                    <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-10">
                                        <div className="bg-pink-light p-6 rounded-lg w-[300px]">
                                            <h3 className="font-pixelify text-blue-deep text-2xl mb-4 text-center">
                                                Verify Password for {verifyingUser.name}
                                            </h3>
                                            <input
                                                type="password"
                                                value={verifyPassword}
                                                onChange={e => {
                                                    setVerifyPassword(e.target.value);
                                                    setVerifyError('');
                                                }}
                                                placeholder="Enter password"
                                                className="w-full px-3 py-2 mb-3 border rounded font-pixelify"
                                                onKeyPress={e => e.key === 'Enter' && handleVerifyPassword()}
                                            />
                                            {verifyError && (
                                                <p className="text-red-500 font-pixelify text-sm mb-3 text-center">
                                                    {verifyError}
                                                </p>
                                            )}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleVerifyPassword}
                                                    disabled={!verifyPassword.trim()}
                                                    className="flex-1 px-4 py-2 bg-blue-light text-white font-pixelify rounded hover:bg-blue-medium transition-colors disabled:bg-gray-400"
                                                >
                                                    Verify
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setVerifyingUser(null);
                                                        setVerifyPassword('');
                                                        setVerifyError('');
                                                    }}
                                                    className="flex-1 px-4 py-2 bg-gray-500 text-white font-pixelify rounded hover:bg-gray-600 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        </div>
                    </div>
                </div>
            </section>
            <footer className="h-40 bg-blue-deep"></footer>
        </main>
    );
}