import { useState, forwardRef, useImperativeHandle } from 'react';
import { AddFriends } from './profileAddFriends';
import type { SelectedPlayer } from '../pages/user/PlayerContext';

interface User {
    name: string;
    email: string;
    avatar: string;
}

interface FriendsManagerProps {
    user: User;
    allUsers: SelectedPlayer[];
    setAllUsers: (users: SelectedPlayer[]) => void;
}

export interface FriendsManagerHandle {
    handleSeeFriends: () => void;
    handleAddFriendsClick: () => void;
}

export const FriendsManager = forwardRef<FriendsManagerHandle, FriendsManagerProps>(
    ({ user, allUsers, setAllUsers }, ref) => {
        const [friends, setFriends] = useState<SelectedPlayer[]>([]);
        const [showFriendsList, setShowFriendsList] = useState(false);
        const [showAddFriends, setShowAddFriends] = useState(false);

        const fetchFriends = async () => {
            try {
                console.log('Fetching friends for user:', user.name);
                const response = await fetch(`https://localhost:8443/friends/name/${encodeURIComponent(user.name)}`);
                if (response.ok) {
                    const friendsData = await response.json();
                    console.log('Friends data received:', friendsData);
                    setFriends(friendsData);
                } else {
                    console.error('Failed to fetch friends:', response.status);
                }
            } catch (error) {
                console.error('Failed to fetch friends:', error);
            }
        };

        const handleAddFriend = async (friend: SelectedPlayer) => {
            try {
                console.log('Current user:', user);
                console.log('Adding friend:', friend);
                
                const response = await fetch('https://localhost:8443/friends/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userName: user.name,
                        friendUserID: friend.id
                    }),
                });

                if (response.ok) {
                    alert(`${friend.name} has been added to your friends!`);
                    setShowAddFriends(false);
                } else {
                    const errorData = await response.json();
                    console.error('Backend error:', errorData);
                    alert(errorData.message || 'Failed to add friend');
                }
            } catch (error) {
                console.error('Failed to add friend:', error);
                alert('Failed to add friend');
            }
        };

        const handleSeeFriends = async () => {
            setShowFriendsList(true);
            await fetchFriends();
        };

        const handleAddFriendsClick = async () => {
            setShowAddFriends(true);
            try {
                // First, fetch all users except current user
                const usersResponse = await fetch(`https://localhost:8443/users/except/${encodeURIComponent(user.email)}`);
                if (usersResponse.ok) {
                    const allUsersData = await usersResponse.json();
                    
                    // Then, fetch current friends
                    const friendsResponse = await fetch(`https://localhost:8443/friends/name/${encodeURIComponent(user.name)}`);
                    if (friendsResponse.ok) {
                        const currentFriends = await friendsResponse.json();
                        
                        // Filter out users who are already friends
                        const friendIds = currentFriends.map(friend => friend.userID);
                        const availableUsers = allUsersData.filter(user => !friendIds.includes(user.id));
                        
                        setAllUsers(availableUsers);
                    } else {
                        // If fetching friends fails, show all users
                        setAllUsers(allUsersData);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch users:', error);
            }
        };

        // Expose methods to parent component via ref
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
                        allUsers={allUsers}
                        onSendRequest={handleAddFriend}
                        onClose={() => setShowAddFriends(false)}
                    />
                )}

                {/* Friends List Modal */}
                {showFriendsList && (
                    <div className="absolute inset-0 bg-white bg-opacity-10 flex items-center justify-center z-30">
                        <div className="bg-pink-light p-6 rounded-lg max-h-[400px] overflow-y-auto w-[300px]">
                            <h3 className="font-pixelify text-blue-deep text-2xl mb-4 text-center">My Friends</h3>
                            <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto">
                                {friends.length === 0 ? (
                                    <p className="text-blue-deep font-dotgothic text-center">No friends yet!</p>
                                ) : (
                                    friends.map((friend) => (
                                        <div
                                            key={friend.userID || friend.id}
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