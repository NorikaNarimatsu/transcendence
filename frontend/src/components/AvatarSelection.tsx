import React from 'react'
import upload_icon from '../assets/icons/Upload.png';
import x_icon from '../assets/icons/X.png';

interface AvatarSelectionProps {
    open: boolean;
    onClose: () => void;
    onSelect: (avatarUrl: string) => void;
}

export default function AvatarSelection({ open, onClose, onSelect }: AvatarSelectionProps ) {
    if (!open)
        return null

    const avatarOptions = [
        '/avatars/Avatar_1.png',
        '/avatars/Avatar_2.png',
        '/avatars/Avatar_3.png',
        '/avatars/Avatar_4.png',
        '/avatars/Avatar_5.png',
        '/avatars/Avatar_6.png',
        '/avatars/Avatar_7.png',
        '/avatars/Avatar_8.png',
        '/avatars/Avatar_9.png',
    ];
    
    return (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-pink-light p-4 z-[1000] border-4 border-solid border-blue-deep">
            <h2 className="flex justify-between items-center gap-2 font-pixelify text-center text-blue-deep text-xl p-1">Choose your avatar
                <button type="button" onClick={onClose} className="font-pixelify text-center text-blue-deep border-solid border-2 border-blue-deep p-2 bg-pink-dark font-bold shadow-no-blur">
                    <img src={x_icon} alt="Close Icon" className="h-4 w-auto"/>
                </button>
            </h2>
            <div className="grid grid-cols-3">
                {avatarOptions.map((avatar, index) => (
                    <button key={index} onClick={() => onSelect(avatar)} className="w-20 h-20 rounded-full overflow-hidden"> {/* TODO: API CALL BACKEND UPDATE USER AVATAR */}
                        <img src={avatar} alt={`Avatar ${index + 1}`} className="shadow-no-blur w-full h-full object-cover p-1"/>
                    </button>
                ))}
            </div>
            <button type="button"  className="font-pixelify text-center text-blue-deep border-solid border-2 border-blue-deep p-2 mt-4 bg-pink-dark font-bold shadow-no-blur flex items-center justify-center gap-2 w-full"> {/* TODO: API CALL BACKEND UPDATE USER AVATAR + UPLOAD FILE */}
                Upload Your Avatar
                <img src={upload_icon} alt="Upload Icon" className="h-8 w-auto"/>
            </button>
        </div>
    )
}