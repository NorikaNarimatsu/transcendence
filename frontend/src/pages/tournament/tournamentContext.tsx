import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { SelectedPlayer } from '../user/PlayerContext';

interface Match {
    id: string; // tournament id
    player1: SelectedPlayer | null;
    player2: SelectedPlayer | null;
    winner: SelectedPlayer | null;
    round: number;
    position: number;
    matchID?: number; // Database match ID after saving
}

interface TournamentData {
    players: number;
    participants: SelectedPlayer[];
    gameType: 'pong' | 'snake';
    tournamentBracketID?: number; // Database tournament ID
    matches?: Match[];
    currentMatch?: Match | null;
    tournamentWinner?: SelectedPlayer | null;
}

interface TournamentContextType {
    tournamentData: TournamentData | null;
    setTournamentData: (data: TournamentData) => void;
    clearTournamentData: () => void;
    saveMatchResult?: (match: Match, winner: SelectedPlayer, user1Score: number, user2Score: number) => Promise<void>;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export function TournamentProvider({ children }: { children: ReactNode }) {
    const [tournamentData, setTournamentData] = useState<TournamentData | null>(null);

    const clearTournamentData = () => setTournamentData(null);

    // Function to save match result to database
    const saveMatchResult = async (match: Match, winner: SelectedPlayer, user1Score: number, user2Score: number) => {
        if (!tournamentData) return;

        try {
            // Generate unique bracket ID if not exists
            const bracketID = tournamentData.tournamentBracketID || Date.now();

            const matchData = {
                matchType: tournamentData.gameType,
                matchMode: 'tournament',
                tournamentBracketID: bracketID,
                tournamentMatchID: parseInt(match.id.split('-')[1]),
                user1ID: match.player1!.userID,
                user2ID: match.player2!.userID,
                user1Score: user1Score,
                user2Score: user2Score,
                winnerID: winner.userID,
                startedAt: new Date().toISOString(),
                endedAt: new Date().toISOString()
            };

            const response = await fetch('https://localhost:8443/addMatch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(matchData),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Match saved to database:', result);

                // Update tournament data with bracket ID and match result
                const updatedMatches = tournamentData.matches?.map(m => 
                    m.id === match.id 
                        ? { ...m, winner, matchID: result.matchID }
                        : m
                ) || [];

                setTournamentData({
                    ...tournamentData,
                    tournamentBracketID: bracketID,
                    matches: updatedMatches
                });
            } else {
                console.error('Failed to save match:', await response.text());
            }
        } catch (error) {
            console.error('Error saving match result:', error);
        }
    };

    return (
        <TournamentContext.Provider value={{
            tournamentData,
            setTournamentData,
            clearTournamentData,
            saveMatchResult
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

export type { Match };