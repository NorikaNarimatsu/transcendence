import { useState, useEffect } from 'react';
import apiCentral from '../utils/apiCentral';
import { set } from 'zod';

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

	const resetFormState = () => {
		setError('');
		setSuccess('');
		setPassword('');
	}

	const closeModal = () => {
		resetFormState();
		setShowDisablePassword(false);
		onClose();
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
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
			<div className="bg-pink-dark border-4 border-black shadow-no-blur-70 max-w-md w-full max-h-[90vh] m-4 p-8 flex flex-col">
				
				{/* HEADER */}
				<div className="bg-blue-deep p-4 border-b-4 border-black relative">
					<h2 className="text-2xl text-white font-pixelify font-bold text-shadow">2FA Settings</h2>
					<button onClick={closeModal} className="text-blue-deep hover:text-blue-600 text-2xl font-bold">x</button>
				</div>

				{/* CONTENT */}
				<div className="space-y-6 mt-4">
					{/* Toggle 2FA */}
					<div className="flex items-center justify-between p-4 bg-blue-deep border-2 border-black">
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
								${status?.has2FA ? 'bg-green-600' : 'bg-gray-600'}
								disabled:opacity-50
								border-2 border-black shadow-no-blur-30
							`}
						>
							<span className={`
							inline-block w-7 h-7 transform transition-transform bg-white border-2 border-black
							${status?.has2FA ? 'translate-x-9' : 'translate-x-0.5'}
							`} />
						</button>
					</div>
					{status && status.has2FA && showDisablePassword && (
						<div className="space-y-4 p-4 bg-blue-deep border-2 border-black">
							<div className="mb-4">
								<label className="block font-dotgothic text-white text-sm mb-2">
									Enter your password to disable 2FA:
								</label>
								<input 
									type="password"
									value={password}
									onChange={(e) => {
										setPassword(e.target.value);
										if (error) {
											setError('');
										}
									}}
									placeholder="********"
									className="w-full px-3 py-2 border-2 border-black bg-white font-dotgothic"
								/>
								{error && (
									<p className="mt-2 text-red-300 text-sm font-dotgothic">
										{error}
									</p>
								)}
							</div>
							<div className="flex gap-2">
								<button
									onClick={() => {
										setShowDisablePassword(false);
										resetFormState();
									}}
										disabled={actionLoading}
										className="flex-1 px-4 py-2 bg-gray-600 text-white font-pixelify border-2 border-black"
								>
									Cancel
								</button>
								<button
									onClick={handleDisable2FA}
									disabled={actionLoading || !password}
									className="flex-1 px-4 py-2 bg-red-600 text-white font-pixelify border-2 border-black disabled:opacity-50"
								>
									{actionLoading ? 'Disabling 2FA...' : 'Disable 2FA'}
								</button>
							
							</div>
						</div>
					)}
				</div>
				<div className="p-4 order-t-4 border-black bg-blue-deep">
					<button
						onClick={closeModal}
						className="w-full px-6 py-3 bg-purple-game text-white font-pixelify font-bold text-lg border-2 border-black shadow-no-blur-50 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
						>
							CLOSE
						</button>
				</div>
			</div>
		</div>
	);
}
