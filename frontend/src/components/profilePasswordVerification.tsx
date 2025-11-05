import React from 'react';
import { validatePasswordRealTimeMini } from '../utils/passwordValidation';
import SafeError from './SafeError';

interface PasswordVerificationModalProps {
    open: boolean;
    user: { name: string; avatarUrl?: string } | null;
    password: string;
    error: string;
    onPasswordChange: (value: string) => void;
    onVerify: () => void;
    onCancel: () => void;
}

export function PasswordVerification({
    open,
    user,
    password,
    error,
    onPasswordChange,
    onVerify,
    onCancel,
}: PasswordVerificationModalProps) {
    if (!open || !user) return null;

	const [passwordError, setPasswordError] = React.useState('');

	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let password = e.target.value;

		onPasswordChange(password);

		const errorMessage = validatePasswordRealTimeMini(password);
		setPasswordError(errorMessage);
	};

    return (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-30">
            <div className="bg-pink-light p-6 rounded-lg w-[300px]">
                <h3 className="font-pixelify text-blue-deep text-2xl mb-4 text-center">
                    Verify Password for {user.name}
                </h3>
                <input
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Enter password"
                    className={`w-full px-3 py-2 mb-3 border rounded font-pixelify ${passwordError ? "border-red-500" : "border-black"}`}
                    onKeyDown={e => e.key === 'Enter' && !passwordError && onVerify()}
                />
				{passwordError && (
					<p className="mb-3 text-red-500 font-pixelify text-sm text-center">
						{passwordError}
					</p>
				)}
                {error && !passwordError && (
					<SafeError
                    error={error}
                    className="text-red-500 font-pixelify text-sm mb-3 text-center"
                    />
                )}
                <div className="flex gap-2">
                    <button
                        onClick={onVerify}
                        disabled={!password.trim() || !!passwordError}
                        className="flex-1 px-4 py-2 bg-blue-light text-white font-pixelify rounded hover:bg-blue-medium transition-colors disabled:bg-gray-400"
                    >
                        Verify
                    </button>
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 bg-gray-500 text-white font-pixelify rounded hover:bg-gray-600 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}