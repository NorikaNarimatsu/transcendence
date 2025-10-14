import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface SelectedPlayer {
    userID: number;
    name: string;
    avatarUrl: string;
}

interface PlayerContextType {
    selectedPlayer: SelectedPlayer | null;
    setSelectedPlayer: (player: SelectedPlayer | null) => void;
    aiPlayer: SelectedPlayer | null;
    setAiPlayer: (player: SelectedPlayer | null) => void;
    guestPlayer: SelectedPlayer | null;
    setGuestPlayer: (player: SelectedPlayer | null) => void;
    // For future tournament mode, not our focus now
    tournamentPlayers: SelectedPlayer[];
    setTournamentPlayers: (players: SelectedPlayer[]) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
    const [selectedPlayer, setSelectedPlayer] = useState<SelectedPlayer | null>(null);
    const [aiPlayer, setAiPlayer] = useState<SelectedPlayer | null>(null);
    const [guestPlayer, setGuestPlayer] = useState<SelectedPlayer | null>(null);
    const [tournamentPlayers, setTournamentPlayers] = useState<SelectedPlayer[]>([]);

    // ADD: Initialize AI and Guest players when app starts
    useEffect(() => {
        const initializeSpecialPlayers = async () => {
            try {
                // Fetch AI Player (userID = 1)
                const aiResponse = await fetch('https://localhost:8443/getUserById/1');
                if (aiResponse.ok) {
                    const aiData = await aiResponse.json();
                    setAiPlayer({
                        userID: aiData.userID,
                        name: aiData.name,
                        avatarUrl: aiData.avatarUrl
                    });
                    console.log('AI Player loaded:', aiData.userID, aiData.name, aiData.avatarUrl);
                }

                // Fetch Guest Player (userID = 2)
                const guestResponse = await fetch('https://localhost:8443/getUserById/2');
                if (guestResponse.ok) {
                    const guestData = await guestResponse.json();
                    setGuestPlayer({
                        userID: guestData.userID,
                        name: guestData.name,
                        avatarUrl: guestData.avatarUrl
                    });
                    console.log('Guest Player loaded:', guestData.userID, guestData.name, guestData.avatarUrl);
                }
            } catch (error) {
                console.error('Failed to load special players:', error);
            }
        };

        initializeSpecialPlayers();
    }, []); // Run once when context loads

    return (
        <PlayerContext.Provider value={{
            selectedPlayer,
            setSelectedPlayer,
            aiPlayer,
            setAiPlayer,
            guestPlayer,
            setGuestPlayer,
            tournamentPlayers,
            setTournamentPlayers
        }}>
            {children}
        </PlayerContext.Provider>
    );
}

// ADD: Export the same component with the old name for compatibility // TODO fix later
export const SelectedPlayerProvider = PlayerProvider;

export function useSelectedPlayer() {
    const context = useContext(PlayerContext);
    if (context === undefined) {
        throw new Error('useSelectedPlayer must be used within a PlayerProvider');
    }
    return context;
}