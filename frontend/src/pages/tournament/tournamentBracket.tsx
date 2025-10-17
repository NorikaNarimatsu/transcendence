import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTournament } from './tournamentContext';
import { useSelectedPlayer } from '../user/PlayerContext';
import type { Match } from './tournamentContext';

function getBracketRounds(matches: Match[]) {
    if (!matches || matches.length === 0) return [];
    
    const maxRound = Math.max(...matches.map(m => m.round));
    const rounds = [];
    
    for (let round = 1; round <= maxRound; round++) {
        const roundMatches = matches.filter(m => m.round === round);
        // Convert matches to display format
        const roundPlayers = [];
        
        roundMatches.forEach(match => {
            if (match.winner) {
                // Show winner if match is complete
                roundPlayers.push({
                    id: match.winner.userID.toString(),
                    displayName: match.winner.name,
                    avatarUrl: match.winner.avatarUrl,
                    isWinner: true
                });
            } else if (match.player1 && match.player2) {
                // Show both players if match is ready
                roundPlayers.push({
                    id: `${match.player1.userID}-vs-${match.player2.userID}`,
                    displayName: `${match.player1.name} vs ${match.player2.name}`,
                    avatarUrl: match.player1.avatarUrl,
                    isMatch: true,
                    match: match
                });
            } else if (match.player1) {
                // Show single player (bye)
                roundPlayers.push({
                    id: match.player1.userID.toString(),
                    displayName: match.player1.name,
                    avatarUrl: match.player1.avatarUrl,
                    isBye: true
                });
            } else {
                // Empty slot
                roundPlayers.push(null);
            }
        });
        
        rounds.push(roundPlayers);
    }
    
    // Add final winner slot if tournament is complete
    const finalMatch = matches.find(m => m.round === maxRound);
    if (finalMatch?.winner) {
        rounds.push([{
            id: finalMatch.winner.userID.toString(),
            displayName: finalMatch.winner.name,
            avatarUrl: finalMatch.winner.avatarUrl,
            isChampion: true
        }]);
    } else {
        rounds.push([null]); // Winner slot
    }
    
    return rounds;
}

export default function TournamentBracket() {
    const navigate = useNavigate();
    const { tournamentData, setTournamentData, setCurrentMatch } = useTournament();
    const { setSelectedPlayer } = useSelectedPlayer();

    useEffect(() => {
        if (!tournamentData || !tournamentData.matches) {
            navigate('/playerProfile');
            return;
        }

        // Handle automatic advancement for matches with only one player
        const updatedMatches = tournamentData.matches.map(match => {
            if (match.player1 && !match.player2 && !match.winner) {
                console.log(`${match.player1.name} gets automatic advancement (bye)`);
                return { ...match, winner: match.player1 };
            }
            if (!match.player1 && match.player2 && !match.winner) {
                console.log(`${match.player2.name} gets automatic advancement (bye)`);
                return { ...match, winner: match.player2 };
            }
            return match;
        });

        // Check if we need to generate next round
        const hasAutoAdvancement = updatedMatches.some((match, index) => 
            match !== tournamentData.matches[index]
        );

        if (hasAutoAdvancement) {
            const newMatches = generateNextRound(updatedMatches);
            setTournamentData({
                ...tournamentData,
                matches: newMatches
            });
        }
    }, [tournamentData, navigate, setTournamentData]);

    // Function to generate next round matches
    const generateNextRound = (matches: Match[]): Match[] => {
        const currentRound = Math.max(...matches.map(m => m.round));
        const currentRoundMatches = matches.filter(m => m.round === currentRound);
        const allCurrentRoundComplete = currentRoundMatches.every(m => m.winner);

        if (allCurrentRoundComplete && currentRoundMatches.length > 1) {
            const winners = currentRoundMatches.map(m => m.winner).filter(Boolean);
            const nextRoundMatches: Match[] = [];

            for (let i = 0; i < Math.ceil(winners.length / 2); i++) {
                const player1 = winners[i * 2] || null;
                const player2 = winners[i * 2 + 1] || null;

                nextRoundMatches.push({
                    id: `${currentRound + 1}-${i}`,
                    player1,
                    player2,
                    winner: null,
                    round: currentRound + 1,
                    position: i
                });
            }

            return [...matches, ...nextRoundMatches];
        }

        return matches;
    };

    // Handle starting a game using player context
    const handleStartMatch = (match: Match) => {
        if (!match.player1 || !match.player2 || !tournamentData) return;
        
        console.log('Starting tournament match:', match);
        
        // Set the opponent in player context
        setSelectedPlayer(match.player2);
        
        // Set current match in tournament context
        if (setCurrentMatch) {
            setCurrentMatch(match);
        }
        
        // Navigate to appropriate game
        if (tournamentData.gameType === 'pong') {
            navigate('/pongGame?mode=tournament');
        } else if (tournamentData.gameType === 'snake') {
            navigate('/snakeGame?mode=tournament');
        }
    };

    if (!tournamentData || !tournamentData.matches) {
        return <div>Loading...</div>;
    }

    // Get the bracket rounds for display
    const rounds = getBracketRounds(tournamentData.matches);
    
    // Find current match to play
    const currentMatch = tournamentData.matches.find(match => 
        match.player1 && match.player2 && !match.winner
    );

    // Layout constants (same as your original)
    const boxHeight = 60;
    const boxWidth = 200;
    const baseGap = 40;
    const colGap = 60;

    const svgWidth = rounds.length * (boxWidth + colGap);
    const columnHeights = rounds.map(round => round.length * boxHeight + (round.length - 1) * baseGap);
    const maxColumnHeight = Math.max(...columnHeights);
    const svgHeight = maxColumnHeight;

    const containerWidth = 1152;
    const offsetX = (containerWidth - svgWidth) / 2;

    // Calculate box positions (same as your original)
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

    return (
        <div className="min-h-screen flex flex-col">
            <header className="h-40 bg-blue-deep flex">
                <div className="font-pixelify text-white text-opacity-25 text-7xl m-auto">
                    {tournamentData.gameType.toUpperCase()} Tournament
                </div>
            </header>
            <section className="flex-1 bg-pink-grid flex items-center justify-center">
                <div
                    className="relative bg-pink-dark w-full max-w-6xl min-h-[600px] m-[10px] flex flex-col justify-center items-center px-[50px]"
                    style={{ width: containerWidth }}
                >
                    {/* Current Match Info */}
                    {currentMatch && (
                        <div className="mb-4 bg-pink-light rounded-lg p-4 flex items-center gap-4">
                            <span className="font-pixelify text-blue-deep text-lg">
                                Next: {currentMatch.player1!.name} vs {currentMatch.player2!.name}
                            </span>
                            <button
                                onClick={() => handleStartMatch(currentMatch)}
                                className="button-pp-blue font-pixelify px-4 py-2 rounded text-sm"
                            >
                                Start Game
                            </button>
                        </div>
                    )}

                    {/* Bracket Layout */}
                    <div className="flex flex-row gap-[60px] w-full justify-center items-start" style={{ minHeight: svgHeight }}>
                        {rounds.map((round, roundIdx) => (
                            <div key={roundIdx} className="flex flex-col items-center justify-start h-full w-[200px]" style={{ position: 'relative' }}>
                                {/* Round Label */}
                                <div className="font-pixelify text-blue-deep text-sm mb-4">
                                    {roundIdx === rounds.length - 1 ? 'Winner' : `Round ${roundIdx + 1}`}
                                </div>
                                
                                {round.map((player, idx) => {
                                    const pos = boxPositions[roundIdx][idx];
                                    const isCurrentMatch = player?.match === currentMatch;
                                    
                                    return (
                                        <div
                                            key={idx}
                                            className={`border rounded-lg px-4 py-2 font-pixelify text-blue-deep text-lg w-[200px] flex flex-row items-center gap-2 justify-center absolute ${
                                                player?.isChampion ? 'bg-yellow-200 border-yellow-500' :
                                                player?.isWinner ? 'bg-green-200 border-green-500' :
                                                isCurrentMatch ? 'bg-yellow-100 border-yellow-400' :
                                                player?.isBye ? 'bg-blue-100 border-blue-400' :
                                                player ? 'bg-pink-light border-blue-deep' : 'bg-gray-100 border-gray-300'
                                            }`}
                                            style={{
                                                minHeight: `${boxHeight}px`,
                                                left: 0,
                                                top: pos.y,
                                                width: `${boxWidth}px`,
                                            }}
                                        >
                                            {/* Dots on four sides (same as original) */}
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
                                            
                                            {/* Content */}
                                            {player ? (
                                                <div className="flex items-center gap-2">
                                                    <img
                                                        src={player.avatarUrl}
                                                        alt={player.displayName}
                                                        className="w-8 h-8 rounded-full"
                                                        style={{ objectFit: 'cover', background: '#fff' }}
                                                    />
                                                    <span className="text-sm truncate">
                                                        {player.isMatch ? 
                                                            `${player.match.player1.name} vs ${player.match.player2.name}` :
                                                            player.displayName
                                                        }
                                                    </span>
                                                    {player.isChampion && <span>🏆</span>}
                                                    {isCurrentMatch && <span>▶️</span>}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm">TBD</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <footer className="h-40 bg-blue-deep"></footer>
        </div>
    );
}

// import { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useTournament } from './tournamentContext';
// import type { Match } from './tournamentContext';


// function getBracketRounds(participants: any[]) {
//     const rounds = [];
//     let current = participants;
//     while (current.length > 1) {
//         rounds.push(current);
//         current = Array(Math.ceil(current.length / 2)).fill(null);
//     }
//     rounds.push([null]); // Winner box
//     return rounds;
// }

// export default function Bracket() {
//     const navigate = useNavigate();
//     const { tournamentData } = useTournament();

//     useEffect(() => {
//         if (!tournamentData) {
//             navigate('/profile');
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
//             console.log(
//                 `Round ${roundIdx}, Box ${idx}:`,
//                 'Left', left,
//                 'Right', right,
//                 'Top', top,
//                 'Bottom', bottom
//             );
//         });
//     });

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
//                 </div>
//             </section>
//             <footer className="h-40 bg-blue-deep"></footer>
//         </div>
//     );
// }

// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useTournament } from './tournamentContext';
// import type { Match } from './tournamentContext';

// export default function TournamentBracket() {
//     const navigate = useNavigate();
//     const { tournamentData, setTournamentData } = useTournament();

//     useEffect(() => {
//         if (!tournamentData || !tournamentData.matches) {
//             navigate('/playerProfile');
//             return;
//         }

//         // Handle automatic advancement for matches with only one player
//         const updatedMatches = tournamentData.matches.map(match => {
//             // If match has only one player, automatically advance them
//             if (match.player1 && !match.player2 && !match.winner) {
//                 console.log(`${match.player1.name} gets automatic advancement (bye)`);
//                 return { ...match, winner: match.player1 };
//             }
//             if (!match.player1 && match.player2 && !match.winner) {
//                 console.log(`${match.player2.name} gets automatic advancement (bye)`);
//                 return { ...match, winner: match.player2 };
//             }
//             return match;
//         });

//         // Check if we need to generate next round
//         const hasAutoAdvancement = updatedMatches.some((match, index) => 
//             match !== tournamentData.matches[index]
//         );

//         if (hasAutoAdvancement) {
//             const newMatches = generateNextRound(updatedMatches);
//             setTournamentData({
//                 ...tournamentData,
//                 matches: newMatches
//             });
//         }
//     }, [tournamentData, navigate, setTournamentData]);

//     // Function to generate next round matches
//     const generateNextRound = (matches: Match[]): Match[] => {
//         const currentRound = Math.max(...matches.map(m => m.round));
//         const currentRoundMatches = matches.filter(m => m.round === currentRound);
//         const allCurrentRoundComplete = currentRoundMatches.every(m => m.winner);

//         if (allCurrentRoundComplete && currentRoundMatches.length > 1) {
//             const winners = currentRoundMatches.map(m => m.winner).filter(Boolean);
//             const nextRoundMatches: Match[] = [];

//             for (let i = 0; i < Math.ceil(winners.length / 2); i++) {
//                 const player1 = winners[i * 2] || null;
//                 const player2 = winners[i * 2 + 1] || null;

//                 nextRoundMatches.push({
//                     id: `${currentRound + 1}-${i}`,
//                     player1,
//                     player2,
//                     winner: null,
//                     round: currentRound + 1,
//                     position: i
//                 });
//             }

//             return [...matches, ...nextRoundMatches];
//         }

//         return matches;
//     };

//     // Handle match completion from game
//     const handleMatchComplete = (matchId: string, winnerId: number) => {
//         const match = tournamentData?.matches?.find(m => m.id === matchId);
//         if (!match) return;

//         const winner = winnerId === match.player1?.userID ? match.player1 : match.player2;
//         if (!winner) return;

//         const updatedMatches = tournamentData.matches.map(m => 
//             m.id === matchId ? { ...m, winner } : m
//         );

//         const newMatches = generateNextRound(updatedMatches);

//         setTournamentData({
//             ...tournamentData,
//             matches: newMatches
//         });
//     };

//     // Handle starting a game
//     const handleStartMatch = (match: Match) => {
//         if (!match.player1 || !match.player2 || !tournamentData) return;
        
//         // Navigate to appropriate game based on tournament type
//         let gameUrl = '';
        
//         if (tournamentData.gameType === 'pong') {
//             gameUrl = `/pongGame?tournament=true&player1=${match.player1.userID}&player2=${match.player2.userID}&matchId=${match.id}&player1Name=${encodeURIComponent(match.player1.name)}&player2Name=${encodeURIComponent(match.player2.name)}`;
//         } else if (tournamentData.gameType === 'snake') {
//             gameUrl = `/snakeGame?tournament=true&player1=${match.player1.userID}&player2=${match.player2.userID}&matchId=${match.id}&player1Name=${encodeURIComponent(match.player1.name)}&player2Name=${encodeURIComponent(match.player2.name)}`;
//         }
        
//         navigate(gameUrl);
//     };

//     if (!tournamentData || !tournamentData.matches) {
//         return <div>Loading...</div>;
//     }

//     // Find current match to play (both players present, no winner)
//     const currentMatch = tournamentData.matches.find(match => 
//         match.player1 && match.player2 && !match.winner
//     );

//     // Check if tournament is complete
//     const maxRound = Math.max(...tournamentData.matches.map(m => m.round));
//     const finalMatches = tournamentData.matches.filter(m => m.round === maxRound);
//     const isComplete = finalMatches.length === 1 && finalMatches[0].winner;
//     const winner = isComplete ? finalMatches[0].winner : null;

//     // Group matches by round for display
//     const matchesByRound = tournamentData.matches.reduce((acc, match) => {
//         if (!acc[match.round]) acc[match.round] = [];
//         acc[match.round].push(match);
//         return acc;
//     }, {} as Record<number, Match[]>);

//     if (winner) {
//         return (
//             <div className="min-h-screen flex flex-col">
//                 <header className="h-40 bg-blue-deep flex">
//                     <div className="font-pixelify text-white text-opacity-25 text-7xl m-auto">Tournament Complete!</div>
//                 </header>
//                 <section className="flex-1 bg-pink-grid flex items-center justify-center">
//                     <div className="bg-pink-dark rounded-lg p-8 flex flex-col items-center">
//                         <h2 className="font-pixelify text-blue-deep text-4xl mb-4">🏆 Winner! 🏆</h2>
//                         <div className="flex flex-col items-center gap-4">
//                             <img src={winner.avatarUrl} alt={winner.name} className="w-20 h-20 rounded-full" />
//                             <span className="font-pixelify text-blue-deep text-2xl">{winner.name}</span>
//                         </div>
//                         <button
//                             onClick={() => {
//                                 navigate('/playerProfile');
//                             }}
//                             className="button-pp-blue font-pixelify px-6 py-2 rounded mt-6 text-lg"
//                         >
//                             Back to Profile
//                         </button>
//                     </div>
//                 </section>
//                 <footer className="h-40 bg-blue-deep"></footer>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen flex flex-col">
//             <header className="h-40 bg-blue-deep flex">
//                 <div className="font-pixelify text-white text-opacity-25 text-7xl m-auto">
//                     {tournamentData.gameType.toUpperCase()} Tournament
//                 </div>
//             </header>
//             <section className="flex-1 bg-pink-grid flex items-center justify-center">
//                 <div className="bg-pink-dark rounded-lg p-8 w-full max-w-6xl">
                    
//                     {/* Current Match Section */}
//                     {currentMatch && (
//                         <div className="mb-8 bg-pink-light rounded-lg p-6">
//                             <h3 className="font-pixelify text-blue-deep text-2xl mb-4 text-center">Next Match</h3>
//                             <div className="flex items-center justify-center gap-8">
//                                 <div className="text-center">
//                                     <img src={currentMatch.player1!.avatarUrl} alt={currentMatch.player1!.name} className="w-16 h-16 rounded-full mx-auto mb-2" />
//                                     <span className="font-pixelify text-blue-deep">{currentMatch.player1!.name}</span>
//                                 </div>
//                                 <span className="font-pixelify text-blue-deep text-3xl">VS</span>
//                                 <div className="text-center">
//                                     <img src={currentMatch.player2!.avatarUrl} alt={currentMatch.player2!.name} className="w-16 h-16 rounded-full mx-auto mb-2" />
//                                     <span className="font-pixelify text-blue-deep">{currentMatch.player2!.name}</span>
//                                 </div>
//                             </div>
//                             <button
//                                 onClick={() => handleStartMatch(currentMatch)}
//                                 className="button-pp-blue font-pixelify px-8 py-3 rounded mt-4 text-xl mx-auto block"
//                             >
//                                 Start {tournamentData.gameType.toUpperCase()} Game
//                             </button>
//                         </div>
//                     )}

//                     {/* No current match message */}
//                     {!currentMatch && !winner && (
//                         <div className="mb-8 bg-pink-light rounded-lg p-6 text-center">
//                             <h3 className="font-pixelify text-blue-deep text-xl">Waiting for next round...</h3>
//                         </div>
//                     )}

//                     {/* Tournament Bracket Display */}
//                     <div className="space-y-6">
//                         {Object.entries(matchesByRound).map(([round, matches]) => (
//                             <div key={round} className="bg-pink-medium rounded-lg p-4">
//                                 <h4 className="font-pixelify text-blue-deep text-xl mb-4 text-center">
//                                     Round {round}
//                                 </h4>
//                                 <div className="grid gap-4" style={{ 
//                                     gridTemplateColumns: `repeat(${Math.max(1, matches.length)}, 1fr)` 
//                                 }}>
//                                     {matches.map((match) => (
//                                         <div 
//                                             key={match.id} 
//                                             className={`bg-pink-light rounded-lg p-4 border-2 ${
//                                                 match.winner ? 'border-green-500' : 
//                                                 match === currentMatch ? 'border-yellow-500' : 'border-blue-deep'
//                                             }`}
//                                         >
//                                             <div className="flex flex-col gap-2">
//                                                 {/* Player 1 */}
//                                                 <div className={`flex items-center gap-2 p-2 rounded ${
//                                                     match.winner?.userID === match.player1?.userID ? 'bg-green-200' : ''
//                                                 }`}>
//                                                     {match.player1 ? (
//                                                         <>
//                                                             <img src={match.player1.avatarUrl} alt={match.player1.name} className="w-8 h-8 rounded-full" />
//                                                             <span className="font-pixelify text-sm">{match.player1.name}</span>
//                                                         </>
//                                                     ) : (
//                                                         <span className="font-pixelify text-sm text-gray-400">Waiting...</span>
//                                                     )}
//                                                 </div>
                                                
//                                                 <div className="text-center font-pixelify text-xs">VS</div>
                                                
//                                                 {/* Player 2 */}
//                                                 <div className={`flex items-center gap-2 p-2 rounded ${
//                                                     match.winner?.userID === match.player2?.userID ? 'bg-green-200' : ''
//                                                 }`}>
//                                                     {match.player2 ? (
//                                                         <>
//                                                             <img src={match.player2.avatarUrl} alt={match.player2.name} className="w-8 h-8 rounded-full" />
//                                                             <span className="font-pixelify text-sm">{match.player2.name}</span>
//                                                         </>
//                                                     ) : (
//                                                         <span className="font-pixelify text-sm text-gray-400">Bye (Auto-advance)</span>
//                                                     )}
//                                                 </div>
//                                             </div>
                                            
//                                             {/* Match Status */}
//                                             {match.winner && (
//                                                 <div className="mt-2 text-center font-pixelify text-xs text-green-600">
//                                                     Winner: {match.winner.name}
//                                                 </div>
//                                             )}
//                                             {match === currentMatch && (
//                                                 <div className="mt-2 text-center font-pixelify text-xs text-yellow-600">
//                                                     Ready to Play!
//                                                 </div>
//                                             )}
//                                             {match.player1 && !match.player2 && (
//                                                 <div className="mt-2 text-center font-pixelify text-xs text-blue-600">
//                                                     Automatic Advancement
//                                                 </div>
//                                             )}
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </section>
//             <footer className="h-40 bg-blue-deep"></footer>
//         </div>
//     );
// }