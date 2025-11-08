import { useRef } from 'react';
import upload_icon from '../assets/icons/Upload.png';
import x_icon from '../assets/icons/X.png';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../pages/user/UserContext';

interface AvatarSelectionProps {
    open: boolean;
    onClose: () => void;
    onSelect: (avatarUrl: string) => void;
}

export default function AvatarSelection({ open, onClose, onSelect }: AvatarSelectionProps ) {
    const { lang, t } = useLanguage();
    const translation = t[lang];

    const { user } = useUser();

    console.log('AvatarSelection rendered with open:', open);

    /* Upload Avatar Image: */
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    
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

    const handleUploadAvatar = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange =  async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file){
            console.error('No file selected');
            return;
        }
        // const imageUrl = URL.createObjectURL(file);
        // onSelect(imageUrl); //TODO: Save uploaded image on the backend.
        if(!user?.userID){
            console.error('No user logged in');
            alert('Please log in to upload an avatar');
            return;
        }

        if(!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)){
            alert('Only JPEG and PNG images are allowed');
            return;
        }

        if(file.size > 2 * 1024 * 1024){
            alert('File size must be less than 2MB');
            return;
        }

        try{
            const formData = new FormData();
            formData.append('avatar', file);
            formData.append('userID', String(user.userID));

            console.log("USER ID:", user.userID);

            const authToken = localStorage.getItem('authToken');
            if(!authToken){
                throw new Error('No authentication token found');
            }

            const response = await fetch('https://localhost:8443/user/uploadAvatar', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                body: formData
            });

            if(!response.ok){
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            const data = await response.json();
            console.log('Avatar uploaded successfully:', data.avatarUrl);

            onSelect(data.avatarUrl);
            onClose();
        } catch(error){
            console.error('Error uploading avatar:', error);
            alert(error instanceof Error ? error.message : 'Failed to upload avatar. Please try again.');
        }
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
                <input type="file" name='avatar' ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} accept="image/jpeg,image/jpg,image/png" ></input>
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
 