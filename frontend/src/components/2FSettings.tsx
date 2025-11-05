import { useState, useEffect } from 'react';
import apiCentral from '../utils/apiCentral';
import eye_icon from '../assets/icons/eye.png';
import { validatePasswordRealTimeMini } from '../utils/passwordValidation';
import SafeError from './SafeError';

interface TwoFactorSettingsProps {
	user: { userID: number; }
	onClose: () => void;
}

export default function TwoFactorSettings({ user, onClose }: TwoFactorSettingsProps) {
	const [status, setStatus] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [showDisablePassword, setShowDisablePassword] = useState(false);
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [passwordError, setPasswordError] = useState('');

	const resetFormState = () => {
		setError('');
		setSuccess('');
		setPassword('');
		setPasswordError('');
	}

	const closeModal = () => {
		resetFormState();
		setShowDisablePassword(false);
		onClose();
	}

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	}

	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const password = e.target.value;
		setPassword(password);

		const errorMessage = validatePasswordRealTimeMini(password);
		setPasswordError(errorMessage);

		if (error) {
			setError('');
		}
	}

	useEffect(() => {
		fetch2FAStatus(false);
	}, []);

	const fetch2FAStatus = async (isFormOpen: boolean) => {
		try {

			if (!isFormOpen) {
				setLoading(true);
			}
			const response = await apiCentral.get(`/2fa/status?userID=${user.userID}`);

			if (response.data) {
				if (isFormOpen) {
					return;
				}
				setStatus(response.data);
			} else {
				if (!isFormOpen) {
					setError(response.error || 'Failed to fetch 2FA status');
				}
			}
		} catch (err) {
			if (!isFormOpen) {
				setError('Server error while fetching 2FA status');
			}
		} finally {
			if (!isFormOpen) {
				setLoading(false);
			}
		}
	};

	const handleEnable2FA = async () => {
		try {
			setActionLoading(true);
			setError('');
			setSuccess('');

			const response = await apiCentral.post('/2fa/enable', { userID: user.userID });

			if (response.data) {
				setSuccess('2FA successfully enabled');
				setShowDisablePassword(false);
				await fetch2FAStatus(false);
			} else {
				setError(response.error || 'Failed to enable 2FA');
			}
		} catch (err) {
			setError('Server error while enabling 2FA');
		} finally {
			setActionLoading(false);
		}
	};
	
	const handleDisable2FA = async () => {
		try {
			setActionLoading(true);
			setSuccess('');

			const response = await apiCentral.post('/2fa/disable', { userID: user.userID, password: password });

			if (response.error || !response.data || response.status !== 200) {
				setError(response.error || 'Invalid password');
			} else {
				resetFormState();
				setSuccess('2FA successfully disabled');
				setShowDisablePassword(false);
				await fetch2FAStatus(false);
			}
		} catch (err) {
			setError('Server error while disabling 2FA');
		} finally {
			setActionLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
				<div className="!bg-pink-light bg-opacity-100 p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-deep mx-auto mb-4"></div>
						<p className="font-dotgothic text-blue-deep">Loading...</p>
					</div>
				</div>
			</div>
		);
	}

	return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-pink-light p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        {/* HEADER */}
        <div className="bg-purple-purple p-4 relative rounded-lg">
          <h2 className="text-2xl text-white font-pixelify font-bold text-shadow">
            2FA Settings
          </h2>
        </div>

        {/* CONTENT */}
        <div className="space-y-6 mt-4">
          {/* Toggle 2FA */}
          <div className="flex items-center justify-between p-4 bg-purple-purple rounded-lg">
            <div className="flex flex-col">
              <label className="font-pixelify text-white text-xl font-bold mb-1">
                Two-Factor Authentication
              </label>
              <p className="font-dotgothic text-blue-light text-pink-light text-xs">
                Extra security for your account
              </p>
            </div>
            <button
              onClick={() => {
                if (status?.has2FA) {
                  setShowDisablePassword(true);
                  resetFormState();
                } else {
                  handleEnable2FA();
                }
              }}
              disabled={actionLoading || showDisablePassword}
              className={`
				relative inline-flex items-center w-16 h-8 transition-colors
				${status?.has2FA ? "bg-green-600" : "bg-gray-600"}
				disabled:opacity-50
				border-2 border-black shadow-no-blur-30 rounded-lg
			`}
            >
              <span
                className={`
					inline-block w-7 h-7 transform transition-transform bg-white border-2 border-black rounded-lg
					${status?.has2FA ? "translate-x-9" : "translate-x-0.5"}
				`}
              />
            </button>
          </div>
          {status && status.has2FA && showDisablePassword && (
            <div className="space-y-4 p-4 bg-purple-purple">
              <div className="mb-4">
                <label className="block font-dotgothic text-white text-sm mb-2">
                  Enter your password to disable 2FA:
                </label>
                <div className="relative">
                  <img
                    src={eye_icon}
                    alt={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-[30px] w-auto cursor-pointer hover:opacity-75 transition-opacity z-10"
                    onClick={togglePasswordVisibility}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="********"
                    className={`w-full px-3 py-2 border-2 border-black bg-blue-deep font-dotgothic text-white ${
                      passwordError ? "border-red-500" : "border-black"
                    }`}
                  />
                </div>
                {passwordError && (
                  <p className="mt-1 text-red-300 text-sm font-dotgothic">
                    {passwordError}
                  </p>
                )}
                {error && !passwordError && (
                  <SafeError
                    error={error}
                    className="mt-2 text-red-300 text-sm font-dotgothic"
                  />
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowDisablePassword(false);
                    resetFormState();
                  }}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded font-dotgothic hover:bg-gray-600 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDisable2FA}
                  disabled={actionLoading || !password || !!passwordError}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded font-dotgothic hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? "Disabling 2FA..." : "Disable 2FA"}
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-center mt-4">
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg font-dotgothic hover:bg-gray-600"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
