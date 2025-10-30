import React from 'react';

interface GamesButtonsProps {
    onSelectGame: (game: 'Pong' | 'Snake') => void;
}

export const GamesButtons: React.FC<GamesButtonsProps> = ({ onSelectGame }) => {
    return (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col gap-4">
            <button
                className="button-pp-purple shadow-no-blur-60"
                onClick={() => onSelectGame('Pong')}
            >
                Play Pong
            </button>
            <button
                className="button-pp-purple shadow-no-blur-60"
                onClick={() => onSelectGame('Snake')}
            >
                Play Snake
            </button>
        </div>
    );
};