import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import apiCentral from '../../utils/apiCentral';
import { validatePasswordRealTimeMini } from '../../utils/passwordValidation';
import SafeError from '../../components/SafeError';

interface DeleteAccountProps {
    open: boolean;
    onClose: () => void;
}

export function DeleteAccount({ open, onClose}: DeleteAccountProps) {
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
	const [passwordError, setPasswordError] = useState('');
    
    const navigate = useNavigate();
    const { user, logout } = useUser();

	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let password = e.target.value;
		setDeletePassword(password);

		const errorMessage = validatePasswordRealTimeMini(password);
		setPasswordError(errorMessage);

		if (deleteError) {
			setDeleteError('');
		}
	}

    const handleDeleteAccount = async () => {
        if (!user?.userID) {
            setDeleteError('User not found');
            return;
        }

        setIsDeleting(true);
        setDeleteError('');

        try {
            const passwordResponse = await apiCentral.post('/validatePasswordbyUserID', {
                userID: user.userID,
                password: deletePassword
            });

            if (passwordResponse.status !== 200 ||!passwordResponse.data) {
                setDeleteError('Incorrect password. Please try again.');
                setIsDeleting(false);
                return;
            }

            const anonymizeResponse = await apiCentral.post('/api/user/anonymize', {
                 userID: user.userID
            });

            if (anonymizeResponse.data) {
                alert('Account has been deleted successfully. You will be logged out.');
                logout();
                navigate('/signup');
            } else {
                setDeleteError(anonymizeResponse.error || 'Failed to delete account');
            }
        } catch (error) {
            console.error('Delete account error:', error); // ADDED: Debug log
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
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={deletePassword}
                            onChange={handlePasswordChange}
                            className="w-full p-2 pr-10 border border-purple rounded focus:outline-none focus:border-blue-deep"
                            disabled={isDeleting}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-deep hover:text-purple focus:outline-none"
                            disabled={isDeleting}
                        >
                            {showPassword ? '🙈' : '👁️'}
                        </button>
                    </div>
                </div>
				{passwordError && (
					<p className="mb-3 text-red-500 font-dotgothic text-sm">
						{passwordError}
					</p>
				)}
                {deleteError && !passwordError && (
                    <SafeError
                        error={deleteError}
                        className="text-red-500 font-dotgothic text-sm mb-3"
                    />
                )}
                <div className="flex gap-3">
                    <button
                        onClick={handleDeleteAccount}
                        className="flex-1 bg-red-500 text-white py-2 px-4 rounded font-dotgothic hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!deletePassword || isDeleting || !!passwordError}
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