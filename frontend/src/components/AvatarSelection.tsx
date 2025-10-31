import { useRef } from 'react';
import upload_icon from '../assets/icons/Upload.png';
import x_icon from '../assets/icons/X.png';
import { useLanguage } from '../contexts/LanguageContext';

interface AvatarSelectionProps {
    open: boolean;
    onClose: () => void;
    onSelect: (avatarUrl: string) => void;
}

export default function AvatarSelection({ open, onClose, onSelect }: AvatarSelectionProps ) {
    const { lang, t } = useLanguage();
    const translation = t[lang];

    console.log('AvatarSelection rendered with open:', open);
    
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

    /* Upload Avatar Image: */
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleUploadAvatar = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file){
            console.error('No file selected');
            return;
        }
        const imageUrl = URL.createObjectURL(file);
        onSelect(imageUrl);
    };
    
    return (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-pink-light p-4 z-[1000] border-4 border-solid border-blue-deep">
            <h2 className="flex justify-between items-center gap-2 font-pixelify text-center text-blue-deep text-xl p-1">{translation.pages.profile.chooseYourAvatar}
                <button type="button" onClick={onClose} className="font-pixelify text-center text-blue-deep border-solid border-2 border-blue-deep p-2 bg-pink-dark font-bold shadow-no-blur">
                    <img src={x_icon} alt="Close Icon" className="h-4 w-auto"/>
                </button>
            </h2>
            <div className="grid grid-cols-3">
                {avatarOptions.map((avatar, index) => (
                    <button key={index} onClick={() => onSelect(avatar)} className="w-20 h-20 rounded-full overflow-hidden">
                        <img src={avatar} alt={`Avatar ${index + 1}`} className="shadow-no-blur w-full h-full object-cover p-1"/>
                    </button>
                ))}
            </div>
            <button type="button"  onClick={handleUploadAvatar} className="font-pixelify text-center text-blue-deep border-solid border-2 border-blue-deep p-2 mt-4 bg-pink-dark font-bold shadow-no-blur flex items-center justify-center gap-2 w-full"> {/* TODO: API CALL BACKEND UPDATE USER AVATAR + UPLOAD FILE */}
                {translation.pages.profile.uploadYourAvatar}
                <input type="file" name='image' ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} ></input>
                <img src={upload_icon} alt="Upload Icon" className="h-8 w-auto"/>
            </button>
        </div>
    )
}

/*
Strategy:
2 endpoitns:
- handleAvatarSelect
            const form = new FormData();
            form.append('avatar', file);
            form.append('userID', String(user.userID));

            const res = await fetch('https://localhost:8443/user/upload-avatar', {
                method: 'POST',
                body: form
            });

- handleAvatarUpload
            const res = await fetch('https://localhost:8443/user/update-avatar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userID: user.userID, avatarUrl })
            });


*/
 