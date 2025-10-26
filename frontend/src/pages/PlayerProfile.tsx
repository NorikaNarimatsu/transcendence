import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; 
import bgimage from '../assets/Player_Page.jpg';
import arrow_icon from '../assets/icons/arrow.png';
import log_out_icon from '../assets/icons/Log_out.png';

import AvatarSelection from '../components/AvatarSelection';

import { TournamentRegistration } from '../components/profileTournamentRegistration';
import { PasswordVerification } from '../components/profilePasswordVerification';
import { CategoryButtons } from '../components/profileCategoryButtons';
import { PlayerSelection } from '../components/profilePlayerSelection';
import PrivacyPolicyModal from '../components/PrivacyPolicyModal';
import { FriendsManager } from '../components/FriendsManager';

import TwoFactorSettings from '../components/2FSettings';

import { useUser} from './user/UserContext';
import type { SelectedPlayer } from  './user/PlayerContext';
import { useSelectedPlayer } from './user/PlayerContext';
import { DeleteAccount } from './user/DeleteUser';
import Button from '../components/ButtonDarkPink';

export default function PlayerProfile(): JSX.Element {
    const [isOpen, setIsOpen] = useState(false);

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
    
    const [users, setUsers] = useState<SelectedPlayer[]>([]);
    const [allUsers, setAllUsers] = useState<SelectedPlayer[]>([]);

    const friendsManagerRef = useRef<any>(null);

    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
	const [showPrivacyModal, setShowPrivacyModal] = useState(false);
	
	const [basicStats, setBasicStats] = useState<{
		wins: number;
		losses: number;
		totalMatches: number;
	} | null>(null);
	const [showBasicStats, setShowBasicStats] = useState(false);

	const [show2FASettings, setShow2FASettings] = useState(false);

    const navigate = useNavigate();
    const { user, logout } = useUser();
    const { selectedPlayer, setSelectedPlayer } = useSelectedPlayer();

    useEffect(() => {
        setSelectedPlayer(null);
    }, [setSelectedPlayer]);

    useEffect(() => {
        if (user?.userID) {
            fetch(`https://localhost:8443/users/except/${user.userID}`)
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
    }, [user?.userID]); 

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
            const response = await fetch('https://localhost:8443/validatePasswordbyUserID', {  // CHANGED: Use userID endpoint
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userID: selectedPlayer!.userID, password }),  // CHANGED: Send userID
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
            const response = await fetch('https://localhost:8443/validatePasswordbyUserID', {  // CHANGED: Use userID endpoint
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userID: tournamentVerifyingUser.userID, password: tournamentVerifyPassword }),  // CHANGED: Send userID
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

    const fetchBasicStats = async () => {
        if (!user?.userID) return;
        try {
            const response = await fetch(`https://localhost:8443/user/${user.userID}/stats`); 
            if (response.ok) {
                const data = await response.json();
                setBasicStats(data.overall);
            } else {
                console.error('Failed to fetch stats');
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };


    ///////////////// WORK IN PROGRESS //////////////////
    const [avatarUrlLocal, setAvatarUrlLocal] = useState<string | null>(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    
    useEffect(() => {
      setAvatarUrlLocal(user?.avatarUrl ?? null);
    }, [user?.avatarUrl]);
    
    const handleSelectAvatar = async (avatarUrl: string) => {
      if (!user?.userID) return;
      setUploadingAvatar(true);
      try {
        const res = await fetch('https://localhost:8443/user/updateAvatar', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userID: user.userID, avatarUrl })
        });
        console.log('SENDING THIS URL:', avatarUrl);
        if (!res.ok) {
          const text = await res.text();
          console.error('Failed to update avatar:', res.status, text);
          return;
        }
    
        setAvatarUrlLocal(avatarUrl);
        // update stored user so other parts can pick up change
        const raw = localStorage.getItem('user');
        if (raw) {
          const stored = JSON.parse(raw);
          stored.avatarUrl = avatarUrl;
          localStorage.setItem('user', JSON.stringify(stored));
          window.dispatchEvent(new CustomEvent('userUpdated', { detail: stored }));
        }
        setIsOpen(false);
      } catch (err) {
        console.error('Error updating avatar:', err);
      } finally {
        setUploadingAvatar(false);
      }
    };
    ///////////////// WORK IN PROGRESS //////////////////

    useEffect(() => {
        if (user?.userID) {
            fetchBasicStats();
        } else {
            setBasicStats(null);
            setShowBasicStats(false);
        }
    }, [user?.userID]);
    
	const downloadUserData = async () => {
		if (!user?.userID) {
			console.log('no user or userID found');
			return;
		}

		try {
			const response = await fetch ('https://localhost:8443/api/user/export-data', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ userID: user.userID })
			});

			if (response.ok) {
				const blob = await response.blob();
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `user_data_${user.name}_${new Date().toISOString().split('T')[0]}.json`;
				// document.body.appendChild(a);
				a.click();
				// document.body.removeChild(a);
				window.URL.revokeObjectURL(url);
			} else {
				const errorText = await response.text();
				console.error('Failed to download user data: ', response.status, errorText);
			}
		} catch (error) {
			console.error('Error downloading user data:', error);
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
                    { name: 'See Friends', action: () => friendsManagerRef.current?.handleSeeFriends() },
                    { name: 'Add Friend', action: () => friendsManagerRef.current?.handleAddFriendsClick() }
                ];
            case 'Dashboard':
                return [
                    { name: 'Go to Dashboard', action: () => navigate('/dashboard') },
                    // { name: 'Basic Stats', action: () => fetchBasicStats() }
                ];
            case 'Settings':
                return [
                    { name: 'Delete Account', action: () => setShowDeleteConfirmation(true) },
                    { name: 'Update data', action: () => console.log('Updating account data') },
					{ name: 'Download data', action: () => downloadUserData() },
					{ name: 'Privacy Policy', action: () => setShowPrivacyModal(true) },
                    { name: 'Edit 2FA', action: () => setShow2FASettings(true) },
                    { name: 'Language', action: () => console.log('Updating Language Setting') }, //TODO.
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
          <div className="font-pixelify text-white text-opacity-25 text-7xl m-auto">
            What should we play today?
          </div>
        </header>
        <section className="flex-1 bg-pink-grid flex items-center justify-center">
          <div className="relative bg-pink-dark w-[825px] h-[600px] m-[10px] flex justify-between items-center px-[50px]">
            {/* LEFT SIDE: Player Card */}
            <div className="shadow-no-blur-50-purple-bigger bg-pink-light w-[350px] h-[500px] flex flex-col justify-between py-6">
              <div className="font-pixelify text-white text-5xl text-center text-shadow mb-6">
                PLAYER INFO
              </div>
              <div className="bg-pink-dark mx-[25px] h-[125px] border-purple flex flex-row justify-center items-center px-4">
                <img
                  onClick={() => setIsOpen(!isOpen)}
                  src={user.avatarUrl}
                  alt="Avatar"
                  className="avatar m-auto shadow-no-blur"
                  style={{ borderColor: "#7a63fe" }}
                />
                {/* update the local strage here*/}
                <AvatarSelection
                  open={isOpen}
                  onClose={() => setIsOpen(false)}
                  onSelect={handleSelectAvatar}
                />

                <div className="flex flex-col m-auto justify-evenly">
                  <div className="font-pixelify text-white text-[40px]">
                    {user.name}
                  </div>
                  <div className="font-dotgothic font-bold text-white text-base text-border-blue -mt-1">
                    Wins: {basicStats?.wins ?? user.wins ?? 0}
                  </div>
                  <div className="font-dotgothic font-bold text-white text-base text-border-blue">
                    Losses: {basicStats?.losses ?? user.losses ?? 0}
                  </div>
                </div>
              </div>
              <CategoryButtons
                buttons={[
                  {
                    name: "Games",
                    icon: arrow_icon,
                    onClick: () => setSelectedCategory("Games"),
                  },
                  {
                    name: "Friends",
                    icon: arrow_icon,
                    onClick: () => setSelectedCategory("Friends"),
                  },
                  {
                    name: "Dashboard",
                    icon: arrow_icon,
                    onClick: () => setSelectedCategory("Dashboard"),
                  },
                  {
                    name: "Settings",
                    icon: arrow_icon,
                    className:
                      "button-pp-blue-settings shadow-no-blur flex items-center justify-between",
                    onClick: () => setSelectedCategory("Settings"),
                  },
                ]}
              />
            </div>
            {/* Delete Account Modal */}
            <DeleteAccount
              open={showDeleteConfirmation}
              onClose={() => setShowDeleteConfirmation(false)}
            />
            {/* Privacy Policy Modal */}
            <PrivacyPolicyModal
              isOpen={showPrivacyModal}
              onClose={() => setShowPrivacyModal(false)}
            />
            {/* 2FA Settings Modal */}
            {show2FASettings && user && (
              <TwoFactorSettings
                user={user}
                onClose={() => setShow2FASettings(false)}
              />
            )}
            {/* RIGHT SIDE: Content Box */}
            <div
              className="w-[350px] h-[500px] overflow-hidden bg-cover bg-center relative border-img"
              style={{
                backgroundImage: `url(${bgimage})`,
                opacity: 0.5,
                boxShadow:
                  "inset 8px 0 2px -4px rgba(0, 0, 0, 0.6), inset 0 8px 2px -4px rgba(0, 0, 0, 0.6)",
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
                      setSelectedParticipants={
                        setSelectedTournamentParticipants
                      }
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
                          setTournamentVerifyPassword("");
                          setTournamentVerifyError("");
                        }}
                      />
                    )}
                  </div>
                )}
                {/* Category Content */}
                {selectedCategory &&
                  !showPlayerSelection &&
                  !showPasswordVerification && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col gap-4">
                      {getButtonsForCategory(selectedCategory).map(
                        (button, index) => (
                          <button
                            key={button.name}
                            className="button-pp-purple shadow-no-blur-60"
                            onClick={button.action}
                          >
                            {button.name}
                          </button>
                        )
                      )}
                    </div>
                  )}
                {/* Friends Manager Component */}
                <FriendsManager ref={friendsManagerRef} user={user} />
              </div>
            </div>
          </div>
        </section>
        <footer className="h-40 bg-blue-deep flex justify-center items-center">
          <Button onClick={handleLogout} style={{ marginTop: 0 }}>
            <img
              src={log_out_icon}
              alt="Log out button"
              className="h-8 w-auto"
            />
          </Button>
        </footer>
      </main>
    );
}
