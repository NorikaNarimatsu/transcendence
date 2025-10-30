import React from 'react';

interface DashboardButtonsProps {
    onGoToDashboard: () => void;
}

export const DashboardButtons: React.FC<DashboardButtonsProps> = ({
    onGoToDashboard
}) => {
    return (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col gap-4">
            <button
                className="button-pp-purple shadow-no-blur-60"
                onClick={onGoToDashboard}
            >
                Go to Dashboard
            </button>
        </div>
    );
};