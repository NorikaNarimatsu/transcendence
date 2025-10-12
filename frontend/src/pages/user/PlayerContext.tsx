import { createContext, useContext, useState, ReactNode } from 'react';

export interface SelectedPlayer {
    id: number;
    name: string;
    avatarUrl: string;
}

const SelectedPlayerContext = createContext<{
    selectedPlayer: SelectedPlayer | null;
    setSelectedPlayer: (player: SelectedPlayer | null) => void;
}>({
    selectedPlayer: null,
    setSelectedPlayer: () => {},
});

export function SelectedPlayerProvider({ children }: { children: ReactNode }) {
    const [selectedPlayer, setSelectedPlayer] = useState<SelectedPlayer | null>(null);
    return (
        <SelectedPlayerContext.Provider value={{ selectedPlayer, setSelectedPlayer }}>
            {children}
        </SelectedPlayerContext.Provider>
    );
}

export function useSelectedPlayer() {
    return useContext(SelectedPlayerContext);
}