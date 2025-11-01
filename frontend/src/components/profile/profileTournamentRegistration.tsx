import { useNavigate } from 'react-router-dom';
import type { User } from '../../pages/user/UserContext'; // maybe delete?
import type { SelectedPlayer } from '../../pages/user/PlayerContext';
import { useTournament } from '../../pages/tournament/tournamentContext';
import apiCentral from '../utils/apiCentral';

import { useLanguage } from '../contexts/LanguageContext';

interface TournamentRegistrationProps {
    open: boolean;
    onClose: () => void;
    allUsers: SelectedPlayer[];
    tournamentPlayers: number;
    setTournamentPlayers: (n: number) => void;
    selectedParticipants: SelectedPlayer[];
    setSelectedParticipants: (users: SelectedPlayer[]) => void;
    setVerifyingUser: (user: SelectedPlayer | null) => void;
    user: User;
    gameType: 'Pong' | 'Snake';
}

export function TournamentRegistration({
    open,
    onClose,
    allUsers,
    tournamentPlayers,
    setTournamentPlayers,
    selectedParticipants,
    setSelectedParticipants,
    setVerifyingUser,
    user,
    gameType,
}: TournamentRegistrationProps) {
    const navigate = useNavigate();
    const { setTournamentData } = useTournament();

    const createTournamentBracket = async (participantIDs: number[]) => {
        try {
            const response = await apiCentral.post('/tournament/bracket', {
				participants: participantIDs,
				creatorID: user.userID
            });

            if (response.data) {
                console.log('Tournament bracket created:', response.data);
                return response.data.tournamentBracketID;
            } else {
                console.error('Failed to create tournament bracket:', response.error);
                return null;
            }
        } catch (error) {
            console.error('Error creating tournament bracket:', error);
            return null;
        }
    };

    if (!open) return null;

    const { lang, t } = useLanguage();
    const translation = t[lang];

    return (
            <div className="bg-pink-light p-6 rounded-lg w-[370px] max-h-[95vh] flex flex-col items-center overflow-y-auto shadow-xl border-2 border-blue-deep" style={{ boxSizing: 'border-box' }}>
                <h3 className="font-pixelify text-blue-deep text-2xl mb-4 text-center w-full" style={{ marginTop: 0, paddingTop: 0, lineHeight: '2.2rem' }}>
                    {translation.pages.profile.registration}
                </h3>
                <label className="font-pixelify text-blue-deep mb-2 w-full text-left">
                    {translation.pages.profile.numberOfPlayers}
                </label>
                <input
                    type="number"
                    min={3}
                    max={8}
                    value={tournamentPlayers}
                    onChange={e => {
                        setTournamentPlayers(Number(e.target.value));
                        setSelectedParticipants([]);
                    }}
                    className="w-full px-3 py-2 mb-3 border rounded font-pixelify text-center bg-pink-light"
                    style={{ fontSize: '1.3rem' }}
                />
                <div className="mb-4 w-full">
                    <span className="font-pixelify text-blue-deep mb-2 block">{translation.pages.profile.selectParticipants}</span>
                    <div className="flex flex-wrap gap-2 mt-2 overflow-y-auto" style={{ maxHeight: '110px' }}>
                        {allUsers.map(player => (
                            <button
                                key={player.userID}
                                disabled={selectedParticipants.some(p => p.userID === player.userID) || selectedParticipants.length >= tournamentPlayers - 1}
                                onClick={() => {
                                    if (player.name === 'Guest') {
                                        setSelectedParticipants([...selectedParticipants, player]);
                                    } else {
                                        setVerifyingUser(player);
                                    }
                                }}
                                className={`px-3 py-2 rounded border ${selectedParticipants.some(p => p.userID === player.userID) ? 'bg-gray-300' : 'bg-blue-light text-blue-deep hover:bg-blue-medium'} font-pixelify w-[120px]`}
                                style={{ fontSize: '1.1rem' }}
                            >
                                {player.avatarUrl && (
                                    <img src={player.avatarUrl} alt={player.name} className="inline-block w-6 h-6 rounded-full mr-2" />
                                )}
                                {player.name}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mb-4 w-full">
                    <span className="font-pixelify text-blue-deep mb-2 block">{translation.pages.profile.selected}</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {selectedParticipants.map(selectedPlayer => (
                            <span key={selectedPlayer.userID} className="flex items-center gap-1 bg-pink-light px-2 py-1 rounded font-pixelify text-blue-deep" style={{ fontSize: '1.1rem' }}>
                                {selectedPlayer.avatarUrl && (
                                    <img src={selectedPlayer.avatarUrl} alt={selectedPlayer.name} className="w-5 h-5 rounded-full" />
                                )}
                                {selectedPlayer.name}
                                <button
                                    onClick={() => setSelectedParticipants(selectedParticipants.filter(p => p.userID !== selectedPlayer.userID))}
                                    className="ml-1 text-xs text-red-600"
                                >
                                    ✕
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
                <div className="flex w-full gap-2 mb-2">
                    <button
                        onClick={ async () => {
                            const allParticipants = [user, ...selectedParticipants];
                            const participantIDs = allParticipants.map(p => p.userID);

                            const bracketID = await createTournamentBracket(participantIDs);

                            if (bracketID){
                                setTournamentData({
                                    players: tournamentPlayers,
                                    participants: allParticipants,
                                    tournamentBracketID: bracketID,
                                    gameType: gameType
                                });
                            
                            navigate('/tournament/tree');
                            onClose();
                        } else {
                            alert ('Failed to create tournament bracket');
                        }
                    }}
                        disabled={selectedParticipants.length !== tournamentPlayers - 1}
                        className="button-pp-blue shadow-no-blur flex-1 flex items-center justify-center font-pixelify"
                        style={{
                            fontSize: '1.2rem',
                            minHeight: '40px',
                            opacity: selectedParticipants.length === tournamentPlayers - 1 ? 1 : 0.5
                        }}
                    >
                        {translation.common.start}
                    </button>
                    <button
                        onClick={onClose}
                        className="button-pp-blue shadow-no-blur flex-1 flex items-center justify-center font-pixelify"
                        style={{
                            fontSize: '1.2rem',
                            minHeight: '40px'
                        }}
                    >
                        {translation.common.cancel}
                    </button>
                </div>
            </div>
    );
}