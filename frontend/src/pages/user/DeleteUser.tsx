import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';

interface DeleteAccountProps {
    open: boolean;
    onClose: () => void;
}

export function DeleteAccount({ open, onClose}: DeleteAccountProps) {
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    
    const navigate = useNavigate();
    const { user, logout } = useUser();

    const handleDeleteAccount = async () => {
    if (!user?.email) {
        setDeleteError('User not found');
        return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
        const passwordResponse = await fetch('https://localhost:8443/validatePasswordbyEmail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, password: deletePassword }),
        });

        if (!passwordResponse.ok) {
            setDeleteError('Incorrect password. Please try again.');
            setIsDeleting(false);
            return;
        }

        const anonymizeResponse = await fetch('https://localhost:8443/api/user/anonymize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email }),
        });

        if (anonymizeResponse.ok) {
            alert('Account has been delete successfully. You will be logged out.');
            logout();
            navigate('/signup');
        } else {
            const errorData = await anonymizeResponse.json();
            setDeleteError(errorData.error || 'Failed to delete account');
        }
    } catch (error) {
        setDeleteError('Error deleting account. Please try again.');
    } finally {
        setIsDeleting(false);
    }
};

const handleClose = () => {
    setDeletePassword('');
    setDeleteError('');
    onClose();
};

if (!open) return null;

return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-pink-light p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-pixelify text-blue-deep mb-4">Delete Account</h3>
            <p className="text-blue-deep mb-4 font-dotgothic">
                Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="mb-4">
                <label className="block text-blue-deep font-dotgothic mb-2">
                    Enter your password to confirm:
                </label>
                <input
                    type="password"
                    placeholder="Password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full p-2 border border-purple rounded focus:outline-none focus:border-blue-deep"
                    disabled={isDeleting}
                />
            </div>
            {deleteError && (
                <p className="text-red-500 text-sm mb-4 font-dotgothic">{deleteError}</p>
            )}
            <div className="flex gap-3">
                <button
                    onClick={handleDeleteAccount}
                    className="flex-1 bg-red-500 text-white py-2 px-4 rounded font-dotgothic hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!deletePassword || isDeleting}
                >
                    {isDeleting ? 'Deleting...' : 'Delete Account'}
                </button>
                <button
                    onClick={handleClose}
                    className="flex-1 bg-gray-500 text-white py-2 px-4 rounded font-dotgothic hover:bg-gray-600 disabled:opacity-50"
                    disabled={isDeleting}
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>
);
}