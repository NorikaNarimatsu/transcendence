import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    email: string;
    name: string;
    avatar: string;
}

interface UserContextType {
    user: User | null; // who is logged
    setUser: (user: User | null ) => void;
    logout: () => void; 
}

const StorageBox = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode}) {
    const [user, setUser] = useState<User | null>(null);

    // user already logged
    useEffect(() => {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            setUser(JSON.parse(savedUser)); // Restore previous user
        }
    }, []);

    const updateUser = (userData: User | null) => {
    setUser(userData);
    if (userData) {
        localStorage.setItem('currentUser', JSON.stringify(userData));
    } else { // i dont know if this is right TODO: check later
        localStorage.removeItem('currentUser');
    }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('currentUser');
    };

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