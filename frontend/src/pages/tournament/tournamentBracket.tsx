import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTournament } from './tournamentContext';
import type { TournamentMatch } from './tournamentContext';
import type { SelectedPlayer } from '../user/PlayerContext';
import Button from '../../components/ButtonDarkPink';
import home_icon from '../../assets/icons/Home.png';
import apiCentral from '../../utils/apiCentral';

interface MatchResult {
    matchID: number;
    tournamentMatchID: number;
    user1ID: number;
    user2ID: number;
    user1Score: number;
    user2Score: number;
    winnerID: number;
    user1Name: string;
    user2Name: string;
    winnerName: string;
}

function getBracketRounds(participants: any[]) {
    const rounds = [];
    let current = [...participants];

    while (current.length > 1) {
        rounds.push([...current]);
        const nextRoundSize = Math.ceil(current.length / 2);
        current = Array(nextRoundSize).fill(null);
    }

    rounds.push([null]);
    console.log('Generated rounds structure:', rounds.map((r, i) => `Round ${i + 1}: ${r.length} slots`));
    return rounds;
}

export default function Bracket() {
    const navigate = useNavigate();
    const { tournamentData, setCurrentMatch } = useTournament();
    const [tournamentMatches, setTournamentMatches] = useState<MatchResult[]>([]);
    const [loading, setLoading] = useState(true);

    console.log('Tournament Data:', tournamentData);

    // Fetch tournament matches from database
    useEffect(() => {
        const fetchTournamentMatches = async () => {
            if (!tournamentData?.tournamentBracketID) return;
            
            try {
                setLoading(true);
                const response = await apiCentral.get(`/tournament/${tournamentData.tournamentBracketID}/matches`);

                if (response.data) {
                    console.log('Response ok and Tournament matches from DB:', response.data.matches);
                    setTournamentMatches(response.data.matches || []);
                } else {
                    console.error('Failed to fetch tournament matches:', response.error);
                    setTournamentMatches([]);
                }
            } catch (error) {
                console.error('Error fetching tournament matches:', error);
                setTournamentMatches([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTournamentMatches();
    }, [tournamentData?.tournamentBracketID]);

    useEffect(() => {
        if (!tournamentData) {
            navigate('/playerProfile');
        }
    }, [tournamentData, navigate]);

    if (!tournamentData) {
        return <div>Loading...</div>;
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="font-pixelify text-blue-deep text-xl">Loading tournament bracket...</div>
            </div>
        );
    }

    const participants = tournamentData.participants.map((p:SelectedPlayer) => ({
        id: p.userID.toString(),
        displayName: p.name,
        avatarUrl: p.avatarUrl,
    }));

    const rounds = getBracketRounds(participants);

    // handle "byes" (odd number of players)
    if (participants.length % 2 === 1) {
        const byePlayer = participants[participants.length - 1];
        const byePosition = Math.floor((participants.length - 1) / 2);
        if (rounds[1] && byePosition < rounds[1].length) {
            rounds[1][byePosition] = byePlayer;
        }
    }

    tournamentMatches.forEach((match:MatchResult) => {
        if (match.winnerID && match.tournamentMatchID) {
            const winner = tournamentData.participants.find((p: SelectedPlayer) => p.userID === match.winnerID);
            if (winner) {
                const winnerObj = {
                    id: winner.userID.toString(),
                    displayName: winner.name,
                    avatarUrl: winner.avatarUrl,
                };

                const tournamentMatchID = match.tournamentMatchID;
                const firstRoundMatches = Math.floor(participants.length / 2);

                if (tournamentMatchID <= firstRoundMatches) {
                    const matchIndex = tournamentMatchID - 1;
                    const nextRoundIndex = 1;
                    const positionInNextRound = matchIndex;

                    if (nextRoundIndex < rounds.length && positionInNextRound < rounds[nextRoundIndex].length) {
                        rounds[nextRoundIndex][positionInNextRound] = winnerObj;
                    }
                } else {
                    let remainingMatchID = tournamentMatchID - firstRoundMatches;
                    let currentRoundIndex = 1;

                    while (currentRoundIndex < rounds.length - 1) {
                        const matchesInCurrentRound = Math.floor(rounds[currentRoundIndex].length / 2);
                        
                        if (remainingMatchID <= matchesInCurrentRound) {
                            const positionInNextRound = remainingMatchID - 1;
                            const nextRoundIndex = currentRoundIndex + 1;
                            if (nextRoundIndex < rounds.length && positionInNextRound < rounds[nextRoundIndex].length) {
                                rounds[nextRoundIndex][positionInNextRound] = winnerObj;
                            }
                            break;
                        } else {
                            remainingMatchID -= matchesInCurrentRound;
                            currentRoundIndex++;
                        }
                    }
                }
            }
        }
    });

    const getNextMatch = () => {
    const completedMatchIDs: Set<number> = new Set(
        tournamentMatches
            .filter((m: MatchResult) => m.tournamentMatchID !== undefined)
            .map((m: MatchResult) => m.tournamentMatchID as number)
    );
    let globalMatchCounter = 1;
    
    // Check all rounds, starting from first round
    for (let roundIndex = 0; roundIndex < rounds.length - 1; roundIndex++) {
        const round = rounds[roundIndex];

        if (roundIndex === 0) {
            const actualMatches = Math.floor(participants.length / 2);

            for (let i = 0; i < actualMatches; i++) {
                const player1 = participants[i * 2];
                const player2 = participants[i * 2 + 1];
                const tournamentMatchID = globalMatchCounter;
                if (player1 && player2 && !completedMatchIDs.has(tournamentMatchID)) {
                    return {
                        player1,
                        player2,
                        tournamentMatchID: tournamentMatchID,
                        roundIndex
                    };
                }
                globalMatchCounter++;
            }
        } else {
            const matchesInThisRound = Math.floor(round.length / 2);

            for (let i = 0; i < matchesInThisRound; i++) {
                const player1 = round[i * 2];
                const player2 = round[i * 2 + 1];

                if (player1 && player2) {
                    const tournamentMatchID = globalMatchCounter;
                    if (!completedMatchIDs.has(tournamentMatchID)) {
                        return {
                            player1,
                            player2,
                            tournamentMatchID: tournamentMatchID,
                            roundIndex
                        };
                    }
                } else if (player1 && !player2 && roundIndex === 2) {
                    const byePlayer = participants[participants.length - 1];
                    if (byePlayer && round[1] === null) {
                        round[1] = byePlayer;
                        const tournamentMatchID = globalMatchCounter;
                        if (!completedMatchIDs.has(tournamentMatchID)) {
                            return {
                                player1,
                                player2: byePlayer,
                                tournamentMatchID: tournamentMatchID,
                                roundIndex
                            };
                        }
                    }
                }
                globalMatchCounter++;
            }
        }
    }
    
    console.log('=== TOURNAMENT ANALYSIS ===');
    console.log(`Total participants: ${participants.length}`);
    console.log(`Expected total matches: ${participants.length - 1}`);
    console.log(`Completed matches: ${tournamentMatches.length}`);
    console.log(`Completed match IDs:`, Array.from(completedMatchIDs));
    console.log('=== END ANALYSIS ===');
    
    console.log('No more matches to play - tournament complete');
    return null;
};

    const nextMatch = getNextMatch();

    // Layout constants
    const boxHeight = 60;
    const boxWidth = 200;
    const baseGap = 20;
    const colGap = 60;

    const columnHeights = rounds.map(round => round.length * boxHeight + (round.length - 1) * baseGap);
    const maxColumnHeight = Math.max(...columnHeights);
    const svgHeight = maxColumnHeight;

    const containerWidth = 1152;

    const boxPositions: { x: number; y: number }[][] = [];
    rounds.forEach((round, roundIdx) => {
        const colX = roundIdx * (boxWidth + colGap);
        const columnHeight = round.length * boxHeight + (round.length - 1) * baseGap;
        const offsetY = (maxColumnHeight - columnHeight) / 2;
        let y = offsetY;
        const positions: { x: number; y: number }[] = [];
        for (let i = 0; i < round.length; ++i) {
            if (i !== 0) {
                y += boxHeight + baseGap;
            }
            positions.push({ x: colX, y });
        }
        boxPositions.push(positions);
    });

    const handleBackToProfile = () => {
        navigate('/playerProfile');
    };

    const startMatch = (matchInfo: any) => {
        const gameType = tournamentData?.gameType || 'pong';

        const match: TournamentMatch = {
            player1: {
                userID: parseInt(matchInfo.player1.id),
                name: matchInfo.player1.displayName,
                avatarUrl: matchInfo.player1.avatarUrl
            },
            player2: {
                userID: parseInt(matchInfo.player2.id),
                name: matchInfo.player2.displayName,
                avatarUrl: matchInfo.player2.avatarUrl
            },
            tournamentBracketID: tournamentData.tournamentBracketID || 0,
            tournamentMatchID: matchInfo.tournamentMatchID
        };
        setCurrentMatch(match);

        if (gameType === 'snake') {
            navigate(`/playerProfile/snakeGame?mode=tournament`);
        } else {
            navigate(`/playerProfile/pongGame?mode=tournament`);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <header className="h-40 bg-blue-deep flex">
                <div className="font-pixelify text-white text-opacity-25 text-7xl m-auto">
                    {tournamentData.gameType.charAt(0).toUpperCase() + tournamentData.gameType.slice(1)} Tournament
                </div>
            </header>
            <section className="flex-1 bg-pink-grid flex items-center justify-center">
                <div
                    className="relative border-2 border-solid border-purple-purple bg-pink-dark shadow-no-blur-50-reverse-no-active w-full max-w-6xl min-h-[600px] flex justify-center items-center p-20"
                    style={{ width: containerWidth }}
                >
                    {/* Bracket columns */}
                    <div className="flex flex-col w-full justify-center items-center gap-4">
                        {/* Round headers row */}
                        <div className="flex flex-row gap-8 justify-center text-shadow items-center mb-3">
                            {rounds.map((round, roundIdx) => (
                                <div key={roundIdx} className="w-[200px] text-center">
                                    <h3 className="font-pixelify text-white text-3xl">
                                        {roundIdx === rounds.length - 1 ? 'Winner' : `Round ${roundIdx + 1}`}
                                    </h3>
                                </div>
                            ))}
                        </div>
                    {/* Player boxes columns */}
                    <div className="flex flex-row gap-8 w-full justify-center items-start" style={{ minHeight: svgHeight, height: svgHeight }}>
                        {rounds.map((round, roundIdx) => (
                            <div key={roundIdx} className="w-[200px] relative" style={{ height: svgHeight }}>
                                {round.map((player, idx) => {
                                    const pos = boxPositions[roundIdx][idx];
                                    const isNextMatchPlayer = nextMatch && 
                                        (nextMatch.player1.id === player?.id || nextMatch.player2.id === player?.id);
                                    
                                    return (
                                        <div
                                            key={player ? player.id : `empty-${roundIdx}-${idx}`}
                                            className={`border-4 border-blue-deep rounded-lg px-4 py-2 font-pixelify text-blue-deep text-lg w-[200px] flex flex-row items-center gap-2 justify-center absolute ${
                                                player ? 'bg-pink-light' : 'bg-gray-200'
                                            } ${isNextMatchPlayer ? 'ring-4 ring-white' : ''}`}
                                            style={{
                                                minHeight: `${boxHeight}px`,
                                                left: 0,
                                                top: pos.y,
                                                width: `${boxWidth}px`,
                                            }}
                                        >
                                            {/* Profile content */}
                                            {player ? (
                                                <>
                                                    <img
                                                        src={player.avatarUrl}
                                                        alt={player.displayName}
                                                        className="w-10 h-10 rounded-full"
                                                        style={{ objectFit: 'cover', background: '#fff' }}
                                                    />
                                                    <span>{player.displayName}</span>
                                                </>
                                            ) : (
                                                <span className="text-gray-400">
                                                    {roundIdx === 0 ? 'Empty' : 'TBD'}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
                    <div className="absolute bottom-4 flex gap-4 items-center">
                        {nextMatch ? (
                            <button
                                className="inline-block border-2 border-blue-deep bg-blue-deep px-4 py-2 font-pixelify text-white text-3xl hover:big-blue-200 transition m-4 shadow-no-blur"
                                onClick={() => startMatch(nextMatch)}
                            >
                                Start
                            </button>
                        ) : (
                            <div className="font-pixelify text-blue-deep text-xl">
                                Tournament Complete! 🏆
                            </div>
                        )}
                    </div>
                </div>
            </section>
            {/* Footer */}
            <footer className="h-40 bg-blue-deep flex justify-center items-center">
                <Button onClick={handleBackToProfile} className="!mt-0">
                    <img src={home_icon} alt="Home" className="h-8 w-auto"/>
                </Button>
            </footer>
        </div>
    );
}
