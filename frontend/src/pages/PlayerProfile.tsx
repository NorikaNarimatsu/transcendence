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

//Multiple language imports:
import { useLanguage } from '../contexts/LanguageContext';
import type { Language } from '../contexts/LanguageContext';
import { updateUserLanguage } from '../utils/languageApi';

import { UpdateUserData } from '../components/profileDataUpdate';
import { useUser} from './user/UserContext';
import type { SelectedPlayer } from  './user/PlayerContext';
import { useSelectedPlayer } from './user/PlayerContext';
import { DeleteAccount } from './user/DeleteUser';
import Button from '../components/ButtonDarkPink';

import apiCentral from '../utils/apiCentral';

export default function PlayerProfile(): JSX.Element {
    // UI State
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Game States
    const [showPlayerSelection, setShowPlayerSelection] = useState(false);
    const [playerSelectionGame, setPlayerSelectionGame] = useState<string | null>(null);
    const [showPasswordVerification, setShowPasswordVerification] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // Tournament States
    const [showTournamentRegistration, setShowTournamentRegistration] = useState(false);
    const [tournamentPlayers, setTournamentPlayers] = useState(3);
    const [selectedTournamentParticipants, setSelectedTournamentParticipants] = useState<SelectedPlayer[]>([]);
    const [tournamentVerifyingUser, setTournamentVerifyingUser] = useState<SelectedPlayer | null>(null);
    const [tournamentVerifyPassword, setTournamentVerifyPassword] = useState('');
    const [tournamentVerifyError, setTournamentVerifyError] = useState('');
    const [tournamentGameType, setTournamentGameType] = useState<'pong' | 'snake'>('pong');

    // Modal States
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [show2FASettings, setShow2FASettings] = useState(false);
    const [showUpdateData, setShowUpdateData] = useState(false);
    const [updateType, setUpdateType] = useState<'email' | 'name'>('email');

    // Data States
    const [users, setUsers] = useState<SelectedPlayer[]>([]);
    const [allUsers, setAllUsers] = useState<SelectedPlayer[]>([]);

    const friendsManagerRef = useRef<any>(null);
	
	const [basicStats, setBasicStats] = useState<{
		wins: number;
		losses: number;
		totalMatches: number;
	} | null>(null);

    const navigate = useNavigate();
    const { user, logout, setUser } = useUser();
    const { selectedPlayer, setSelectedPlayer } = useSelectedPlayer();

    const { lang, setLang, t, clearLang } = useLanguage();
    const translation = t[lang];

    const handleChangeLanguage = async (newLanguage:Language) => {
      setLang(newLanguage);
      if (user) {
        localStorage.setItem('lang', newLanguage);
      }
      try {
        const currentUserStr = localStorage.getItem('currentUser');
        if (currentUserStr){
          const currentUser = JSON.parse(currentUserStr);
          const userID = currentUser.userID;
          if(userID){
            const result = await updateUserLanguage(parseInt(userID), newLanguage);
            console.log('API response:', result);
            console.log('Language updated successfully');
          }
        }
      }catch(error){
        console.error('Error updating language:', error);
      }
    };

    useEffect(() => {
        setSelectedPlayer(null);
    }, [setSelectedPlayer]);

    useEffect(() => {
		const fetchUsers = async () => {
			if (user?.userID) {
				try {
					const response = await apiCentral.get(`/users/except/${user.userID}`);
					
					if (response.data) {
						setUsers(response.data);
						setAllUsers(response.data);
					} else if (response.error) {
						console.error('Failed to fetch users:', response.error);
					}
				} catch (error) {
					console.error('Network error: ', error);
				}
			}
		};

		fetchUsers();
    }, [user?.userID]); 

    useEffect(() => {
        if (!user) {
            navigate('/signup');
        }
    }, [user, navigate]);

    const handleLogout = () => {
        clearLang();
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
            const response = await apiCentral.post('/validatePasswordbyUserID', { userID: selectedPlayer!.userID, password });
            
			if (response.error || response.status !== 200) {
				setPasswordError(response.error || 'Incorrect password. Please try again.');
			} else if (response.data && response.data.message === 'Password is valid') {
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
            const response = await apiCentral.post('/validatePasswordbyUserID', { userID: tournamentVerifyingUser.userID, password: tournamentVerifyPassword });
            
			if (response.data) {
                setSelectedTournamentParticipants(prev => [...prev, tournamentVerifyingUser]);
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

    const fetchBasicStats = async () => {
        if (!user?.userID) return;
        try {
            const response = await apiCentral.get(`/user/${user.userID}/stats`);
            if (response.data) {
                setBasicStats(response.data.overall);
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

    // ...existing code...

const handleSelectAvatar = async (avatarUrl: string) => {
  if (!user?.userID) return;

  console.log('🔍 handleSelectAvatar called with:', avatarUrl);

  // IMPORTANT: Update local state FIRST
  setAvatarUrlLocal(avatarUrl);
  
  // Update user context
  if (user) {
    const updatedUser = { ...user, avatarUrl: avatarUrl };
    setUser(updatedUser);
    console.log('✅ User context updated:', updatedUser);
  }
  
  // // Check if it's an uploaded avatar (already saved by uploadAvatar endpoint)
  // if (avatarUrl.startsWith('/uploadAvatars/')) {
  //   console.log('✅ Uploaded avatar - database already updated by upload endpoint');
  //   return; // Don't call API again - already saved!
  // }

  // Only call updateAvatar for preset avatars (from /avatars/)
  setUploadingAvatar(true);
  try {
    const res = await apiCentral.put('/user/updateAvatar', { userID: user.userID, avatarUrl });
    console.log('SENDING THIS URL:', avatarUrl);
    
    if (!res.data) {
      console.error('Failed to update avatar:', res.error);
      return;
    }

    console.log('✅ Preset avatar updated successfully');
  } catch (err) {
    console.error('Error updating avatar:', err);
  } finally {
    setUploadingAvatar(false);
  }
};

// ...existing code...
    
    // const handleSelectAvatar = async (avatarUrl: string) => {
    //   if (!user?.userID) return;

    //    console.log('🔍 handleSelectAvatar called with:', avatarUrl);
  
    //   // IMPORTANT: Update local state FIRST
    //   setAvatarUrlLocal(avatarUrl);
      
    //   // Update user context
    //   if (user) {
    //     const updatedUser = { ...user, avatarUrl: avatarUrl };
    //     setUser(updatedUser);
    //     console.log('✅ User context updated:', updatedUser);
    //   }
      
    //   // Check if it's an uploaded avatar (already saved by uploadAvatar endpoint)
    //   if (avatarUrl.startsWith('/uploadAvatars/')) {
    //     console.log('✅ Uploaded avatar - skipping API call');
    //     return; // Don't call API again - already saved!
    //   }

    //   setUploadingAvatar(true);
    //   try {
    //     const res = await apiCentral.put('/user/updateAvatar', { userID: user.userID, avatarUrl })
    //     console.log('SENDING THIS URL:', avatarUrl);
    //     if (!res.data) {
    //       console.error('Failed to update avatar:', res.error);
    //       return;
    //     }
    
    //     setAvatarUrlLocal(avatarUrl);
    //     // Update the user context with the new avatar URL
    //     if (user) {
    //       const updatedUser = { ...user, avatarUrl: avatarUrl };
    //       setUser(updatedUser); // This will update both state and localStorage automatically
    //     }
    //   } catch (err) {
    //     console.error('Error updating avatar:', err);
    //   } finally {
    //     setUploadingAvatar(false);
    //   }
    // };


    useEffect(() => {
        if (user?.userID) {
            fetchBasicStats();
        } else {
            setBasicStats(null);
        }
    }, [user?.userID]);
    
	const downloadUserData = async () => {
		if (!user?.userID) {
			console.log('no user or userID found');
			return;
		}

		try {
			const response = await apiCentral.postBlob('/api/user/export-data', {
				userID: user.userID
			});

			if (!response) {
				return;
			}

			if (response.ok) {
				const blob = await response.blob();
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `transcendence_${user.name}_${new Date().toISOString().split('T')[0]}.json`;
				a.click();
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
                    { name: translation.pages.profile.playPong, action: () => setSelectedCategory('Pong') },
                    { name: translation.pages.profile.playSnake, action: () => setSelectedCategory('Snake') }
                ];
            case 'Pong':
                return [
                    { name: translation.pages.profile.single, action: () => navigate('./pongGame?mode=single') },
                    { name: translation.pages.profile.twoPlayers, action: () => { setPlayerSelectionGame('Pong'); setShowPlayerSelection(true); setSelectedCategory(null); } },
                    { name: translation.pages.profile.tournament, action: () => setShowTournamentRegistration(true) }
                ];
            case 'Snake':
                return [
                    { name: translation.pages.profile.single, action: () => navigate('./snakeGame?mode=single') },
                    { name: translation.pages.profile.twoPlayers, action: () => { setPlayerSelectionGame('Snake'); setShowPlayerSelection(true); setSelectedCategory(null); } },
                    { name: translation.pages.profile.tournament, action: () => { setTournamentGameType('snake'); setShowTournamentRegistration(true); } }
                ];
            case 'Friends':
                return [
                    { name: translation.pages.profile.seeFriends, action: () => friendsManagerRef.current?.handleSeeFriends() },
                    { name: translation.pages.profile.addFriends, action: () => friendsManagerRef.current?.handleAddFriendsClick() }
                ];
            case 'Dashboard':
                return [
                    { name: translation.pages.profile.goToDashboard, action: () => navigate('/dashboard') },
                ];
            case 'Settings':
                return [
                    { name: translation.pages.profile.deleteAccount, action: () => setShowDeleteConfirmation(true) },
                    { name: translation.pages.profile.updateData, action: () => setSelectedCategory('UpdateData') },
                    { name: translation.pages.profile.downloadData, action: () => downloadUserData() },
                    { name: translation.common.privacyPolicy, action: () => setShowPrivacyModal(true) },
                    { name: translation.pages.profile.edit2FA, action: () => setShow2FASettings(true) },
                    { name: translation.pages.profile.language, action: () => setSelectedCategory('Language') },
                ];
            case 'Language':
                return [
                    { name: translation.pages.profile.english, action: () => handleChangeLanguage("en") },
                    { name: translation.pages.profile.portuguese, action: () => handleChangeLanguage("pt") },
                    { name: translation.pages.profile.polish, action: () => handleChangeLanguage("pl") },
                ];
            case 'UpdateData':
                return [
                    { name: 'Update Email', action: () => { setUpdateType('email'); setShowUpdateData(true); } },
                    { name: 'Update Nickname', action: () => { setUpdateType('name'); setShowUpdateData(true); } },
                ];
            case 'UpdateData':
                return [
                    { name: 'Update Email', action: () => { setUpdateType('email'); setShowUpdateData(true); } },
                    { name: 'Update Nickname', action: () => { setUpdateType('name'); setShowUpdateData(true); } },
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
            {translation.pages.profile.questionHeader}
          </div>
        </header>
        <section className="flex-1 bg-pink-grid flex items-center justify-center">
          <div className="relative bg-pink-dark w-[825px] h-[600px] m-[10px] flex justify-between items-center px-[50px]">
            {/* LEFT SIDE: Player Card */}
            <div className="shadow-no-blur-50-purple-bigger bg-pink-light w-[350px] h-[500px] flex flex-col justify-between py-6">
              <div className="font-pixelify text-white text-5xl text-center text-shadow mb-6">
                {translation.pages.profile.playerInfo}
              </div>
              <div className="bg-pink-dark mx-[25px] h-[125px] border-purple flex flex-row justify-center items-center px-4">
                <img
                  onClick={() => {
                    console.log('Avatar clicked, current isOpen:', isOpen);
                    setIsOpen(!isOpen);
                  }}
                  src={user.avatarUrl}
                  alt="Avatar"
                  className="avatar m-auto shadow-no-blur cursor-pointer"
                  style={{ borderColor: "#7a63fe" }}
                />
                {/* update the local storage here*/}
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
                    {translation.pages.profile.wins}: {basicStats?.wins ?? user.wins ?? 0}
                  </div>
                  <div className="font-dotgothic font-bold text-white text-base text-border-blue">
                    {translation.pages.profile.losses}: {basicStats?.losses ?? user.losses ?? 0}
                  </div>
                </div>
              </div>
              <CategoryButtons
                buttons={[
                  {
                    name: translation.pages.profile.games,
                    icon: arrow_icon,
                    onClick: () => setSelectedCategory("Games"),
                  },
                  {
                    name: translation.pages.profile.friends,
                    icon: arrow_icon,
                    onClick: () => setSelectedCategory("Friends"),
                  },
                  {
                    name: translation.pages.profile.dashboard,
                    icon: arrow_icon,
                    onClick: () => navigate('/dashboard'),
                  },
                  {
                    name: translation.pages.profile.settings,
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
            {/* Update User Data Modal */}
            <UpdateUserData
                open={showUpdateData}
                onClose={() => setShowUpdateData(false)}
                updateType={updateType}
            />

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
                                    gameType={tournamentGameType}
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
                            className="button-pp-purple shadow-no-blur-60 !text-lg"
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
