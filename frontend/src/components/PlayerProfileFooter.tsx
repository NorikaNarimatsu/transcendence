import React from 'react';
import Button from './decoration/ButtonDarkPink';
import log_out_icon from '../assets/icons/Log_out.png';

interface ProfileFooterProps {
    onLogout: () => void;
}

export const ProfileFooter: React.FC<ProfileFooterProps> = ({ onLogout }) => {
    return (
        <footer className="h-40 bg-blue-deep flex justify-center items-center">
            <Button onClick={onLogout} style={{ marginTop: 0 }}>
                <img
                    src={log_out_icon}
                    alt="Log out button"
                    className="h-8 w-auto"
                />
            </Button>
        </footer>
    );
};