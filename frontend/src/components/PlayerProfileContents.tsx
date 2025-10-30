import React, { useRef } from 'react';
import { PlayerSelection } from './profile/profilePlayerSelection';
import { PasswordVerification } from './profile/profilePasswordVerification';
import { TournamentRegistration } from './profile/profileTournamentRegistration';
import { DeleteAccount } from '../pages/user/DeleteUser';
import PrivacyPolicyModal from './privacy_security/PrivacyPolicyModal';
import TwoFactorSettings from './privacy_security/2FSettings';
import { FriendsManager } from './friends/FriendsManager';

// ===== CATEGORY-SPECIFIC BUTTON COMPONENTS =====
import { GamesButtons } from './games/GamesButtons';
import { PongButtons } from './games/PongButtons';
import { SnakeButtons } from './games/SnakeButtons';
import { FriendsButtons } from './friends/FriendsButtons';
import { DashboardButtons } from './dashboard/DashboardButtons';
import { SettingsButtons } from './settings/SettingsButtons';

// import bgimage from '../assets/Player_Page.jpg';
const bgimage = '/src/assets/Player_Page.jpg'; // Temporary fix for build issue
import type { SelectedPlayer } from '../pages/user/PlayerContext';

interface User {
    userID: string;
    name: string;
    avatarUrl: string;
    wins?: number;
    losses?: number;
}

interface PlayerContentsProps {
    // === UI STATE PROPS ===
    selectedCategory: string | null;
    showPlayerSelection: boolean;
    playerSelectionGame: string | null;
    showPasswordVerification: boolean;
    password: string;
    passwordError: string;
    
    // === TOURNAMENT STATE PROPS ===
    showTournamentRegistration: boolean;
    tournamentPlayers: number;
    selectedTournamentParticipants: SelectedPlayer[];
    tournamentVerifyingUser: SelectedPlayer | null;
    tournamentVerifyPassword: string;
    tournamentVerifyError: string;
    tournamentGameType: 'pong' | 'snake';
    
    // === MODAL STATE PROPS ===
    showDeleteConfirmation: boolean;
    showPrivacyModal: boolean;
    show2FASettings: boolean;
    
    // === USER DATA PROPS ===
    user: User;
    users: SelectedPlayer[];
    allUsers: SelectedPlayer[];
    selectedPlayer: SelectedPlayer | null;
    
    // === PLAYER SELECTION HANDLERS ===
    onPlayerSelect: (player: SelectedPlayer | null) => void;
    onPlayerSelection: (game: string) => void;
    
    // === PASSWORD VERIFICATION HANDLERS ===
    onPasswordSubmit: () => void;
    onPasswordChange: (password: string) => void;
    onResetToPlayerSelection: () => void;
    
    // === TOURNAMENT HANDLERS ===
    onVerifyTournamentPassword: () => void;
    onTournamentClose: () => void;
    onSetTournamentPlayers: (count: number) => void;
    onSetSelectedTournamentParticipants: (participants: SelectedPlayer[]) => void;
    onSetTournamentVerifyingUser: (user: SelectedPlayer | null) => void;
    onSetTournamentVerifyPassword: (password: string) => void;
    onSetTournamentVerifyError: (error: string) => void;
    onTournamentStart: (gameType: 'pong' | 'snake') => void;
    
    // === MODAL HANDLERS ===
    onCloseDeleteConfirmation: () => void;
    onClosePrivacyModal: () => void;
    onClose2FASettings: () => void;
    onShowDeleteConfirmation: () => void;
    onShowPrivacyModal: () => void;
    onShow2FASettings: () => void;
    
    // === NAVIGATION HANDLERS ===
    onNavigate: (path: string) => void;
    onFriendsAction: (action: 'see' | 'add') => void;
    onDownloadUserData: () => void;
}

export const PlayerContents: React.FC<PlayerContentsProps> = ({
    // === UI STATE PROPS ===
    selectedCategory,
    showPlayerSelection,
    playerSelectionGame,
    showPasswordVerification,
    password,
    passwordError,
    
    // === TOURNAMENT STATE PROPS ===
    showTournamentRegistration,
    tournamentPlayers,
    selectedTournamentParticipants,
    tournamentVerifyingUser,
    tournamentVerifyPassword,
    tournamentVerifyError,
    tournamentGameType,
    
    // === MODAL STATE PROPS ===
    showDeleteConfirmation,
    showPrivacyModal,
    show2FASettings,
    
    // === USER DATA PROPS ===
    user,
    users,
    allUsers,
    selectedPlayer,
    
    // === PLAYER SELECTION HANDLERS ===
    onPlayerSelect,
    onPlayerSelection,
    
    // === PASSWORD VERIFICATION HANDLERS ===
    onPasswordSubmit,
    onPasswordChange,
    onResetToPlayerSelection,
    
    // === TOURNAMENT HANDLERS ===
    onVerifyTournamentPassword,
    onTournamentClose,
    onSetTournamentPlayers,
    onSetSelectedTournamentParticipants,
    onSetTournamentVerifyingUser,
    onSetTournamentVerifyPassword,
    onSetTournamentVerifyError,
    onTournamentStart,
    
    // === MODAL HANDLERS ===
    onCloseDeleteConfirmation,
    onClosePrivacyModal,
    onClose2FASettings,
    onShowDeleteConfirmation,
    onShowPrivacyModal,
    onShow2FASettings,
    
    // === NAVIGATION HANDLERS ===
    onNavigate,
    onFriendsAction,
    onDownloadUserData
}) => {
    const friendsManagerRef = useRef<any>(null);

    // ===== CATEGORY BUTTON RENDERERS =====
    const renderCategoryButtons = () => {
        if (!selectedCategory || showPlayerSelection || showPasswordVerification) {
            return null;
        }

        switch (selectedCategory) {
            case 'Games':
                return (
                    <GamesButtons
                        onSelectGame={(game) => onNavigate(game)}
                    />
                );
                
            case 'Pong':
                return (
                    <PongButtons
                        onSinglePlayer={() => onNavigate('./pongGame?mode=single')}
                        onTwoPlayers={() => onPlayerSelection('Pong')}
                        onTournament={() => onTournamentStart('pong')}
                    />
                );
                
            case 'Snake':
                return (
                    <SnakeButtons
                        onSinglePlayer={() => onNavigate('./snakeGame?mode=single')}
                        onTwoPlayers={() => onPlayerSelection('Snake')}
                        onTournament={() => onTournamentStart('snake')}
                    />
                );
                
            case 'Friends':
                return (
                    <FriendsButtons
                        onSeeFriends={() => friendsManagerRef.current?.handleSeeFriends()}
                        onAddFriend={() => friendsManagerRef.current?.handleAddFriendsClick()}
                    />
                );
                
            case 'Dashboard':
                return (
                    <DashboardButtons
                        onGoToDashboard={() => onNavigate('/dashboard')}
                    />
                );
                
            case 'Settings':
                return (
                    <SettingsButtons
                        onDeleteAccount={onShowDeleteConfirmation}
                        onUpdateData={() => console.log('Updating account data')}
                        onDownloadData={onDownloadUserData}
                        onPrivacyPolicy={onShowPrivacyModal}
                        onEdit2FA={onShow2FASettings}
                        onLanguage={() => console.log('Updating Language Setting')}
                    />
                );
                
            default:
                return null;
        }
    };

    return (
        <>
            {/* ===== GLOBAL MODALS ===== */}
            <DeleteAccount
                open={showDeleteConfirmation}
                onClose={onCloseDeleteConfirmation}
            />
            
            <PrivacyPolicyModal
                isOpen={showPrivacyModal}
                onClose={onClosePrivacyModal}
            />
            
            {show2FASettings && user && (
                <TwoFactorSettings
                    user={user}
                    onClose={onClose2FASettings}
                />
            )}

            {/* ===== RIGHT SIDE CONTENT BOX ===== */}
            <div
                className="w-[350px] h-[500px] overflow-hidden bg-cover bg-center relative border-img"
                style={{
                    backgroundImage: `url(${bgimage})`,
                    opacity: 0.5,
                    boxShadow: "inset 8px 0 2px -4px rgba(0, 0, 0, 0.6), inset 0 8px 2px -4px rgba(0, 0, 0, 0.6)",
                }}
            >
                <div className="absolute inset-0 overflow-y-auto">
                    {/* ===== PLAYER SELECTION MODAL ===== */}
                    <PlayerSelection
                        open={showPlayerSelection}
                        users={users}
                        onSelect={onPlayerSelect}
                        onCancel={() => onPlayerSelection(playerSelectionGame || '')}
                    />
                    
                    {/* ===== PASSWORD VERIFICATION MODAL ===== */}
                    {showPasswordVerification && selectedPlayer && (
                        <PasswordVerification
                            open={showPasswordVerification && !!selectedPlayer}
                            user={selectedPlayer}
                            password={password}
                            error={passwordError}
                            onPasswordChange={onPasswordChange}
                            onVerify={onPasswordSubmit}
                            onCancel={onResetToPlayerSelection}
                        />
                    )}
                    
                    {/* ===== TOURNAMENT REGISTRATION MODAL ===== */}
                    {showTournamentRegistration && (
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                            <TournamentRegistration
                                open={showTournamentRegistration}
                                onClose={onTournamentClose}
                                allUsers={allUsers}
                                tournamentPlayers={tournamentPlayers}
                                setTournamentPlayers={onSetTournamentPlayers}
                                selectedParticipants={selectedTournamentParticipants}
                                setSelectedParticipants={onSetSelectedTournamentParticipants}
                                setVerifyingUser={onSetTournamentVerifyingUser}
                                user={user}
                                gameType={tournamentGameType}
                            />
                            {tournamentVerifyingUser && (
                                <PasswordVerification
                                    open={!!tournamentVerifyingUser}
                                    user={tournamentVerifyingUser}
                                    password={tournamentVerifyPassword}
                                    error={tournamentVerifyError}
                                    onPasswordChange={onSetTournamentVerifyPassword}
                                    onVerify={onVerifyTournamentPassword}
                                    onCancel={() => {
                                        onSetTournamentVerifyingUser(null);
                                        onSetTournamentVerifyPassword('');
                                        onSetTournamentVerifyError('');
                                    }}
                                />
                            )}
                        </div>
                    )}
                    
                    {/* ===== CATEGORY-SPECIFIC BUTTONS ===== */}
                    {renderCategoryButtons()}
                    
                    {/* ===== FRIENDS MANAGER COMPONENT ===== */}
                    <FriendsManager ref={friendsManagerRef} user={user} />
                </div>
            </div>
        </>
    );
};