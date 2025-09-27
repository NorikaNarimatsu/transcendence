import React from 'react';

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

    return (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-30">
            <div className="bg-pink-light p-6 rounded-lg w-[300px]">
                <h3 className="font-pixelify text-blue-deep text-2xl mb-4 text-center">
                    Verify Password for {user.name}
                </h3>
                <input
                    type="password"
                    value={password}
                    onChange={e => onPasswordChange(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-3 py-2 mb-3 border rounded font-pixelify"
                    onKeyDown={e => e.key === 'Enter' && onVerify()}
                />
                {error && (
                    <p className="text-red-500 font-pixelify text-sm mb-3 text-center">
                        {error}
                    </p>
                )}
                <div className="flex gap-2">
                    <button
                        onClick={onVerify}
                        disabled={!password.trim()}
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