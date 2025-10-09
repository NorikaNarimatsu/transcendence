import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import bgimage from '../assets/Player_Page.jpg';
import arrow_icon from '../assets/icons/arrow.png';

import { TournamentRegistration } from '../components/profileTournamentRegistration';
import { PasswordVerification } from '../components/profilePasswordVerification';
import { CategoryButtons } from '../components/profileCategoryButtons';
import { AddFriends } from '../components/profileAddFriends';
import { PlayerSelection } from '../components/profilePlayerSelection';

import { useUser} from './user/UserContext';
import type { SelectedPlayer } from  './user/PlayerContext';
import { useSelectedPlayer } from './user/PlayerContext';

export default function PlayerProfile(): JSX.Element {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [showPlayerSelection, setShowPlayerSelection] = useState(false);
    const [playerSelectionGame, setPlayerSelectionGame] = useState<string | null>(null);
    
    const [showPasswordVerification, setShowPasswordVerification] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const [showTournamentRegistration, setShowTournamentRegistration] = useState(false);
    const [tournamentPlayers, setTournamentPlayers] = useState(3);
    const [selectedTournamentParticipants, setSelectedTournamentParticipants] = useState<SelectedPlayer[]>([]);
    const [tournamentVerifyingUser, setTournamentVerifyingUser] = useState<SelectedPlayer | null>(null);
    const [tournamentVerifyPassword, setTournamentVerifyPassword] = useState('');
    const [tournamentVerifyError, setTournamentVerifyError] = useState('');
    
    const [showAddFriends, setShowAddFriends] = useState(false);
    const [users, setUsers] = useState<SelectedPlayer[]>([]);
    const [allUsers, setAllUsers] = useState<SelectedPlayer[]>([]);

    const navigate = useNavigate();
    const { user, logout } = useUser();
    const { selectedPlayer, setSelectedPlayer } = useSelectedPlayer();

    useEffect(() => {
        setSelectedPlayer(null);
    }, [setSelectedPlayer]);

    useEffect(() => {
        if (user?.email) {
        fetch(`https://localhost:8443/users/except/${encodeURIComponent(user.email)}`)
            .then(res => res.ok ? res.text() : Promise.reject(res.status))
            .then(text => {
                try {
                    const users = JSON.parse(text);
                    setUsers(users);
                    setAllUsers(users);
                } catch (err) {
                    console.error('JSON parse error:', err);
                }
            })
            .catch(err => console.error('Failed to fetch users:', err));
        }
    }, [user?.email]);

    useEffect(() => {
        if (!user) {
            navigate('/signup');
        }
    }, [user, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/signup');
    };

    const handlePlayerSelect = (player: SelectedPlayer | null) => {
        setSelectedPlayer(player);
        if (player === null) {
            setSelectedPlayer('Guest');
            if (playerSelectionGame === 'Snake') {
                navigate('./snakeGame?mode=2players');
            } else {
                navigate('./pongGame?mode=2players');
            }
        } else {
            setShowPasswordVerification(true);
            setShowPlayerSelection(false);
        }
    };

    const handlePasswordSubmit = async () => {
        try {
            const response = await fetch('https://localhost:8443/validatePasswordbyName', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: selectedPlayer!.name, password }),
            });
            if (response.ok) {
                setSelectedPlayer(selectedPlayer);
                if (playerSelectionGame === 'Snake') {
                    navigate('./snakeGame?mode=2players');
                } else {
                    navigate('./pongGame?mode=2players');
                }
            } else {
                setPasswordError('Incorrect password. Please try again.');
            }
        } catch {
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
        if (!tournamentVerifyingUser) return;
        try {
            const response = await fetch('https://localhost:8443/validatePasswordbyName', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: tournamentVerifyingUser.name, password: tournamentVerifyPassword }),
            });
            if (response.ok) {
                setSelectedTournamentParticipants(prev => [...prev, tournamentVerifyingUser]);
                setTournamentVerifyingUser(null);
                setTournamentVerifyPassword('');
                setTournamentVerifyError('');
            } else {
                setTournamentVerifyError('Incorrect password. Please try again.');
            }
        } catch {
            setTournamentVerifyError('Error verifying password. Please try again.');
        }
    };

    const getButtonsForCategory = (category: string) => {
        switch(category) {
            case 'Games':
                return [
                    { name: 'Play Pong', action: () => setSelectedCategory('Pong') },
                    { name: 'Play Snake', action: () => setSelectedCategory('Snake') }
                ];
            case 'Pong':
                return [
                    { name: 'Single', action: () => navigate('./pongGame?mode=single') },
                    { name: '2 Players', action: () => { setPlayerSelectionGame('Pong'); setShowPlayerSelection(true); setSelectedCategory(null); } },
                    { name: 'Tournaments', action: () => setShowTournamentRegistration(true) }
                ];
            case 'Snake':
                return [
                    { name: 'Single', action: () => navigate('./snakeGame?mode=single') },
                    { name: '2 Players', action: () => { setPlayerSelectionGame('Snake'); setShowPlayerSelection(true); setSelectedCategory(null); } },
                    { name: 'Tournaments', action: () => setShowTournamentRegistration(true) }
                ];
            case 'Friends':
                return [
                    { name: 'See Friends', action: () => console.log('See Friends') },
                    { name: 'Add Friend', action: async () => {
                        setShowAddFriends(true);
                        try {
                            const response = await fetch(`https://localhost:8443/users/except/${encodeURIComponent(user.email)}`);
                            if (response.ok) {
                                const users = await response.json();
                                setAllUsers(users);
                            }
                        } catch (error) {
                            console.error('Failed to fetch users:', error);
                        }
                    }},
                    { name: 'Friend Requests', action: () => console.log('Friends Requests')}
                ];
            case 'Scores':
                return [
                    { name: 'See Scores', action: () => console.log('Seeing Scores') },
                    { name: 'Reset all Scores', action: () => console.log('Reseting all scores') }
                ];
            case 'Settings':
                return [
                    { name: 'Delete Account', action: () => console.log('Deleting account') },
                    { name: 'Update data', action: () => console.log('Updating account data') },
                    { name: 'Preference', action: () => console.log('customizing preference') },
                    { name: 'Edit 2FA', action: () => console.log('Updating 2FA setting') },
                    { name: 'Logout', action: handleLogout }  // provisory location
                ];
            default:
                return [];
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-pink-grid">
                <p className="text-blue-deep font-dotgothic text-xl">
                    Redirecting...
                </p>
            </div>
        );
    }

    return (
        <main className="min-h-screen flex flex-col">
            <header className="h-40 bg-blue-deep flex">
                <div className="font-pixelify text-white text-opacity-25 text-7xl m-auto">What should we play today?</div>
            </header>
            <section className="flex-1 bg-pink-grid flex items-center justify-center">
                <div className="relative bg-pink-dark w-[825px] h-[600px] m-[10px] flex justify-between items-center px-[50px]">
                    {/* LEFT SIDE: Player Card */}
                    <div className="shadow-no-blur-50-purple-bigger bg-pink-light w-[350px] h-[500px] flex flex-col justify-between py-6">
                        <div className="font-pixelify text-white text-5xl text-center text-shadow mb-6">PLAYER INFO</div>
                        <div className="bg-pink-dark mx-[25px] h-[125px] border-purple flex flex-row justify-center items-center px-4">
                            <img src={user.avatar} alt="Avatar" className="avatar m-auto" style={{borderColor: '#7a63fe'}}/>
                            <div className="flex flex-col m-auto">
                                <div className="font-pixelify text-white text-[40px]">{user.name}</div>
                                <div className="font-dotgothic font-bold text-white text-2xl text-border-blue">700 XP</div>
                            </div>
                        </div>
                        <CategoryButtons
                            buttons={[
                                { name: 'Games', icon: arrow_icon, onClick: () => setSelectedCategory('Games') },
                                { name: 'Friends', icon: arrow_icon, onClick: () => setSelectedCategory('Friends') },
                                { name: 'Scores', icon: arrow_icon, onClick: () => setSelectedCategory('Scores') },
                                { name: 'Settings', icon: arrow_icon, className: "button-pp-blue-settings shadow-no-blur flex items-center justify-between", onClick: () => setSelectedCategory('Settings') }
                            ]}
                        />
                    </div>
                    {/* RIGHT SIDE: Content Box */}
                    <div
                        className="w-[350px] h-[500px] overflow-hidden bg-cover bg-center relative border-img"
                        style={{
                            backgroundImage: `url(${bgimage})`,
                            opacity: 0.5,
                            boxShadow: 'inset 8px 0 2px -4px rgba(0, 0, 0, 0.6), inset 0 8px 2px -4px rgba(0, 0, 0, 0.6)'
                        }}
                    >
                        <div className="absolute inset-0 overflow-y-auto">
                            {/* Game 2 Player Mode */}
                            <PlayerSelection
                                open={showPlayerSelection}
                                users={users}
                                onSelect={handlePlayerSelect}
                                onCancel={() => {
                                    setShowPlayerSelection(false);
                                    setSelectedCategory(playerSelectionGame);
                                }}
                            />
                            {/* Password Verification Modal */}
                            {showPasswordVerification && selectedPlayer && (
                                <PasswordVerification
                                    open={showPasswordVerification && !!selectedPlayer}
                                    user={selectedPlayer}
                                    password={password}
                                    error={passwordError}
                                    onPasswordChange={setPassword}
                                    onVerify={handlePasswordSubmit}
                                    onCancel={resetToPlayerSelection}
                                />
                            )}
                            {/* Tournament Registration Modal */}
                            {showTournamentRegistration && (
                            <div className="absolute inset-0 flex items-center justify-center z-20">
                                <TournamentRegistration
                                    open={showTournamentRegistration}
                                    onClose={() => setShowTournamentRegistration(false)}
                                    allUsers={allUsers}
                                    tournamentPlayers={tournamentPlayers}
                                    setTournamentPlayers={setTournamentPlayers}
                                    selectedParticipants={selectedTournamentParticipants}
                                    setSelectedParticipants={setSelectedTournamentParticipants}
                                    setVerifyingUser={setTournamentVerifyingUser}
                                    user={user}
                                />
                                {tournamentVerifyingUser && (
                                    <PasswordVerification
                                        open={!!tournamentVerifyingUser}
                                        user={tournamentVerifyingUser}
                                        password={tournamentVerifyPassword}
                                        error={tournamentVerifyError}
                                        onPasswordChange={setTournamentVerifyPassword}
                                        onVerify={handleVerifyPassword}
                                        onCancel={() => {
                                            setTournamentVerifyingUser(null);
                                            setTournamentVerifyPassword('');
                                            setTournamentVerifyError('');
                                        }}
                                    />
                                )}
                            </div>
                        )}
                            {/* Category Content */}
                            {selectedCategory && !showPlayerSelection && !showPasswordVerification && (
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col gap-4">
                                    {getButtonsForCategory(selectedCategory).map((button, index) => (
                                        <button
                                            key={index}
                                            className="button-pp-purple shadow-no-blur-60"
                                            onClick={button.action}
                                        >{button.name}</button>
                                    ))}
                                </div>
                            )}
                            {/* Add Friends Modal */}
                            {showAddFriends && (
                                <AddFriends
                                    open={showAddFriends}
                                    allUsers={allUsers}
                                    onSendRequest={user => alert(`Friend request sent to ${user.name}`)}
                                    onClose={() => setShowAddFriends(false)}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </section>
            <footer className="h-40 bg-blue-deep"></footer>
        </main>
    );
}
