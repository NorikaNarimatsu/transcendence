import React, { useState } from 'react';
import AvatarSelection from './profile/AvatarSelection';
import { CategoryButtons } from './profile/profileCategoryButtons';
// import arrow_icon from '../../assets/icons/arrow.png';
const arrow_icon = '/src/assets/icons/arrow.png'; // Temporary fix for build issue

interface BasicStats {
    wins: number;
    losses: number;
    totalMatches: number;
}

interface User {
    userID: string;
    name: string;
    avatarUrl: string;
    wins?: number;
    losses?: number;
}

interface PlayerInfoCardProps {
    user: User;
    basicStats: BasicStats | null;
    onCategorySelect: (category: string) => void;
    onAvatarUpdate: (avatarUrl: string) => void;
}

export const PlayerInfoCard: React.FC<PlayerInfoCardProps> = ({
    user,
    basicStats,
    onCategorySelect,
    onAvatarUpdate
}) => {
    const [isAvatarSelectionOpen, setIsAvatarSelectionOpen] = useState(false);

    const handleSelectAvatar = async (avatarUrl: string) => {
        if (!user?.userID) return;
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

            onAvatarUpdate(avatarUrl);
        } catch (err) {
            console.error('Error updating avatar:', err);
        }
    };

    return (
        <div className="shadow-no-blur-50-purple-bigger bg-pink-light w-[350px] h-[500px] flex flex-col justify-between py-6">
            <div className="font-pixelify text-white text-5xl text-center text-shadow mb-6">
                PLAYER INFO
            </div>
            <div className="bg-pink-dark mx-[25px] h-[125px] border-purple flex flex-row justify-center items-center px-4">
                <img
                    onClick={() => {
                        console.log('Avatar clicked, current isOpen:', isAvatarSelectionOpen);
                        setIsAvatarSelectionOpen(!isAvatarSelectionOpen);
                    }}
                    src={user.avatarUrl}
                    alt="Avatar"
                    className="avatar m-auto shadow-no-blur cursor-pointer"
                    style={{ borderColor: "#7a63fe" }}
                />
                <AvatarSelection
                    open={isAvatarSelectionOpen}
                    onClose={() => setIsAvatarSelectionOpen(false)}
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
                        onClick: () => onCategorySelect("Games"),
                    },
                    {
                        name: "Friends",
                        icon: arrow_icon,
                        onClick: () => onCategorySelect("Friends"),
                    },
                    {
                        name: "Dashboard",
                        icon: arrow_icon,
                        onClick: () => onCategorySelect("Dashboard"),
                    },
                    {
                        name: "Settings",
                        icon: arrow_icon,
                        className: "button-pp-blue-settings shadow-no-blur flex items-center justify-between",
                        onClick: () => onCategorySelect("Settings"),
                    },
                ]}
            />
        </div>
    );
};