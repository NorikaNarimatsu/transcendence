import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ===== COMPONENTS =====
import { PlayerInfoCard } from '../components/PlayerProfileInfoCard';
import { ProfileHeader } from '../components/PlayerProfileHeader';
import { ProfileFooter } from '../components/PlayerProfileFooter';
import { PlayerContents } from '../components/PlayerProfileContents';

// ===== CONTEXTS & TYPES =====
import { useUser } from './user/UserContext';
import type { SelectedPlayer } from './user/PlayerContext';
import { useSelectedPlayer } from './user/PlayerContext';

// ===== CUSTOM HOOKS =====
import { useUsers, useBasicStats, useUserDataDownload } from '../hooks/useProfileData';

export default function PlayerProfile(): JSX.Element {
    // ===== NAVIGATION STATE =====
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    
    // ===== PLAYER SELECTION STATE =====
    const [showPlayerSelection, setShowPlayerSelection] = useState(false);
    const [playerSelectionGame, setPlayerSelectionGame] = useState<string | null>(null);
    
    // ===== PASSWORD VERIFICATION STATE =====
    const [showPasswordVerification, setShowPasswordVerification] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // ===== TOURNAMENT STATE =====
    const [showTournamentRegistration, setShowTournamentRegistration] = useState(false);
    const [tournamentPlayers, setTournamentPlayers] = useState(3);
    const [selectedTournamentParticipants, setSelectedTournamentParticipants] = useState<SelectedPlayer[]>([]);
    const [tournamentVerifyingUser, setTournamentVerifyingUser] = useState<SelectedPlayer | null>(null);
    const [tournamentVerifyPassword, setTournamentVerifyPassword] = useState('');
    const [tournamentVerifyError, setTournamentVerifyError] = useState('');
    const [tournamentGameType, setTournamentGameType] = useState<'pong' | 'snake'>('pong');

    // ===== MODAL STATE =====
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [show2FASettings, setShow2FASettings] = useState(false);

    // ===== CORE HOOKS =====
    const navigate = useNavigate();
    const { user, logout, setUser } = useUser();
    const { selectedPlayer, setSelectedPlayer } = useSelectedPlayer();
    
    // ===== DATA FETCHING HOOKS =====
    const { users, allUsers } = useUsers(user?.userID);
    const { basicStats } = useBasicStats(user?.userID);
    const { downloadUserData } = useUserDataDownload();

    // ===== INITIALIZATION EFFECTS =====
    // Initialize selected player
    useEffect(() => {
        setSelectedPlayer(null);
    }, [setSelectedPlayer]);

    // Redirect if no user
    useEffect(() => {
        if (!user) {
            navigate('/signup');
        }
    }, [user, navigate]);

    // ===== CORE EVENT HANDLERS =====
    const handleLogout = () => {
        logout();
        navigate('/signup');
    };

    const handleAvatarUpdate = (avatarUrl: string) => {
        if (user) {
            const updatedUser = { ...user, avatarUrl: avatarUrl };
            setUser(updatedUser);
        }
    };

    // ===== NAVIGATION HANDLERS =====
    const handleNavigate = (path: string) => {
        if (path === 'Pong' || path === 'Snake') {
            setSelectedCategory(path);
        } else {
            navigate(path);
        }
    };

    // ===== PLAYER SELECTION HANDLERS =====
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

    const handlePlayerSelection = (game: string) => {
        setPlayerSelectionGame(game);
        setShowPlayerSelection(true);
        setSelectedCategory(null);
    };

    // ===== PASSWORD VERIFICATION HANDLERS =====
    const handlePasswordSubmit = async () => {
        try {
            const response = await fetch('https://localhost:8443/validatePasswordbyUserID', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userID: selectedPlayer!.userID, password }),
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

    // ===== TOURNAMENT HANDLERS =====
    const handleVerifyPassword = async () => {
        if (!tournamentVerifyingUser) return;
        try {
            const response = await fetch('https://localhost:8443/validatePasswordbyUserID', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userID: tournamentVerifyingUser.userID, password: tournamentVerifyPassword }),
            });
            if (response.ok) {
                setSelectedTournamentParticipants((prev: SelectedPlayer[]) => [...prev, tournamentVerifyingUser]);
                console.log('Added to tournament:', tournamentVerifyingUser);
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

    const handleTournamentStart = (gameType: 'pong' | 'snake') => {
        setTournamentGameType(gameType);
        setShowTournamentRegistration(true);
    };

    // ===== FRIENDS HANDLERS =====
    const handleFriendsAction = () => {
        // This will be handled by ContentArea internally
    };    
    // ===== EARLY RETURN FOR UNAUTHENTICATED USER =====
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-pink-grid">
                <p className="text-blue-deep font-dotgothic text-xl">
                    Redirecting...
                </p>
            </div>
        );
    }

    // ===== COMPONENT RENDER =====
    return (
        <main className="min-h-screen flex flex-col">
            {/* Header Section */}
            <ProfileHeader />
            
            {/* Main Content Section */}
            <section className="flex-1 bg-pink-grid flex items-center justify-center">
                <div className="relative bg-pink-dark w-[825px] h-[600px] m-[10px] flex justify-between items-center px-[50px]">
                    
                    {/* Left Side: Player Info Card */}
                    <PlayerInfoCard
                        user={user}
                        basicStats={basicStats}
                        onCategorySelect={setSelectedCategory}
                        onAvatarUpdate={handleAvatarUpdate}
                    />
                    
                    {/* Right Side: Dynamic Content Area */}
                    <PlayerContents
                        // === UI STATE PROPS ===
                        selectedCategory={selectedCategory}
                        showPlayerSelection={showPlayerSelection}
                        playerSelectionGame={playerSelectionGame}
                        showPasswordVerification={showPasswordVerification}
                        password={password}
                        passwordError={passwordError}
                        
                        // === TOURNAMENT STATE PROPS ===
                        showTournamentRegistration={showTournamentRegistration}
                        tournamentPlayers={tournamentPlayers}
                        selectedTournamentParticipants={selectedTournamentParticipants}
                        tournamentVerifyingUser={tournamentVerifyingUser}
                        tournamentVerifyPassword={tournamentVerifyPassword}
                        tournamentVerifyError={tournamentVerifyError}
                        tournamentGameType={tournamentGameType}
                        
                        // === MODAL STATE PROPS ===
                        showDeleteConfirmation={showDeleteConfirmation}
                        showPrivacyModal={showPrivacyModal}
                        show2FASettings={show2FASettings}
                        
                        // === USER DATA PROPS ===
                        user={user}
                        users={users}
                        allUsers={allUsers}
                        selectedPlayer={selectedPlayer}
                        
                        // === PLAYER SELECTION HANDLERS ===
                        onPlayerSelect={handlePlayerSelect}
                        onPlayerSelection={handlePlayerSelection}
                        
                        // === PASSWORD VERIFICATION HANDLERS ===
                        onPasswordSubmit={handlePasswordSubmit}
                        onPasswordChange={setPassword}
                        onResetToPlayerSelection={resetToPlayerSelection}
                        
                        // === TOURNAMENT HANDLERS ===
                        onVerifyTournamentPassword={handleVerifyPassword}
                        onTournamentClose={() => setShowTournamentRegistration(false)}
                        onSetTournamentPlayers={setTournamentPlayers}
                        onSetSelectedTournamentParticipants={setSelectedTournamentParticipants}
                        onSetTournamentVerifyingUser={setTournamentVerifyingUser}
                        onSetTournamentVerifyPassword={setTournamentVerifyPassword}
                        onSetTournamentVerifyError={setTournamentVerifyError}
                        onTournamentStart={handleTournamentStart}
                        
                        // === MODAL HANDLERS ===
                        onCloseDeleteConfirmation={() => setShowDeleteConfirmation(false)}
                        onClosePrivacyModal={() => setShowPrivacyModal(false)}
                        onClose2FASettings={() => setShow2FASettings(false)}
                        onShowDeleteConfirmation={() => setShowDeleteConfirmation(true)}
                        onShowPrivacyModal={() => setShowPrivacyModal(true)}
                        onShow2FASettings={() => setShow2FASettings(true)}
                        
                        // === NAVIGATION HANDLERS ===
                        onNavigate={handleNavigate}
                        onFriendsAction={handleFriendsAction}
                        onDownloadUserData={() => downloadUserData(user)}
                    />
                </div>
            </section>
            
            {/* Footer Section */}
            <ProfileFooter onLogout={handleLogout} />
        </main>
    );
}
