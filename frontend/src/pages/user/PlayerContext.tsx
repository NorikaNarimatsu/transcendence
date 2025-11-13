import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

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
    tournamentPlayers: SelectedPlayer[];
    setTournamentPlayers: (players: SelectedPlayer[]) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
    const [selectedPlayer, setSelectedPlayer] = useState<SelectedPlayer | null>(null);
    const [aiPlayer, setAiPlayer] = useState<SelectedPlayer | null>(null);
    const [guestPlayer, setGuestPlayer] = useState<SelectedPlayer | null>(null);
    const [tournamentPlayers, setTournamentPlayers] = useState<SelectedPlayer[]>([]);

    useEffect(() => {
        const initializeSpecialPlayers = async () => {
            try {
                const aiResponse = {
                        userID: 1,
                        name: 'AI',
                        avatarUrl: '/avatars/AI.jpeg'
                    };
                if (aiResponse) {
                    const aiData = aiResponse;
                    setAiPlayer({
                        userID: aiData.userID,
                        name: aiData.name,
                        avatarUrl: aiData.avatarUrl
                    });
                }                
                const guestResponse = {
                        userID: 2,
                        name: 'Guest',
                        avatarUrl: '/avatars/Guest.jpeg'
                    };
                if (guestResponse) {
                    const guestData = guestResponse;
                    setGuestPlayer({
                        userID: guestData.userID,
                        name: guestData.name,
                        avatarUrl: guestData.avatarUrl
                    });
                }
            } catch (error) {
                console.error('Failed to load special players:', error);
            }
        };
        initializeSpecialPlayers();
    }, []);

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

export const SelectedPlayerProvider = PlayerProvider;

export function useSelectedPlayer() {
    const context = useContext(PlayerContext);
    if (context === undefined) {
        throw new Error('useSelectedPlayer must be used within a PlayerProvider');
    }
    return context;
}