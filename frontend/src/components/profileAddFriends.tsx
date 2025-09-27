interface User {
    id: number;
    name: string;
    avatarUrl?: string;
}

interface AddFriendsProps {
    open: boolean;
    allUsers: User[];
    onSendRequest: (user: User) => void;
    onClose: () => void;
}

export function AddFriends({ open, allUsers, onSendRequest, onClose }: AddFriendsProps) {
    if (!open) return null;

    return (
        <div className="absolute inset-0 bg-white bg-opacity-10 flex items-center justify-center z-30">
            <div className="bg-pink-light p-6 rounded-lg max-h-[400px] overflow-y-auto w-[300px]">
                <h3 className="font-pixelify text-blue-deep text-2xl mb-4 text-center">Add Friend</h3>
                <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto">
                    {allUsers.map((user) => (
                        <button
                            key={user.id}
                            className="px-4 py-2 bg-blue-light text-blue-deep font-pixelify rounded hover:bg-blue-medium transition-colors flex items-center gap-2"
                            onClick={() => onSendRequest(user)}
                        >
                            {user.avatarUrl && (
                                <img 
                                    src={`http://localhost:3000${user.avatarUrl}`} 
                                    alt={user.name} 
                                    className="w-6 h-6 rounded-full object-cover"
                                />
                            )}
                            {user.name}
                        </button>
                    ))}
                </div>
                <button
                    onClick={onClose}
                    className="w-full px-4 py-2 bg-gray-500 text-blue-deep font-pixelify rounded hover:bg-gray-600 transition-colors mt-4"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}