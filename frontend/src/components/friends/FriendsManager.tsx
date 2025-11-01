import { useState, forwardRef, useImperativeHandle } from 'react';
import type { SelectedPlayer } from '../../pages/user/PlayerContext';
import apiCentral from '../utils/apiCentral';
import type { User } from '../../pages/user/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import { tr } from 'zod/locales';

interface FriendsManagerProps {
    user: User;
}

export interface FriendsManagerHandle {
    handleSeeFriends: () => void;
    handleAddFriendsClick: () => void;
}

export const FriendsManager = forwardRef<FriendsManagerHandle, FriendsManagerProps>(
    ({ user }, ref) => {
        // UI state
        const [showFriendsList, setShowFriendsList] = useState(false);
        const [showAddFriends, setShowAddFriends] = useState(false);
        const [friends, setFriends] = useState<SelectedPlayer[]>([]);
        const [availableUsers, setAvailableUsers] = useState<SelectedPlayer[]>([]);
        const [loading, setLoading] = useState(false);
        
        // UPDATED: Success popup state - store friend object instead of message
        const [showSuccessPopup, setShowSuccessPopup] = useState(false);
        const [addedFriend, setAddedFriend] = useState<SelectedPlayer | null>(null);

        const { lang, t } = useLanguage();
        const translation = t[lang];

        const handleSeeFriends = async () => {
            setShowFriendsList(true);
            setLoading(true);
            
            try {
                const response = await apiCentral.get(`/friends/userID/${user.userID}`);
                if (response.data) {
                    setFriends(response.data);
                } else {
                    setFriends([]);
                }
            } catch (error) {
                console.error('Failed to fetch friends:', error);
                setFriends([]);
            } finally {
                setLoading(false);
            }
        };

        const handleAddFriendsClick = async () => {
            setShowAddFriends(true);
            setLoading(true);
            
            try {
                // Get all users except current user
                const usersResponse = await fetch(`https://localhost:8443/users/except/${user.userID}`);
                if (!usersResponse.ok) {
                    setAvailableUsers([]);
                    setLoading(false);
                    return;
                }
                
                const allUsers = await usersResponse.json();
                
                // Get current friends to filter out
                const friendsResponse = await apiCentral.get(`/friends/userID/${user.userID}`);
                if (friendsResponse.data) {
                    const currentFriends = friendsResponse.data;
                    const friendIds = currentFriends.map((friend: SelectedPlayer) => friend.userID);
                    
                    // Filter out existing friends
                    const available = allUsers.filter((user: SelectedPlayer) => 
                        !friendIds.includes(user.userID)
                    );
                    setAvailableUsers(available);
                } else {
                    setAvailableUsers(allUsers);
                }
            } catch (error) {
                console.error('Failed to fetch users:', error);
                setAvailableUsers([]);
            } finally {
                setLoading(false);
            }
        };

        const handleAddFriend = async (friend: SelectedPlayer) => {
            try {
                const response = await apiCentral.post('/friends/add', {
                    user1ID: user.userID,
                    user2ID: friend.userID
                });

                if (response.data) {
                    // UPDATED: Store friend object and remove timeout
                    setAddedFriend(friend);
                    setShowSuccessPopup(true);
                    setShowAddFriends(false);
                    // REMOVED: No more auto-hide timeout
                } else {
                    alert(response.error || 'Failed to add friend');
                }
            } catch (error) {
                console.error('Failed to add friend:', error);
                alert('Failed to add friend');
            }
        };

        useImperativeHandle(ref, () => ({
            handleSeeFriends,
            handleAddFriendsClick,
        }));

        return (
            <>
                {/* UPDATED: Success Popup Modal with Avatar */}
                {showSuccessPopup && addedFriend && (
                    <div className="absolute inset-0 bg-white bg-opacity-10 flex items-center justify-center z-40">
                        <div className="bg-pink-light p-8 rounded-lg shadow-no-blur-60 border-4 border-blue-deep">
                            <div className="text-center">
                                <h3 className="font-pixelify text-blue-deep text-2xl mb-4">{translation.common.success}!</h3>
                                
                                {/* NEW: Friend's Avatar and Name */}
                                <div className="flex items-center justify-center gap-3 mb-6">
                                    {addedFriend.avatarUrl && (
                                        <img 
                                            src={addedFriend.avatarUrl}
                                            alt={addedFriend.name} 
                                            className="w-8 h-8 rounded-full object-cover border-2 border-blue-deep"
                                        />
                                    )}
                                    <p className="font-dotgothic text-blue-deep text-lg">
                                        <span className="font-pixelify">{addedFriend.name}</span> {translation.pages.profile.addedToFriends}!
                                    </p>
                                </div>
                                
                                <button
                                    onClick={() => {
                                        setShowSuccessPopup(false);
                                        setAddedFriend(null);
                                    }}
                                    className="px-6 py-3 bg-blue-deep text-white font-pixelify rounded hover:bg-blue-medium transition-colors shadow-no-blur-30"
                                >
                                    {translation.pages.profile.awesome}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ADD FRIENDS MODAL */}
                {showAddFriends && (
                    <div className="absolute inset-0 bg-white bg-opacity-10 flex items-center justify-center z-30">
                        <div className="bg-pink-light p-6 rounded-lg max-h-[400px] overflow-y-auto w-[300px]">
                            <h3 className="font-pixelify text-blue-deep text-2xl mb-4 text-center">{translation.pages.profile.addFriends}</h3>
                            
                            {loading ? (
                                <p className="text-blue-deep font-dotgothic text-center">{translation.common.loading}</p>
                            ) : (
                                <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto">
                                    {availableUsers.length === 0 ? (
                                        <p className="text-blue-deep font-dotgothic text-center">{translation.pages.profile.noUsersAvailableToAdd}</p>
                                    ) : (
                                        availableUsers.map((user) => (
                                            <button
                                                key={user.userID}
                                                className="px-4 py-2 bg-blue-light text-blue-deep font-pixelify rounded hover:bg-blue-medium transition-colors flex items-center gap-2"
                                                onClick={() => handleAddFriend(user)}
                                            >
                                                {user.avatarUrl && (
                                                    <img 
                                                        src={user.avatarUrl}
                                                        alt={user.name} 
                                                        className="w-6 h-6 rounded-full object-cover"
                                                    />
                                                )}
                                                {user.name}
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                            
                            <button
                                onClick={() => setShowAddFriends(false)}
                                className="w-full px-4 py-2 bg-gray-500 text-white font-pixelify rounded hover:bg-gray-600 transition-colors mt-4"
                            >
                                {translation.common.cancel}
                            </button>
                        </div>
                    </div>
                )}

                {/* FRIENDS LIST MODAL */}
                {showFriendsList && (
                    <div className="absolute inset-0 bg-white bg-opacity-10 flex items-center justify-center z-30">
                        <div className="bg-pink-light p-6 rounded-lg max-h-[400px] overflow-y-auto w-[300px]">
                            <h3 className="font-pixelify text-blue-deep text-2xl mb-4 text-center">{translation.pages.profile.myFriends}</h3>
                            
                            {loading ? (
                                <p className="text-blue-deep font-pixelify text-center">{translation.common.loading}</p>
                            ) : (
                                <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto">
                                    {friends.length === 0 ? (
                                        <p className="text-blue-deep font-pixelify text-center">{translation.pages.profile.noFriendsYet}</p>
                                    ) : (
                                        friends.map((friend) => (
                                            <div
                                                key={friend.userID}
                                                className="px-4 py-2 bg-blue-light text-blue-deep font-pixelify rounded flex items-center gap-2"
                                            >
                                                {friend.avatarUrl && (
                                                    <img 
                                                        src={friend.avatarUrl}
                                                        alt={friend.name} 
                                                        className="w-6 h-6 rounded-full object-cover"
                                                    />
                                                )}
                                                <div className="flex flex-col">
                                                    <span className="font-pixelify text-blue-deep">{friend.name}</span>
                                                    {friend.lastLoginedAt && (
                                                        <span className="font-dotgothic text-xs text-blue-medium opacity-75">
                                                            Last seen: {new Date(friend.lastLoginedAt).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                            
                            <button
                                onClick={() => setShowFriendsList(false)}
                                className="w-full px-4 py-2 bg-gray-500 text-white font-pixelify rounded hover:bg-gray-600 transition-colors mt-4"
                            >
                                {translation.common.close}
                            </button>
                        </div>
                    </div>
                )}
            </>
        );
    }
);

FriendsManager.displayName = 'FriendsManager';