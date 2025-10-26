import React, { useState, useEffect } from 'react';
import { set } from 'zod';

interface TwoFactorSettingsProps {
	user: { userID: number; name: string; }
	onClose: () => void;
}

export default function TwoFactorSettings({ user, onClose }: TwoFactorSettingsProps) {
	const [status, setStatus] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [showDisablePassword, setShowDisablePassword] = useState(false);
	const [verificationCode, setVerificationCode] = useState('');
	const [password, setPassword] = useState('');

	useEffect(() => {
		// console.log('TwoFactorSettings - user prop: ', user);
		// console.log('TwoFactorSettings - user.userID: ', user.userID);
		fetch2FAStatus();
	}, []);

	const fetch2FAStatus = async () => {
		try {
			setLoading(true);
			const response = await fetch(`https://localhost:8443/2fa/status?userID=${user.userID}`);

			if (response.ok) {
				const data = await response.json();
				setStatus(data);
			} else {
				const errorData = await response.json();
				setError(errorData.message || 'Failed to fetch 2FA status');
			}
		} catch (err) {
			setError('Server error while fetching 2FA status');
		} finally {
			setLoading(false);
		}
	};

	const handleEnable2FA = async () => {
		try {
			setActionLoading(true);
			setError('');
			setSuccess('');

			// console.log('handleEnable2FA - user: ', user);
			// console.log('handleEnable2FA - user.userID: ', user.userID);

			const response = await fetch('https://localhost:8443/2fa/enable', {
				method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userID: user.userID }),
			});

			// console.log('handleEnable2FA - response status: ', response.status);
			const data = await response.json();

			if (response.ok) {
				setSuccess('2FA successfully enabled');
				setShowDisablePassword(false);
				await fetch2FAStatus();
			} else {
				setError(data.message || 'Failed to enable 2FA');
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
			setError('');
			setSuccess('');
			
			const response = await fetch('https://localhost:8443/2fa/disable', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userID: user.userID, password: password }),
			});

			const data = await response.json();

			if (response.ok) {
				setSuccess('2FA successfully disabled');
				setPassword('');
				setShowDisablePassword(false);
				await fetch2FAStatus();
			} else {
				setError(data.message || 'Failed to disable 2FA');
			}
		} catch (err) {
			setError('Server error while disabling 2FA');
		} finally {
			setActionLoading(false);
		}
	};

	// const handleSentVerificationCode = async () => {
	// 	try {
	// 		setActionLoading(true);
	// 		setError('');
	// 		setSuccess('');

	// 		const response = await fetch('https://localhost:8443/2fa/send-code', {
	// 			method: 'POST',
	// 			headers: { 'Content-Type': 'application/json' },
	// 			body: JSON.stringify({userID: user.userID  }),
	// 		});

	// 		const data = await response.json();

	// 		if (response.ok) {
	// 			setSuccess('Verification code sent successfully');
	// 			setShowCodeInput(true);
	// 		} else {
	// 			setError(data.message || 'Failed to send the verification code');
	// 		}

	// 	} catch (err) {
	// 		setError('Server error while sending the verification code');
	// 	} finally {
	// 		setActionLoading(false);
	// 	}
	// };

	// const handleVerifyCode = async () => {
	// 	try {
	// 		setActionLoading(true);
	// 		setError('');
	// 		setSuccess('');

	// 		const response = await fetch('https://localhost:8443/2fa/verify-code', {
	// 			method: 'POST',
	// 			headers: { 'Content-Type': 'application/json' },
	// 			body: JSON.stringify({ userID: user.userID, code: verificationCode }),
	// 		});

	// 		const data = await response.json();

	// 		if (response.ok) {
	// 			setSuccess('2FA verification successful');
	// 			setVerificationCode('');
	// 			setShowCodeInput(false);
	// 		} else {
	// 			setError(data.message || 'Failed to verify the code');
	// 		}
	// 	} catch (err) {
	// 		setError('Server error while verifying the code');
	// 	} finally {
	// 		setActionLoading(false);
	// 	}
	// };

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
					<button onClick={onClose} className="text-blue-deep hover:text-blue-600 text-2xl font-bold">x</button>
				</div>

				{/* ERROR
				{error && (
					<div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg mb-4">
						<p className="font-dotgothic text-sm">{error}</p>
					</div>
				)}

				{/* SUCCESS */}
				{/* {success && (
					<div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg mb-4">
						<p className="font-dotgothic text-sm">{success}</p>
					</div>
				)} */}

				{/* CONTENT */}
				<div className="space-y-6">
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
								} else {
									handleEnable2FA();
								}
							}}
							disabled={actionLoading}
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
									onChange={(e) => setPassword(e.target.value)}
									placeholder="********"
									className="w-full px-3 py-2 border-2 border-black bg-white font-dotgothic"
								/>
							</div>
							<div className="flex gap-2">
								<button
									onClick={() => {
										setShowDisablePassword(false);
										setPassword('');
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
						onClick={onClose}
						className="w-full px-6 py-3 bg-purple-game text-white font-pixelify font-bold text-lg border-2 border-black shadow-no-blur-50 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
						>
							CLOSE
						</button>
				</div>
			</div>
		</div>
	);
}
