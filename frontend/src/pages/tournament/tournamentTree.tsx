import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTournament } from './tournamentContext';
import Button from '../../components/ButtonDarkPink';
import home_icon from '../../assets/icons/Home.png';
import type { SelectedPlayer } from '../user/PlayerContext';


export default function TournamentTree() {
    const navigate = useNavigate();
    const { tournamentData, setTournamentData } = useTournament();
    const [participants, setParticipants] = useState<SelectedPlayer[]>([]);
    const [displayNames, setDisplayNames] = useState<{[key: string]: string}>({});
    const [editing, setEditing] = useState<string | null>(null);
    const [nameErrors, setNameErrors] = useState<{[key: string]: string}>({});

    useEffect(() => {
        if (!tournamentData) {
            navigate('/playerProfile');
            return;
        }

        setParticipants(tournamentData.participants);

        const initialNames = Object.fromEntries(
            tournamentData.participants.map((p:SelectedPlayer) => [p.userID.toString(), p.name])
        );
        setDisplayNames(initialNames);
    }, [tournamentData, navigate]);

    if (!tournamentData) {
        return <div>Loading...</div>;
    }

    const handleBackToProfile = () => {
        navigate('/playerProfile');
    };

    const handleNameChange = (participantId: string, newName: string) => {
        const trimmedName = newName.slice(0, 7);
        
        setDisplayNames({
            ...displayNames,
            [participantId]: trimmedName
        });

        const error = !trimmedName.trim() ? "Name cannot be empty" : "";
        setNameErrors({
            ...nameErrors,
            [participantId]: error
        });
    };

    const handleNameBlur = (participantId: string) => {
        const currentName = displayNames[participantId];
        const error = !currentName.trim() ? "Name cannot be empty" : "";
        
        if (error) {
            // Reset to original name if invalid
            const originalParticipant = participants.find((p:SelectedPlayer) => p.userID.toString() === participantId);
            if (originalParticipant) {
                setDisplayNames({
                    ...displayNames,
                    [participantId]: originalParticipant.name.slice(0, 7) // Ensure original name is also limited
                });
            }
            setNameErrors({
                ...nameErrors,
                [participantId]: ""
            });
        }
        setEditing(null);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <header className="h-40 bg-blue-deep flex">
                <div className="font-pixelify text-white text-opacity-25 text-7xl m-auto">Tournament Registration</div>
            </header>

            <section className="flex-1 bg-pink-grid flex items-center justify-center">
                <div className="relative bg-pink-dark w-[825px] h-[600px] m-[10px] flex justify-between items-center px-[50px]">
                    <div className="bg-pink-dark rounded-lg p-8 flex flex-col items-center w-[700px] mx-auto">
                        <div className="w-full mb-8">
                            <h2 className="font-pixelify text-blue-deep text-xl mb-2 text-center">Participants</h2>
                            <div
                                className="grid gap-4 justify-center"
                                style={{
                                    gridTemplateColumns:
                                        participants.length <= 4
                                            ? `repeat(${participants.length}, minmax(120px, 1fr))`
                                            : `repeat(4, minmax(120px, 1fr))`
                                }}
                            >
                                {participants.map((participant: SelectedPlayer, idx: number) => (
                                    <div
                                        key={participant.userID}
                                        className="bg-pink-light px-4 py-2 font-pixelify text-blue-deep text-lg flex flex-col items-center rounded-lg"
                                    >
                                        <img
                                            src={participant.avatarUrl}
                                            alt={participant.name}
                                            className="w-10 h-10 rounded-full mb-2"
                                            style={{ objectFit: 'cover', background: '#fff' }}
                                        />
                                        <div className="flex flex-col items-center gap-1">
                                            {editing === participant.userID.toString() ? (
                                                <div className="flex flex-col items-center">
                                                    <input
                                                        type="text"
                                                        value={displayNames[participant.userID.toString()] || ""}
                                                        onChange={e => handleNameChange(participant.userID.toString(), e.target.value)}
                                                        onBlur={() => handleNameBlur(participant.userID.toString())}
                                                        onKeyDown={e => {
                                                            if (e.key === "Enter") {
                                                                handleNameBlur(participant.userID.toString());
                                                            }
                                                        }}
                                                        className="px-2 py-1 border-2 border-blue-deep rounded font-pixelify text-center text-blue-deep bg-white"
                                                        style={{ fontSize: '1.1rem', width: 110 }}
                                                        maxLength={7}
                                                        autoFocus
                                                        placeholder="Max 7 chars"
                                                    />
                                                    {nameErrors[participant.userID.toString()] && (
                                                        <span className="text-red-500 text-xs mt-1 text-center">
                                                            {nameErrors[participant.userID.toString()]}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span
                                                    onClick={() => setEditing(participant.userID.toString())}
                                                    className="cursor-pointer hover:underline flex items-center gap-1"
                                                    title="Click to edit display name (max 7 characters)"
                                                    style={{ minWidth: 80 }}
                                                >
                                                    {displayNames[participant.userID.toString()] || 
                                                        <span className="text-gray-400">No Name</span>
                                                    }
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="inline w-4 h-4 text-blue-deep ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m-2 2h6" />
                                                    </svg>
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-blue-deep mt-1 opacity-60">
                                            {editing === participant.userID.toString() ? "Max 7 characters" : "Click name to edit"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button
                            className="button-pp-blue font-pixelify px-6 py-2 rounded mt-2 text-lg flex justify-center items-center text-center"
                            style={{ minWidth: 100 }}
                            onClick={() => {
                                // Validate all names before starting tournament
                                const hasErrors = Object.values(displayNames).some(name => !name.trim());
                                if (hasErrors) {
                                    alert("Please fix all name errors before starting the tournament");
                                    return;
                                }
                                // Shuffle participants and update with display names
                                const shuffled = [...participants].sort(() => Math.random() - 0.5);

                                const updatedParticipants = shuffled.map((p: SelectedPlayer) => ({
                                    ...p,
                                    name: (displayNames[p.userID.toString()] || p.name).slice(0, 7)
                                }));

                                setTournamentData({
                                    ...tournamentData,
                                    participants: updatedParticipants
                                });

                                navigate('/tournament/bracket');
                            }}
                        >
                            Start
                        </button>
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