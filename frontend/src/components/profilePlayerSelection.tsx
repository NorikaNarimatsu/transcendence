import React from 'react';

interface User {
    id: number;
    name: string;
    avatarUrl?: string;
}

interface PlayerSelectionProps {
    open: boolean;
    users: User[];
    onSelect: (user: User | null) => void;
    onCancel: () => void;
}

export function PlayerSelection({ open, users, onSelect, onCancel }: PlayerSelectionProps) {
    if (!open) return null;
    return (
        <div className="absolute inset-0 flex items-center justify-center z-30">
            <div className="bg-pink-light p-6 rounded-lg max-h-[400px] overflow-y-auto w-[300px]">
                <h3 className="font-pixelify text-blue-deep text-2xl mb-4 text-center">Select Player 2</h3>
                <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto">
                    {users.map((user) => (
                        <button
                            key={user.id}
                            onClick={() => onSelect(user)}
                            className="px-4 py-2 bg-blue-light text-blue-deep font-pixelify rounded hover:bg-blue-medium transition-colors flex items-center gap-2"
                        >
                            {user.avatarUrl && (
                                <img 
                                    src={user.avatarUrl}
                                    alt={user.name} 
                                    className="w-6 h-6 rounded-full object-cover"
                                />
                            )}
                            {user.name}
                        </button>
                    ))}
                    <button
                        onClick={() => onSelect(null)}
                        className="px-4 py-2 bg-pink-medium text-blue-deep font-pixelify rounded hover:bg-pink-dark transition-colors mt-2"
                    > 🎮 Play as Guest
                    </button>
                </div>
                <button
                    onClick={onCancel}
                    className="w-full px-4 py-2 bg-gray-500 text-white font-pixelify rounded hover:bg-gray-600 transition-colors mt-4"
                > Cancel
                </button>
            </div>
        </div>
    );
}