import React from 'react';

interface PongButtonsProps {
    onSinglePlayer: () => void;
    onTwoPlayers: () => void;
    onTournament: () => void;
}

export const PongButtons: React.FC<PongButtonsProps> = ({
    onSinglePlayer,
    onTwoPlayers,
    onTournament
}) => {
    return (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col gap-4">
            <button
                className="button-pp-purple shadow-no-blur-60"
                onClick={onSinglePlayer}
            >
                Single
            </button>
            <button
                className="button-pp-purple shadow-no-blur-60"
                onClick={onTwoPlayers}
            >
                2 Players
            </button>
            <button
                className="button-pp-purple shadow-no-blur-60"
                onClick={onTournament}
            >
                Tournaments
            </button>
        </div>
    );
};