import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { SelectedPlayer } from '../user/PlayerContext';

interface TournamentData {
    players: number;
    participants: SelectedPlayer[];
}

interface TournamentContextType {
    tournamentData: TournamentData | null;
    setTournamentData: (data: TournamentData) => void;
    clearTournamentData: () => void;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export function TournamentProvider({ children }: { children: ReactNode }) {
    const [tournamentData, setTournamentData] = useState<TournamentData | null>(null);

    const clearTournamentData = () => setTournamentData(null);

    return (
        <TournamentContext.Provider value={{
            tournamentData,
            setTournamentData,
            clearTournamentData
        }}>
            {children}
        </TournamentContext.Provider>
    );
}

export function useTournament() {
    const context = useContext(TournamentContext);
    if (context === undefined) {
        throw new Error('useTournament must be used within a TournamentProvider');
    }
    return context;
}