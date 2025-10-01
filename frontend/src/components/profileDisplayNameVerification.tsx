
interface DisplayNameVerificationModalProps {
    open: boolean;
    user: { name: string; avatarUrl?: string } | null;
    displayName: string;
    error: string;
    onDisplayNameChange: (value: string) => void;
    onVerify: () => void;
    onCancel: () => void;
}

export function DisplayNameVerification({
    open,
    user,
    displayName,
    error,
    onDisplayNameChange,
    onVerify,
    onCancel,
}: DisplayNameVerificationModalProps) {
    if (!open || !user) return null;

    return (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-40">
            <div className="bg-pink-light p-6 rounded-lg w-[300px]">
                <h3 className="font-pixelify text-blue-deep text-2xl mb-4 text-center">
                    Enter Display Name for {user.name}
                </h3>
                <input
                    type="text"
                    value={displayName}
                    onChange={e => onDisplayNameChange(e.target.value)}
                    placeholder="Enter unique display name"
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
                        disabled={!displayName.trim()}
                        className="flex-1 px-4 py-2 bg-blue-light text-white font-pixelify rounded hover:bg-blue-medium transition-colors disabled:bg-gray-400"
                    >
                        Confirm
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