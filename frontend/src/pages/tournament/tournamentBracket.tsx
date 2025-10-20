import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTournament } from './tournamentContext';
import type { TournamentMatch } from './tournamentContext';

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
    console.log('Generating bracket rounds for participants:', participants);
    const rounds = [];
    let current = [...participants]; // Make a copy
    
    while (current.length > 1) {
        rounds.push([...current]); // Store current round
        
        // Calculate next round size
        const nextRoundSize = Math.ceil(current.length / 2);
        current = Array(nextRoundSize).fill(null);
    }
    
    rounds.push([null]); // Winner box
    console.log('Generated rounds structure:', rounds.map((r, i) => `Round ${i + 1}: ${r.length} slots`));
    return rounds;
}

export default function Bracket() {
    const navigate = useNavigate();
    const { tournamentData, setCurrentMatch } = useTournament();
    const [matchCounter, setMatchCounter] = useState(1);
    const [tournamentMatches, setTournamentMatches] = useState<MatchResult[]>([]);
    const [loading, setLoading] = useState(true);

    console.log('Tournament Data:', tournamentData);

    // Fetch tournament matches from database
    useEffect(() => {
        const fetchTournamentMatches = async () => {
            if (!tournamentData?.tournamentBracketID) return;
            
            try {
                setLoading(true);
                console.log('Fetching matches for tournament bracket:', tournamentData.tournamentBracketID);
                
                const response = await fetch(`https://localhost:8443/tournament/${tournamentData.tournamentBracketID}/matches`);
                
                console.log('Response status:', response.status);
                console.log('Response ok:', response.ok);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('Raw response data:', data);
                    console.log('Tournament matches from DB:', data.matches);
                    setTournamentMatches(data.matches || []);
                } else {
                    const errorText = await response.text();
                    console.error('Failed to fetch tournament matches:', response.status, errorText);
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

    const participants = tournamentData.participants.map(p => ({
        id: p.userID.toString(),
        displayName: p.name,
        avatarUrl: p.avatarUrl,
    }));

    // Get rounds and fill in winners + handle byes
    const rounds = getBracketRounds(participants);
    
    // First, handle "byes" (odd number of players)
// First, handle "byes" (odd number of players)
if (participants.length % 2 === 1) {
    const byePlayer = participants[participants.length - 1];
    console.log(`Player ${byePlayer.displayName} gets a bye to round 2`);
    
    // Place bye player in round 2
    const byePosition = Math.floor((participants.length - 1) / 2);
    if (rounds[1] && byePosition < rounds[1].length) {
        rounds[1][byePosition] = byePlayer;
    }
    
    // For 5 players: bye player goes directly to final (no semifinal opponent)
    if (rounds.length >= 3 && participants.length === 5) {
        console.log(`${byePlayer.displayName} advances directly to final`);
        rounds[2][1] = byePlayer; // Place in final, position 1
    }
}
    
    // Fill winners from database matches into next rounds
    console.log('=== PROCESSING WINNERS ===');
    tournamentMatches.forEach(match => {
        if (match.winnerID && match.tournamentMatchID) {
            const winner = tournamentData.participants.find(p => p.userID === match.winnerID);
            if (winner) {
                const winnerObj = {
                    id: winner.userID.toString(),
                    displayName: winner.name,
                    avatarUrl: winner.avatarUrl,
                };
                
                console.log('Processing match:', {
                    matchID: match.matchID,
                    tournamentMatchID: match.tournamentMatchID,
                    winnerID: match.winnerID,
                    winnerName: winner.name
                });
                
                const tournamentMatchID = match.tournamentMatchID;
                const firstRoundMatches = Math.floor(participants.length / 2);
                
                console.log(`Match ${tournamentMatchID} analysis: firstRoundMatches=${firstRoundMatches}`);
                
                if (tournamentMatchID <= firstRoundMatches) {
                    // First round match - place winner in correct position in round 2
                    const matchIndex = tournamentMatchID - 1; // 0-based: match 1 -> index 0, match 2 -> index 1
                    const nextRoundIndex = 1; // Second round
                    
                    // CORRECT: First round winners advance to next round positions
                    // Match 1 winner -> Round 2 position 0
                    // Match 2 winner -> Round 2 position 1  
                    const positionInNextRound = matchIndex; // This is actually correct for first round!
                    
                    console.log(`First round match ${tournamentMatchID}: placing winner ${winner.name} in round ${nextRoundIndex + 1}, position ${positionInNextRound}`);
                    
                    if (nextRoundIndex < rounds.length && positionInNextRound < rounds[nextRoundIndex].length) {
                        rounds[nextRoundIndex][positionInNextRound] = winnerObj;
                        console.log(`✅ Placed ${winner.name} in round ${nextRoundIndex + 1}, position ${positionInNextRound}`);
                    }
                } else {
                    // Later round matches - fix the calculation
                    let remainingMatchID = tournamentMatchID - firstRoundMatches;
                    let currentRoundIndex = 1;
                    
                    // Find which round this match belongs to and place winner correctly
                    while (currentRoundIndex < rounds.length - 1) {
                        const matchesInCurrentRound = Math.floor(rounds[currentRoundIndex].length / 2);
                        
                        if (remainingMatchID <= matchesInCurrentRound) {
                            // This match belongs to currentRoundIndex, winner goes to next round
                            const positionInNextRound = remainingMatchID - 1; // Fix: 0-based position
                            const nextRoundIndex = currentRoundIndex + 1;
                            
                            console.log(`Later round match ${tournamentMatchID}: placing winner ${winner.name} in round ${nextRoundIndex + 1}, position ${positionInNextRound}`);
                            
                            if (nextRoundIndex < rounds.length && positionInNextRound < rounds[nextRoundIndex].length) {
                                rounds[nextRoundIndex][positionInNextRound] = winnerObj;
                                console.log(`✅ Placed ${winner.name} in round ${nextRoundIndex + 1}, position ${positionInNextRound}`);
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

    console.log('=== FINAL ROUNDS STATE ===');
    rounds.forEach((round, idx) => {
        console.log(`Round ${idx + 1}:`, round.map(p => p?.displayName || 'null'));
    });
    console.log('=== END WINNER PROCESSING ===');

    // Fix: Better next match detection that handles byes and multiple rounds
const getNextMatch = () => {
    const completedMatchIDs = new Set(tournamentMatches.map(m => m.tournamentMatchID).filter(id => id !== undefined));
    console.log('Completed tournament match IDs:', Array.from(completedMatchIDs));
    
    let globalMatchCounter = 1;
    
    // Check all rounds, starting from first round
    for (let roundIndex = 0; roundIndex < rounds.length - 1; roundIndex++) {
        const round = rounds[roundIndex];
        console.log(`=== CHECKING ROUND ${roundIndex + 1} ===`);
        console.log(`Round has ${round.length} slots`);
        
        if (roundIndex === 0) {
            // First round: check actual participants (not including bye players)
            const actualMatches = Math.floor(participants.length / 2);
            console.log(`First round should have ${actualMatches} matches`);
            
            for (let i = 0; i < actualMatches; i++) {
                const player1 = participants[i * 2];
                const player2 = participants[i * 2 + 1];
                const tournamentMatchID = globalMatchCounter;
                
                console.log(`Checking first round match ${tournamentMatchID}: ${player1?.displayName} vs ${player2?.displayName}, completed: ${completedMatchIDs.has(tournamentMatchID)}`);
                
                if (player1 && player2 && !completedMatchIDs.has(tournamentMatchID)) {
                    console.log(`Next match found: ${player1.displayName} vs ${player2.displayName}`);
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
            // Subsequent rounds: check pairs in the current round
            const matchesInThisRound = Math.floor(round.length / 2);
            console.log(`Round ${roundIndex + 1} should have ${matchesInThisRound} matches`);
            console.log(`Round ${roundIndex + 1} current players:`, round.map(p => p?.displayName || 'TBD'));
            
            for (let i = 0; i < matchesInThisRound; i++) {
                const player1 = round[i * 2];
                const player2 = round[i * 2 + 1];
                
                console.log(`Checking match pair: ${player1?.displayName || 'TBD'} vs ${player2?.displayName || 'TBD'}`);
                
                if (player1 && player2) {
                    const tournamentMatchID = globalMatchCounter;
                    
                    console.log(`Checking round ${roundIndex + 1} match ${tournamentMatchID}: ${player1?.displayName} vs ${player2?.displayName}, completed: ${completedMatchIDs.has(tournamentMatchID)}`);
                    
                    if (!completedMatchIDs.has(tournamentMatchID)) {
                        console.log(`Next match found in round ${roundIndex + 1}: ${player1.displayName} vs ${player2.displayName}`);
                        return {
                            player1,
                            player2,
                            tournamentMatchID: tournamentMatchID,
                            roundIndex
                        };
                    }
                } else if (player1 && !player2 && roundIndex === 2) {
                    // Special case: Final round with bye player
                    // Find the bye player (test4) and place them in position 1
                    const byePlayer = participants[participants.length - 1];
                    if (byePlayer && round[1] === null) {
                        round[1] = byePlayer;
                        console.log(`Placed bye player ${byePlayer.displayName} in final`);
                        
                        const tournamentMatchID = globalMatchCounter;
                        console.log(`Final match created: ${player1.displayName} vs ${byePlayer.displayName}`);
                        
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
        
        console.log(`Finished checking round ${roundIndex + 1}, globalMatchCounter now: ${globalMatchCounter}`);
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

    // Calculate total expected matches for tournament
    const calculateTotalMatches = () => {
        return participants.length - 1; // n players = n-1 matches
    };

    const totalExpectedMatches = calculateTotalMatches();

    // Layout constants
    const boxHeight = 60;
    const boxWidth = 200;
    const baseGap = 40;
    const colGap = 60;

    const svgWidth = rounds.length * (boxWidth + colGap);
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
        
        console.log('Starting tournament match:', match);
        setCurrentMatch(match);
        
        setMatchCounter(prev => prev + 1);
        console.log("*******this is the game type", gameType);
        
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
                    className="relative bg-pink-dark w-full max-w-6xl min-h-[600px] m-[10px] flex justify-center items-center px-[50px]"
                    style={{ width: containerWidth }}
                >
                    {/* Bracket columns */}
                    <div className="flex flex-row gap-[60px] w-full justify-center items-start" style={{ minHeight: svgHeight }}>
                        {rounds.map((round, roundIdx) => (
                            <div key={roundIdx} className="flex flex-col items-center justify-start h-full w-[200px]" style={{ position: 'relative' }}>
                                <h3 className="font-pixelify text-blue-deep text-lg mb-4">
                                    {roundIdx === rounds.length - 1 ? 'Winner' : `Round ${roundIdx + 1}`}
                                </h3>
                                {round.map((player, idx) => {
                                    const pos = boxPositions[roundIdx][idx];
                                    const isNextMatchPlayer = nextMatch && 
                                        (nextMatch.player1.id === player?.id || nextMatch.player2.id === player?.id);
                                    
                                    return (
                                        <div
                                            key={idx}
                                            className={`border border-blue-deep rounded-lg px-4 py-2 font-pixelify text-blue-deep text-lg w-[200px] flex flex-row items-center gap-2 justify-center absolute ${
                                                player ? 'bg-pink-light' : 'bg-gray-200'
                                            } ${isNextMatchPlayer ? 'ring-2 ring-yellow-400' : ''}`}
                                            style={{
                                                minHeight: `${boxHeight}px`,
                                                left: 0,
                                                top: pos.y,
                                                width: `${boxWidth}px`,
                                            }}
                                        >
                                            {/* Dots on four sides */}
                                            <span style={{
                                                position: 'absolute',
                                                left: -7,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                width: 10,
                                                height: 10,
                                                background: '#2563eb',
                                                borderRadius: '50%',
                                                display: 'block',
                                            }} />
                                            <span style={{
                                                position: 'absolute',
                                                right: -7,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                width: 10,
                                                height: 10,
                                                background: '#2563eb',
                                                borderRadius: '50%',
                                                display: 'block',
                                            }} />
                                            <span style={{
                                                position: 'absolute',
                                                left: '50%',
                                                top: -7,
                                                transform: 'translateX(-50%)',
                                                width: 10,
                                                height: 10,
                                                background: '#2563eb',
                                                borderRadius: '50%',
                                                display: 'block',
                                            }} />
                                            <span style={{
                                                position: 'absolute',
                                                left: '50%',
                                                bottom: -7,
                                                transform: 'translateX(-50%)',
                                                width: 10,
                                                height: 10,
                                                background: '#2563eb',
                                                borderRadius: '50%',
                                                display: 'block',
                                            }} />
                                            
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

                    <div className="absolute bottom-4 flex gap-4 items-center">
                        {nextMatch ? (
                            <button
                                className="button-pp-blue font-pixelify px-4 py-2 rounded"
                                onClick={() => startMatch(nextMatch)}
                            >
                                Start {nextMatch.player1.displayName} vs {nextMatch.player2.displayName}
                            </button>
                        ) : (
                            <div className="font-pixelify text-blue-deep text-xl">
                                Tournament Complete! 🏆
                            </div>
                        )}
                        
                        {/* Debug info */}
                        <div className="font-pixelify text-blue-deep text-sm">
                            Participants: {participants.length} | Completed: {tournamentMatches.length}/{totalExpectedMatches} matches
                        </div>
                    </div>
                </div>
            </section>
            <footer className="h-40 bg-blue-deep"></footer>
        </div>
    );
}
// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useTournament } from './tournamentContext';
// import type { TournamentMatch } from './tournamentContext';


// function getBracketRounds(participants: any[]) {
//     console.log('Generating bracket rounds for participants:', participants);
//     const rounds = [];
//     // let current = participants;
//     while (current.length > 1) {
//         rounds.push(current);
//         current = Array(Math.ceil(current.length / 2)).fill(null);
//     }
//     rounds.push([null]); // Winner box
//     return rounds;
// }

// export default function Bracket() {
//     const navigate = useNavigate();
//     const { tournamentData, setCurrentMatch } = useTournament();
//     const [matchCounter, setMatchCounter] = useState(1);

//     console.log('Tournament Data:', tournamentData);

//     useEffect(() => {
//         if (!tournamentData) {
//             navigate('/playerProfile');
//         }
//     }, [tournamentData, navigate]);

//     if (!tournamentData) {
//         return <div>Loading...</div>;
//     }

//     const participants = tournamentData.participants.map(p => ({
//         id: p.userID.toString(),
//         displayName: p.name,
//         avatarUrl: p.avatarUrl,
//     }));

//     const rounds = getBracketRounds(participants);

//     // Layout constants
//     const boxHeight = 60;
//     const boxWidth = 200;
//     const baseGap = 40;
//     const colGap = 60;

//     // Calculate SVG size
//     const svgWidth = rounds.length * (boxWidth + colGap);
//     // Calculate the height of each column
//     const columnHeights = rounds.map(round => round.length * boxHeight + (round.length - 1) * baseGap);
//     const maxColumnHeight = Math.max(...columnHeights);
//     const svgHeight = maxColumnHeight;

//     // The container width must match your .max-w-6xl (which is 72rem = 1152px)
//     const containerWidth = 1152;
//     // Calculate the offset to center the SVG over the boxes
//     const offsetX = (containerWidth - svgWidth) / 2;

//     // Calculate box positions for SVG lines and dots, centered vertically per column
//     const boxPositions: { x: number; y: number }[][] = [];
//     rounds.forEach((round, roundIdx) => {
//         const colX = roundIdx * (boxWidth + colGap);
//         const columnHeight = round.length * boxHeight + (round.length - 1) * baseGap;
//         const offsetY = (maxColumnHeight - columnHeight) / 2;
//         let y = offsetY;
//         const positions: { x: number; y: number }[] = [];
//         for (let i = 0; i < round.length; ++i) {
//             if (i !== 0) {
//                 y += boxHeight + baseGap;
//             }
//             positions.push({ x: colX, y });
//         }
//         boxPositions.push(positions);
//     });

//     // Debug: print all dot coordinates
//     boxPositions.forEach((round, roundIdx) => {
//         round.forEach((pos, idx) => {
//             const left = { x: pos.x, y: pos.y + boxHeight / 2 };
//             const right = { x: pos.x + boxWidth, y: pos.y + boxHeight / 2 };
//             const top = { x: pos.x + boxWidth / 2, y: pos.y };
//             const bottom = { x: pos.x + boxWidth / 2, y: pos.y + boxHeight };
//             // console.log(
//             //     `Round ${roundIdx}, Box ${idx}:`,
//             //     'Left', left,
//             //     'Right', right,
//             //     'Top', top,
//             //     'Bottom', bottom
//             // );
//         });
//     });

//     const startMatch = (player1: any, player2: any) => {
//         const gameType = tournamentData?.gameType || 'pong';

//         const match: TournamentMatch = {
//             player1: {
//                 userID: parseInt(player1.id),
//                 name: player1.displayName,
//                 avatarUrl: player1.avatarUrl
//             },
//             player2: {
//                 userID: parseInt(player2.id),
//                 name: player2.displayName,
//                 avatarUrl: player2.avatarUrl
//             },
//             tournamentBracketID: tournamentData.tournamentBracketID || 0,
//             tournamentMatchID: 0
//         };
        
//         console.log('Starting tournament match:', match);
//         setCurrentMatch(match);
        
//         // Increment match counter for display purposes
//         setMatchCounter(prev => prev + 1);
//         console.log("*******this is the game type", gameType);
//         if (gameType === 'snake') {
//             navigate(`/playerProfile/snakeGame?mode=tournament`);
//         } else {
//             navigate(`/playerProfile/pongGame?mode=tournament`);
//         }
//     };

//     return (
//         <div className="min-h-screen flex flex-col">
//             <header className="h-40 bg-blue-deep flex">
//                 <div className="font-pixelify text-white text-opacity-25 text-7xl m-auto">Tournament Bracket</div>
//             </header>
//             <section className="flex-1 bg-pink-grid flex items-center justify-center">
//                 <div
//                     className="relative bg-pink-dark w-full max-w-6xl min-h-[600px] m-[10px] flex justify-center items-center px-[50px]"
//                     style={{ width: containerWidth }}
//                 >
//                     {/* Bracket columns */}
//                     <div className="flex flex-row gap-[60px] w-full justify-center items-start" style={{ minHeight: svgHeight }}>
//                         {rounds.map((round, roundIdx) => (
//                             <div key={roundIdx} className="flex flex-col items-center justify-start h-full w-[200px]" style={{ position: 'relative' }}>
//                                 {round.map((player, idx) => {
//                                     const pos = boxPositions[roundIdx][idx];
//                                     return (
//                                         <div
//                                             key={idx}
//                                             className="bg-pink-light border border-blue-deep rounded-lg px-4 py-2 font-pixelify text-blue-deep text-lg w-[200px] flex flex-row items-center gap-2 justify-center absolute"
//                                             style={{
//                                                 minHeight: `${boxHeight}px`,
//                                                 left: 0,
//                                                 top: pos.y,
//                                                 width: `${boxWidth}px`,
//                                             }}
//                                         >
//                                             {/* Dots on four sides */}
//                                             <span style={{
//                                                 position: 'absolute',
//                                                 left: -7,
//                                                 top: '50%',
//                                                 transform: 'translateY(-50%)',
//                                                 width: 10,
//                                                 height: 10,
//                                                 background: '#2563eb',
//                                                 borderRadius: '50%',
//                                                 display: 'block',
//                                             }} />
//                                             <span style={{
//                                                 position: 'absolute',
//                                                 right: -7,
//                                                 top: '50%',
//                                                 transform: 'translateY(-50%)',
//                                                 width: 10,
//                                                 height: 10,
//                                                 background: '#2563eb',
//                                                 borderRadius: '50%',
//                                                 display: 'block',
//                                             }} />
//                                             <span style={{
//                                                 position: 'absolute',
//                                                 left: '50%',
//                                                 top: -7,
//                                                 transform: 'translateX(-50%)',
//                                                 width: 10,
//                                                 height: 10,
//                                                 background: '#2563eb',
//                                                 borderRadius: '50%',
//                                                 display: 'block',
//                                             }} />
//                                             <span style={{
//                                                 position: 'absolute',
//                                                 left: '50%',
//                                                 bottom: -7,
//                                                 transform: 'translateX(-50%)',
//                                                 width: 10,
//                                                 height: 10,
//                                                 background: '#2563eb',
//                                                 borderRadius: '50%',
//                                                 display: 'block',
//                                             }} />
//                                             {/* Profile content */}
//                                             {player ? (
//                                                 <>
//                                                     <img
//                                                         src={player.avatarUrl}
//                                                         alt={player.displayName}
//                                                         className="w-10 h-10 rounded-full"
//                                                         style={{ objectFit: 'cover', background: '#fff' }}
//                                                     />
//                                                     <span>{player.displayName}</span>
//                                                 </>
//                                             ) : (
//                                                 <span className="text-gray-400">Empty</span>
//                                             )}
//                                         </div>
//                                     );
//                                 })}
//                             </div>
                            
//                         ))}
//                     </div>
//                     {/* <button
//                         onClick={() => {
//                             // Example: start match between first two participants
//                             if (participants.length >= 2) {
//                                 startMatch(participants[0], participants[1], 'pong');
//                             }
//                         }}
//                         >
//                         Start Game
//                     </button>
//                 </div>
//             </section>
//             <footer className="h-40 bg-blue-deep"></footer>
//         </div>
//     );
// } */}
//                     <div className="absolute bottom-4 flex gap-2">
//                         <button
//                             className="button-pp-blue font-pixelify px-4 py-2 rounded"
//                             onClick={() => {
//                                 if (participants.length >= 2) {
//                                     startMatch(participants[0], participants[1]);
//                                 }
//                             }}
//                         >
//                             Start Match #{matchCounter}
//                         </button>
//                     </div>
//                 </div>
//             </section>
//             <footer className="h-40 bg-blue-deep"></footer>
//         </div>
//     );
// }

// 


// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useTournament } from './tournamentContext';
// import type { TournamentMatch } from './tournamentContext';

// interface MatchResult {
//     matchID: number;
//     tournamentMatchID: number;
//     user1ID: number;
//     user2ID: number;
//     user1Score: number;
//     user2Score: number;
//     winnerID: number;
//     user1Name: string;
//     user2Name: string;
//     winnerName: string;
// }

// function getBracketRounds(participants: any[]) {
//     console.log('Generating bracket rounds for participants:', participants);
//     const rounds = [];
//     let current = [...participants]; // Make a copy
    
//     while (current.length > 1) {
//         rounds.push([...current]); // Store current round
        
//         // Calculate next round size
//         const nextRoundSize = Math.ceil(current.length / 2);
//         current = Array(nextRoundSize).fill(null);
//     }
    
//     rounds.push([null]); // Winner box
//     console.log('Generated rounds structure:', rounds.map((r, i) => `Round ${i + 1}: ${r.length} slots`));
//     return rounds;
// }

// export default function Bracket() {
//     const navigate = useNavigate();
//     const { tournamentData, setCurrentMatch } = useTournament();
//     const [matchCounter, setMatchCounter] = useState(1);
//     const [tournamentMatches, setTournamentMatches] = useState<MatchResult[]>([]);
//     const [loading, setLoading] = useState(true);

//     console.log('Tournament Data:', tournamentData);

//     // Fetch tournament matches from database
//     useEffect(() => {
//         const fetchTournamentMatches = async () => {
//             if (!tournamentData?.tournamentBracketID) return;
            
//             try {
//                 setLoading(true);
//                 console.log('Fetching matches for tournament bracket:', tournamentData.tournamentBracketID);
                
//                 const response = await fetch(`https://localhost:8443/tournament/${tournamentData.tournamentBracketID}/matches`);
                
//                 console.log('Response status:', response.status);
//                 console.log('Response ok:', response.ok);
                
//                 if (response.ok) {
//                     const data = await response.json();
//                     console.log('Raw response data:', data);
//                     console.log('Tournament matches from DB:', data.matches);
//                     setTournamentMatches(data.matches || []);
//                 } else {
//                     const errorText = await response.text();
//                     console.error('Failed to fetch tournament matches:', response.status, errorText);
//                     setTournamentMatches([]);
//                 }
//             } catch (error) {
//                 console.error('Error fetching tournament matches:', error);
//                 setTournamentMatches([]);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchTournamentMatches();
//     }, [tournamentData?.tournamentBracketID]);

//     useEffect(() => {
//         if (!tournamentData) {
//             navigate('/playerProfile');
//         }
//     }, [tournamentData, navigate]);

//     if (!tournamentData) {
//         return <div>Loading...</div>;
//     }

//     if (loading) {
//         return (
//             <div className="min-h-screen flex items-center justify-center">
//                 <div className="font-pixelify text-blue-deep text-xl">Loading tournament bracket...</div>
//             </div>
//         );
//     }

//     const participants = tournamentData.participants.map(p => ({
//         id: p.userID.toString(),
//         displayName: p.name,
//         avatarUrl: p.avatarUrl,
//     }));

//     // Get rounds and fill in winners + handle byes
//     const rounds = getBracketRounds(participants);
    
//     // First, handle "byes" (odd number of players)
//     if (participants.length % 2 === 1) {
//         // The last player gets a bye to the next round
//         const byePlayer = participants[participants.length - 1];
//         console.log(`Player ${byePlayer.displayName} gets a bye to round 2`);
        
//         // Calculate their position in round 2
//         const byePosition = Math.floor((participants.length - 1) / 2);
//         if (rounds[1] && byePosition < rounds[1].length) {
//             rounds[1][byePosition] = byePlayer;
//         }
//     }
    
//     // Fill winners from database matches into next rounds
//     tournamentMatches.forEach(match => {
//         if (match.winnerID && match.tournamentMatchID) {
//             const winner = tournamentData.participants.find(p => p.userID === match.winnerID);
//             if (winner) {
//                 const winnerObj = {
//                     id: winner.userID.toString(),
//                     displayName: winner.name,
//                     avatarUrl: winner.avatarUrl,
//                 };
                
//                 console.log('Processing match:', {
//                     matchID: match.matchID,
//                     tournamentMatchID: match.tournamentMatchID,
//                     winnerID: match.winnerID,
//                     winnerName: winner.name
//                 });
                
//                 // Fix: Better winner placement logic
//                 const tournamentMatchID = match.tournamentMatchID;
                
//                 // Determine which round this match belongs to
//                 const firstRoundMatches = Math.floor(participants.length / 2);
                
//                 if (tournamentMatchID <= firstRoundMatches) {
//                     // This is a first round match
//                     const matchIndex = tournamentMatchID - 1; // 0-based
//                     const nextRoundIndex = 1; // Second column
//                     const positionInNextRound = Math.floor(matchIndex / 2);
                    
//                     console.log(`First round match ${tournamentMatchID}: placing winner ${winner.name} in round ${nextRoundIndex}, position ${positionInNextRound}`);
                    
//                     if (nextRoundIndex < rounds.length && positionInNextRound < rounds[nextRoundIndex].length) {
//                         rounds[nextRoundIndex][positionInNextRound] = winnerObj;
//                     }
//                 } else {
//                     // This is a later round match
//                     const laterRoundMatchIndex = tournamentMatchID - firstRoundMatches - 1;
//                     const currentRoundIndex = 2; // Third column (adjust as needed for more rounds)
//                     const positionInNextRound = Math.floor(laterRoundMatchIndex / 2);
                    
//                     console.log(`Later round match ${tournamentMatchID}: placing winner ${winner.name} in round ${currentRoundIndex}, position ${positionInNextRound}`);
                    
//                     if (currentRoundIndex < rounds.length && positionInNextRound < rounds[currentRoundIndex].length) {
//                         rounds[currentRoundIndex][positionInNextRound] = winnerObj;
//                     }
//                 }
//             }
//         }
//     });

//     // Fix: Better next match detection that handles byes and multiple rounds
//     const getNextMatch = () => {
//         const completedMatchIDs = new Set(tournamentMatches.map(m => m.tournamentMatchID).filter(id => id !== undefined));
//         console.log('Completed tournament match IDs:', Array.from(completedMatchIDs));
        
//         let matchCounter = 1;
        
//         // Check all rounds, starting from first round
//         for (let roundIndex = 0; roundIndex < rounds.length - 1; roundIndex++) {
//             const round = rounds[roundIndex];
            
//             if (roundIndex === 0) {
//                 // First round: check actual participants (not including bye players)
//                 const actualMatches = Math.floor(participants.length / 2);
                
//                 for (let i = 0; i < actualMatches; i++) {
//                     const player1 = participants[i * 2];
//                     const player2 = participants[i * 2 + 1];
//                     const tournamentMatchID = matchCounter++;
                    
//                     console.log(`Checking first round match ${tournamentMatchID}: ${player1?.displayName} vs ${player2?.displayName}, completed: ${completedMatchIDs.has(tournamentMatchID)}`);
                    
//                     if (player1 && player2 && !completedMatchIDs.has(tournamentMatchID)) {
//                         console.log(`Next match found: ${player1.displayName} vs ${player2.displayName}`);
//                         return {
//                             player1,
//                             player2,
//                             tournamentMatchID: tournamentMatchID,
//                             roundIndex
//                         };
//                     }
//                 }
//             } else {
//                 // Subsequent rounds: check pairs in the current round
//                 for (let i = 0; i < Math.floor(round.length / 2); i++) {
//                     const player1 = round[i * 2];
//                     const player2 = round[i * 2 + 1];
                    
//                     if (player1 && player2) {
//                         const tournamentMatchID = matchCounter++;
                        
//                         console.log(`Checking round ${roundIndex + 1} match ${tournamentMatchID}: ${player1?.displayName} vs ${player2?.displayName}, completed: ${completedMatchIDs.has(tournamentMatchID)}`);
                        
//                         if (!completedMatchIDs.has(tournamentMatchID)) {
//                             console.log(`Next match found in round ${roundIndex + 1}: ${player1.displayName} vs ${player2.displayName}`);
//                             return {
//                                 player1,
//                                 player2,
//                                 tournamentMatchID: tournamentMatchID,
//                                 roundIndex
//                             };
//                         }
//                     }
//                 }
//             }
//         }
        
//         console.log('No more matches to play - tournament complete');
//         return null;
//     };

//     const nextMatch = getNextMatch();

//     // Layout constants (keep same as before)
//     const boxHeight = 60;
//     const boxWidth = 200;
//     const baseGap = 40;
//     const colGap = 60;

//     const svgWidth = rounds.length * (boxWidth + colGap);
//     const columnHeights = rounds.map(round => round.length * boxHeight + (round.length - 1) * baseGap);
//     const maxColumnHeight = Math.max(...columnHeights);
//     const svgHeight = maxColumnHeight;

//     const containerWidth = 1152;

//     const boxPositions: { x: number; y: number }[][] = [];
//     rounds.forEach((round, roundIdx) => {
//         const colX = roundIdx * (boxWidth + colGap);
//         const columnHeight = round.length * boxHeight + (round.length - 1) * baseGap;
//         const offsetY = (maxColumnHeight - columnHeight) / 2;
//         let y = offsetY;
//         const positions: { x: number; y: number }[] = [];
//         for (let i = 0; i < round.length; ++i) {
//             if (i !== 0) {
//                 y += boxHeight + baseGap;
//             }
//             positions.push({ x: colX, y });
//         }
//         boxPositions.push(positions);
//     });

//     const startMatch = (matchInfo: any) => {
//         const gameType = tournamentData?.gameType || 'pong';

//         const match: TournamentMatch = {
//             player1: {
//                 userID: parseInt(matchInfo.player1.id),
//                 name: matchInfo.player1.displayName,
//                 avatarUrl: matchInfo.player1.avatarUrl
//             },
//             player2: {
//                 userID: parseInt(matchInfo.player2.id),
//                 name: matchInfo.player2.displayName,
//                 avatarUrl: matchInfo.player2.avatarUrl
//             },
//             tournamentBracketID: tournamentData.tournamentBracketID || 0,
//             tournamentMatchID: matchInfo.tournamentMatchID
//         };
        
//         console.log('Starting tournament match:', match);
//         setCurrentMatch(match);
        
//         setMatchCounter(prev => prev + 1);
//         console.log("*******this is the game type", gameType);
        
//         if (gameType === 'snake') {
//             navigate(`/playerProfile/snakeGame?mode=tournament`);
//         } else {
//             navigate(`/playerProfile/pongGame?mode=tournament`);
//         }
//     };

//     return (
//         <div className="min-h-screen flex flex-col">
//             <header className="h-40 bg-blue-deep flex">
//                 <div className="font-pixelify text-white text-opacity-25 text-7xl m-auto">
//                     {tournamentData.gameType.charAt(0).toUpperCase() + tournamentData.gameType.slice(1)} Tournament
//                 </div>
//             </header>
//             <section className="flex-1 bg-pink-grid flex items-center justify-center">
//                 <div
//                     className="relative bg-pink-dark w-full max-w-6xl min-h-[600px] m-[10px] flex justify-center items-center px-[50px]"
//                     style={{ width: containerWidth }}
//                 >
//                     {/* Bracket columns */}
//                     <div className="flex flex-row gap-[60px] w-full justify-center items-start" style={{ minHeight: svgHeight }}>
//                         {rounds.map((round, roundIdx) => (
//                             <div key={roundIdx} className="flex flex-col items-center justify-start h-full w-[200px]" style={{ position: 'relative' }}>
//                                 <h3 className="font-pixelify text-blue-deep text-lg mb-4">
//                                     {roundIdx === rounds.length - 1 ? 'Winner' : `Round ${roundIdx + 1}`}
//                                 </h3>
//                                 {round.map((player, idx) => {
//                                     const pos = boxPositions[roundIdx][idx];
//                                     const isNextMatchPlayer = nextMatch && 
//                                         (nextMatch.player1.id === player?.id || nextMatch.player2.id === player?.id);
                                    
//                                     return (
//                                         <div
//                                             key={idx}
//                                             className={`border border-blue-deep rounded-lg px-4 py-2 font-pixelify text-blue-deep text-lg w-[200px] flex flex-row items-center gap-2 justify-center absolute ${
//                                                 player ? 'bg-pink-light' : 'bg-gray-200'
//                                             } ${isNextMatchPlayer ? 'ring-2 ring-yellow-400' : ''}`}
//                                             style={{
//                                                 minHeight: `${boxHeight}px`,
//                                                 left: 0,
//                                                 top: pos.y,
//                                                 width: `${boxWidth}px`,
//                                             }}
//                                         >
//                                             {/* Dots on four sides */}
//                                             <span style={{
//                                                 position: 'absolute',
//                                                 left: -7,
//                                                 top: '50%',
//                                                 transform: 'translateY(-50%)',
//                                                 width: 10,
//                                                 height: 10,
//                                                 background: '#2563eb',
//                                                 borderRadius: '50%',
//                                                 display: 'block',
//                                             }} />
//                                             <span style={{
//                                                 position: 'absolute',
//                                                 right: -7,
//                                                 top: '50%',
//                                                 transform: 'translateY(-50%)',
//                                                 width: 10,
//                                                 height: 10,
//                                                 background: '#2563eb',
//                                                 borderRadius: '50%',
//                                                 display: 'block',
//                                             }} />
//                                             <span style={{
//                                                 position: 'absolute',
//                                                 left: '50%',
//                                                 top: -7,
//                                                 transform: 'translateX(-50%)',
//                                                 width: 10,
//                                                 height: 10,
//                                                 background: '#2563eb',
//                                                 borderRadius: '50%',
//                                                 display: 'block',
//                                             }} />
//                                             <span style={{
//                                                 position: 'absolute',
//                                                 left: '50%',
//                                                 bottom: -7,
//                                                 transform: 'translateX(-50%)',
//                                                 width: 10,
//                                                 height: 10,
//                                                 background: '#2563eb',
//                                                 borderRadius: '50%',
//                                                 display: 'block',
//                                             }} />
                                            
//                                             {/* Profile content */}
//                                             {player ? (
//                                                 <>
//                                                     <img
//                                                         src={player.avatarUrl}
//                                                         alt={player.displayName}
//                                                         className="w-10 h-10 rounded-full"
//                                                         style={{ objectFit: 'cover', background: '#fff' }}
//                                                     />
//                                                     <span>{player.displayName}</span>
//                                                 </>
//                                             ) : (
//                                                 <span className="text-gray-400">
//                                                     {roundIdx === 0 ? 'Empty' : 'TBD'}
//                                                 </span>
//                                             )}
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                         ))}
//                     </div>

//                     <div className="absolute bottom-4 flex gap-2">
//                         {nextMatch ? (
//                             <button
//                                 className="button-pp-blue font-pixelify px-4 py-2 rounded"
//                                 onClick={() => startMatch(nextMatch)}
//                             >
//                                 Start {nextMatch.player1.displayName} vs {nextMatch.player2.displayName}
//                             </button>
//                         ) : (
//                             <div className="font-pixelify text-blue-deep text-xl">
//                                 Tournament Complete! 🏆
//                             </div>
//                         )}
                        
//                         {/* Debug info */}
//                         <div className="font-pixelify text-blue-deep text-sm">
//                             Participants: {participants.length} | Completed: {tournamentMatches.length} matches
//                         </div>
                        
//                         <button
//                             className="button-pp-blue font-pixelify px-4 py-2 rounded bg-gray-500"
//                             onClick={() => window.location.reload()}
//                         >
//                             Refresh
//                         </button>
//                     </div>
//                 </div>
//             </section>
//             <footer className="h-40 bg-blue-deep"></footer>
//         </div>
//     );
// }