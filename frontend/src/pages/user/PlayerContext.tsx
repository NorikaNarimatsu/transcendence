import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface SelectedPlayer {
    userID: number;
    name: string;
    avatarUrl: string;
}

interface SelectedPlayerContextType {
    selectedPlayer: SelectedPlayer | null;
    setSelectedPlayer: (player: SelectedPlayer | null) => void;
    clearSelectedPlayer: () => void;
}

const SelectedPlayerContext = createContext<SelectedPlayerContextType | undefined>(undefined);

export function SelectedPlayerProvider({ children }: { children: ReactNode }) {
    const [selectedPlayer, setSelectedPlayer] = useState<SelectedPlayer | null>(null);

    // Load selected player from localStorage on mount
    useEffect(() => {
        const loadSelectedPlayer = () => {
            try {
                const storedPlayer = localStorage.getItem('selectedPlayer');
                if (storedPlayer) {
                    const playerData = JSON.parse(storedPlayer);
                    if (playerData && playerData.userID && playerData.name && playerData.avatarUrl) {
                        setSelectedPlayer(playerData);
                    } else {
                        localStorage.removeItem('selectedPlayer');
                    }
                }
            } catch (error) {
                console.error('Error loading selected player from localStorage:', error);
                localStorage.removeItem('selectedPlayer');
            }
        };

        loadSelectedPlayer();
    }, []);

    const updateSelectedPlayer = (playerData: SelectedPlayer | null) => {
        setSelectedPlayer(playerData);
        if (playerData) {
            if (playerData.userID && playerData.name && playerData.avatarUrl) {
                localStorage.setItem('selectedPlayer', JSON.stringify(playerData));
            } else {
                console.warn('Invalid player data provided to setSelectedPlayer:', playerData);
            }
        } else {
            localStorage.removeItem('selectedPlayer');
        }
    };

    const clearSelectedPlayer = () => {
        setSelectedPlayer(null);
        localStorage.removeItem('selectedPlayer');
    };

    return (
        <SelectedPlayerContext.Provider value={{ 
            selectedPlayer, 
            setSelectedPlayer: updateSelectedPlayer, 
            clearSelectedPlayer 
        }}>
            {children}
        </SelectedPlayerContext.Provider>
    );
}

export function useSelectedPlayer() {
    const context = useContext(SelectedPlayerContext);
    if (context === undefined) {
        throw new Error('useSelectedPlayer must be used within a SelectedPlayerProvider');
    }
    return context;
}