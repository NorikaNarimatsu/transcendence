import { useState, useEffect } from 'react';
import type { SelectedPlayer } from '../pages/user/PlayerContext';

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

// Hook for fetching users (excluding current user)
export const useUsers = (currentUserID?: string) => {
    const [users, setUsers] = useState<SelectedPlayer[]>([]);
    const [allUsers, setAllUsers] = useState<SelectedPlayer[]>([]);

    useEffect(() => {
        if (currentUserID) {
            fetch(`https://localhost:8443/users/except/${currentUserID}`)
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
    }, [currentUserID]);

    return { users, allUsers, setUsers };
};

// Hook for fetching basic stats
export const useBasicStats = (userID?: string) => {
    const [basicStats, setBasicStats] = useState<BasicStats | null>(null);

    const fetchBasicStats = async () => {
        if (!userID) return;
        try {
            const response = await fetch(`https://localhost:8443/user/${userID}/stats`);
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

    useEffect(() => {
        if (userID) {
            fetchBasicStats();
        } else {
            setBasicStats(null);
        }
    }, [userID]);

    return { basicStats, refetchStats: fetchBasicStats };
};

// Hook for downloading user data
export const useUserDataDownload = () => {
    const downloadUserData = async (user: User) => {
        if (!user?.userID) {
            console.log('no user or userID found');
            return;
        }

        try {
            const response = await fetch('https://localhost:8443/api/user/export-data', {
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

    return { downloadUserData };
};

// Hook for password verification
export const usePasswordVerification = () => {
    const verifyPassword = async (userID: string, password: string): Promise<boolean> => {
        try {
            const response = await fetch('https://localhost:8443/validatePasswordbyUserID', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userID, password }),
            });
            return response.ok;
        } catch (error) {
            console.error('Error verifying password:', error);
            return false;
        }
    };

    return { verifyPassword };
};