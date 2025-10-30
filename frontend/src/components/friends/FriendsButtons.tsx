import React from 'react';

interface FriendsButtonsProps {
    onSeeFriends: () => void;
    onAddFriend: () => void;
}

export const FriendsButtons: React.FC<FriendsButtonsProps> = ({
    onSeeFriends,
    onAddFriend
}) => {
    return (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col gap-4">
            <button
                className="button-pp-purple shadow-no-blur-60"
                onClick={onSeeFriends}
            >
                See Friends
            </button>
            <button
                className="button-pp-purple shadow-no-blur-60"
                onClick={onAddFriend}
            >
                Add Friend
            </button>
        </div>
    );
};