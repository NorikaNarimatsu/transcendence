import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
    userID: number;
    name: string;
    avatarUrl: string;
}

interface UserContextType {
    user: User | null; // who is logged
    setUser: (user: User | null ) => void;
    logout: () => void; 
}

const StorageBox = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode}) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

        useEffect(() => {
        const loadUser = () => {
            try {
                const storedUser = localStorage.getItem('currentUser');
                if (storedUser) {
                    const userData = JSON.parse(storedUser);
                    if (userData && userData.userID && userData.name && userData.avatarUrl) {
                        setUser(userData);
                    } else {
                        localStorage.removeItem('currentUser');
                    }
                }
            } catch (error) {
                console.error('Error loading user from localStorage:', error);
                localStorage.removeItem('currentUser'); // Clean up corrupted data
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);


    const updateUser = (userData: User | null) => {
    setUser(userData);
    if (userData) {
        if (userData.userID && userData.name && userData.avatarUrl)
            localStorage.setItem('currentUser', JSON.stringify(userData));
        else
            console.warn('Invalid user data provided to setUser:', userData);
    } else {
        localStorage.removeItem('currentUser');
    }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('currentUser');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-pink-grid">
                <p className="text-blue-deep font-dotgothic text-xl">Loading...</p>
            </div>
        );
    }

    return (
        <StorageBox.Provider value={{ user, setUser: updateUser, logout }}>
            {children}
        </StorageBox.Provider>
    );
}

export function useUser() {
    const context = useContext(StorageBox);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}