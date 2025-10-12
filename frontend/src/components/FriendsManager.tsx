import { useState, forwardRef, useImperativeHandle } from 'react';
import { AddFriends } from './profileAddFriends';
import type { SelectedPlayer } from '../pages/user/PlayerContext';
import type { User } from '../pages/user/UserContext'; 

interface FriendsManagerProps {
    user: User;
}

export interface FriendsManagerHandle {
    handleSeeFriends: () => void;
    handleAddFriendsClick: () => void;
}

export const FriendsManager = forwardRef<FriendsManagerHandle, FriendsManagerProps>(
    ({ user }, ref) => {
        // Just UI state - no data storage
        const [showFriendsList, setShowFriendsList] = useState(false);
        const [showAddFriends, setShowAddFriends] = useState(false);
        const [friends, setFriends] = useState<SelectedPlayer[]>([]);
        const [availableUsers, setAvailableUsers] = useState<SelectedPlayer[]>([]);
        const [loading, setLoading] = useState(false);

        const handleSeeFriends = async () => {
            setShowFriendsList(true);
            setLoading(true);
            
            try {
                const response = await fetch(`https://localhost:8443/friends/userID/${user.userID}`);
                if (response.ok) {
                    const friendsData = await response.json();
                    setFriends(friendsData);
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
                const friendsResponse = await fetch(`https://localhost:8443/friends/userID/${user.userID}`);
                if (friendsResponse.ok) {
                    const currentFriends = await friendsResponse.json();
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
                const response = await fetch('https://localhost:8443/friends/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user1ID: user.userID,
                        user2ID: friend.userID
                    }),
                });

                if (response.ok) {
                    alert(`${friend.name} added to friends!`);
                    setShowAddFriends(false);
                } else {
                    const errorData = await response.json();
                    alert(errorData.message || 'Failed to add friend');
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
                {/* Add Friends Modal */}
                {showAddFriends && (
                    <AddFriends
                        open={showAddFriends}
                        allUsers={availableUsers}
                        onSendRequest={handleAddFriend}
                        onClose={() => setShowAddFriends(false)}
                    />
                )}

                {/* Friends List Modal */}
                {showFriendsList && (
                    <div className="absolute inset-0 bg-white bg-opacity-10 flex items-center justify-center z-30">
                        <div className="bg-pink-light p-6 rounded-lg max-h-[400px] overflow-y-auto w-[300px]">
                            <h3 className="font-pixelify text-blue-deep text-2xl mb-4 text-center">My Friends</h3>
                            
                            {loading ? (
                                <p className="text-blue-deep font-dotgothic text-center">Loading...</p>
                            ) : (
                                <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto">
                                    {friends.length === 0 ? (
                                        <p className="text-blue-deep font-dotgothic text-center">No friends yet!</p>
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
                                                {friend.name}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                            
                            <button
                                onClick={() => setShowFriendsList(false)}
                                className="w-full px-4 py-2 bg-gray-500 text-white font-pixelify rounded hover:bg-gray-600 transition-colors mt-4"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </>
        );
    }
);

FriendsManager.displayName = 'FriendsManager';