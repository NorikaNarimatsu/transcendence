import React from 'react';

interface SettingsButtonsProps {
    onDeleteAccount: () => void;
    onUpdateData: () => void;
    onDownloadData: () => void;
    onPrivacyPolicy: () => void;
    onEdit2FA: () => void;
    onLanguage: () => void;
}

export const SettingsButtons: React.FC<SettingsButtonsProps> = ({
    onDeleteAccount,
    onUpdateData,
    onDownloadData,
    onPrivacyPolicy,
    onEdit2FA,
    onLanguage
}) => {
    return (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col gap-4">
            <button
                className="button-pp-purple shadow-no-blur-60"
                onClick={onDeleteAccount}
            >
                Delete Account
            </button>
            <button
                className="button-pp-purple shadow-no-blur-60"
                onClick={onUpdateData}
            >
                Update data
            </button>
            <button
                className="button-pp-purple shadow-no-blur-60"
                onClick={onDownloadData}
            >
                Download data
            </button>
            <button
                className="button-pp-purple shadow-no-blur-60"
                onClick={onPrivacyPolicy}
            >
                Privacy Policy
            </button>
            <button
                className="button-pp-purple shadow-no-blur-60"
                onClick={onEdit2FA}
            >
                Edit 2FA
            </button>
            <button
                className="button-pp-purple shadow-no-blur-60"
                onClick={onLanguage}
            >
                Language
            </button>
        </div>
    );
};