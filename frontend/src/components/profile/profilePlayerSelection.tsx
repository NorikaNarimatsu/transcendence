import React, { useState, useEffect } from 'react';
import type { SelectedPlayer } from '../../pages/user/PlayerContext';
import { useUser } from '../../pages/user/UserContext';

interface PlayerSelectionProps {
    open: boolean;
    users: SelectedPlayer[];
    onSelect: (user: SelectedPlayer | null) => void;
    onCancel: () => void;
}

export function PlayerSelection({ open, users, onSelect, onCancel }: PlayerSelectionProps) {
    const [friends, setFriends] = useState<SelectedPlayer[]>([]);
    const [showFriendsOnly, setShowFriendsOnly] = useState(false);
    const { user } = useUser();

    // Fetch friends when component opens
    useEffect(() => {
        if (open && user?.userID) {
            fetch(`https://localhost:8443/friends/userID/${user.userID}`)
                .then(res => res.ok ? res.json() : [])
                .then((friendsData: SelectedPlayer[]) => {
                    console.log('Friends loaded:', friendsData);
                    setFriends(friendsData);
                })
                .catch(err => {
                    console.error('Failed to fetch friends:', err);
                    setFriends([]);
                });
        }
    }, [open, user?.userID]);

    if (!open) return null;

    const friendsIDs = new Set(friends.map((friend: SelectedPlayer) => friend.userID));
    let displayUsers: SelectedPlayer[];
    if(showFriendsOnly === true) {
        displayUsers = [];
        for (let user of users) {
            if (friendsIDs.has(user.userID)){
                displayUsers.push(user);
            }
        }
    } else {
        displayUsers = users;
    }

    return (
        <div className="absolute inset-0 flex items-center justify-center z-30">
            <div className="bg-pink-light p-6 rounded-lg max-h-[500px] overflow-y-auto w-[350px]">
                <h3 className="font-pixelify text-blue-deep text-2xl mb-4 text-center">Select Player 2</h3>
                
                {/* Friends Filter Toggle */}
                <div className="flex items-center justify-between mb-4 p-2 bg-pink-medium rounded">
                    <span className="font-dotgothic text-blue-deep">
                        👥 Friends({friends.length})
                    </span>
                    <button
                        onClick={() => setShowFriendsOnly(!showFriendsOnly)}
                        className={`px-3 py-1 rounded font-dotgothic text-sm transition-colors ${
                            showFriendsOnly 
                                ? 'bg-blue-deep text-white' 
                                : 'bg-gray-300 text-blue-deep hover:bg-gray-400'
                        }`}
                    >
                        {showFriendsOnly ? 'ON' : 'OFF'}
                    </button>
                </div>

                <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto">
                    {displayUsers.map((user: SelectedPlayer) => {
                        const isFriend = friendsIDs.has(user.userID);
                        return (
                            <button
                                key={user.userID}
                                onClick={() => onSelect(user)}
                                className="px-4 py-2 text-blue-deep font-pixelify rounded hover:bg-blue-medium transition-colors flex items-center gap-2"
                            >
                                {user.avatarUrl && (
                                    <img 
                                        src={user.avatarUrl}
                                        alt={user.name} 
                                        className="w-6 h-6 rounded-full object-cover"
                                    />
                                )}
                                <span className="flex-1 text-left">{user.name}</span>
                                {isFriend && <span className="text-xs text-blue-deep/70">FRIEND</span>}
                            </button>
                        );
                    })}
                    
                    {displayUsers.length === 0 && showFriendsOnly && (
                        <div className="text-center py-4 text-blue-deep font-dotgothic">
                            No friends available
                        </div>
                    )}
                    <button
                        onClick={() => onSelect(null)}
                        className="px-4 py-2 bg-pink-medium text-blue-deep font-pixelify rounded hover:bg-pink-dark transition-colors mt-2"
                    > 🎮 Play as Guest
                    </button>
                </div>
                <button
                    onClick={onCancel}
                    className="w-full px-4 py-2 bg-gray-500 text-white font-pixelify rounded hover:bg-gray-600 transition-colors mt-4"
                > Cancel
                </button>
            </div>
        </div>
    );
}