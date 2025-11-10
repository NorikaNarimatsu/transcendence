import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { SelectedPlayer } from '../user/PlayerContext';

interface TournamentMatch {
    player1: SelectedPlayer;
    player2: SelectedPlayer;
    tournamentBracketID: number;
    tournamentMatchID: number;
}
interface TournamentData {
    players: number;
    participants: SelectedPlayer[];
    tournamentBracketID?: number;
    gameType: 'pong' | 'snake';
}

interface TournamentContextType {
    tournamentData: TournamentData | null;
    setTournamentData: (data: TournamentData) => void;
    clearTournamentData: () => void;
    currentMatch: TournamentMatch | null;
    setCurrentMatch: (match: TournamentMatch | null) => void;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export function TournamentProvider({ children }: { children: ReactNode }) {
    const [tournamentData, setTournamentData] = useState<TournamentData | null>(null);
    const [currentMatch, setCurrentMatch] = useState<TournamentMatch | null>(null);

    const clearTournamentData = () => {
        setTournamentData(null);
        setCurrentMatch(null);
    };

    return (
        <TournamentContext.Provider value={{
            tournamentData,
            setTournamentData,
            clearTournamentData,
            currentMatch,
            setCurrentMatch
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

export type { TournamentMatch, TournamentData };