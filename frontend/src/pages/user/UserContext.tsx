import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

import { getUserLanguage } from '../../utils/languageApi';

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
        const loadUser = async () => {
            try {
                const storedUser = localStorage.getItem('currentUser');
                if (storedUser) {
                    const userData = JSON.parse(storedUser);
                    if (userData && userData.userID && userData.name && userData.avatarUrl) {
                        setUser(userData);
                    } else {
                        localStorage.removeItem('currentUser');
                    }
                    try {
                        const dbLang = await getUserLanguage(userData.userID);
                        localStorage.setItem('lang', dbLang);
                    }catch(error){
                        console.error('Failed to fetch language:', error);
                    }
                }
            } catch (error) {
                console.error('Error loading user from localStorage:', error);
                localStorage.removeItem('currentUser');
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    const updateUser = async (userData: User | null) => {
    setUser(userData);
    if (userData) {
        if (userData.userID && userData.name && userData.avatarUrl){
            localStorage.setItem('currentUser', JSON.stringify(userData));
        }
        else
            console.warn('Invalid user data provided to setUser:', userData);
    } else {
        localStorage.removeItem('currentUser');
    }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('currentUser');
		localStorage.removeItem('authToken');
        localStorage.removeItem('lang');
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