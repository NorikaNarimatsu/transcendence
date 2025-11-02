import { useEffect, useState } from 'react';
import { useUser } from '../pages/user/UserContext';
import apiCentral from '../utils/apiCentral';

interface UpdateUserDataProps {
    open: boolean;
    onClose: () => void;
    updateType: 'email' | 'name';
}

export const UpdateUserData = ({ open, onClose, updateType }: UpdateUserDataProps) => {
    const { user, setUser } = useUser();
    const [currentEmail, setCurrentEmail] = useState('');
    const [currentName, setCurrentName] = useState('');

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: ''
    });
    const [errors, setErrors] = useState({
        field: '',
        general: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');

    useEffect(() => {
        let ignore = false;
        const fetchUserData = async () => {
            if (open && user) {
                if (updateType === 'email') {

                    try {
                        const res = await apiCentral.get(`/getUserEmailById/${user.userID}`);
                        if (res.data) {
                            const userData = res.data;
                            if (!ignore) {
                                setCurrentEmail(userData.email || '');
                                setFormData((prev : UpdateUserDataProps) => ({
                                    ...prev,
                                    email: ''
                                }));
                                setErrors({ field: '', general: '' });
                            }
                        } else {
                            if (!ignore) {
                                setErrors({ field: '', general: 'Failed to fetch email.' });
                            }
                        }
                    } catch {
                        if (!ignore) {
                            setErrors({ field: '', general: 'Network error.' });
                        }
                    }
                } else {
                    setCurrentName(user.name || '');
                    setFormData((prev : UpdateUserDataProps) => ({
                        ...prev,
                        name: ''
                    }));
                    setErrors({ field: '', general: '' });
                }
            }
        };
        fetchUserData();
        return () => { ignore = true; };
    }, [open, updateType, user]);

    if (!open || !user) return null;

    const validateName = async (name: string) => {
        if (!name.trim()) return "Name cannot be empty";
        if (name.length < 2 || name.length > 7) return "Name must be between 2 and 7 characters";
        
        if (name === currentName) {
            return "New nickname must be different from the current nickname";
        }
        if (name !== user.name) {
            try {
                const response = await apiCentral.post('/validateName', { name });
                
                if (response.status === 409) {
                    return "This name is already taken";
                }
            } catch (error) {
                return "Error validating name";
            }
        }
        return null;
    };

    const validateEmail = async (email: string) => {
        if (!email.trim()) return "Email cannot be empty";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return "Invalid email format";

        if (email === currentEmail) {
            return "New email must be different from the current email";
        }
        if (email !== user.email) {
            try {
                const response = await apiCentral.post('/validateEmail', { email });
                
                if (response.status === 409) {
                    return "This email is already used";
                }
            } catch (error) {
                return "Error validating email";
            }
        }
        return null;
    };

    const handleNameSubmit = async () => {
        let fieldError = await validateName(formData.name);
        if (fieldError) {
            setErrors((prev : UpdateUserDataProps) => ({ ...prev, field: fieldError }));
            setLoading(false);
            return;
        }
        const response = await apiCentral.put('/user/updateName', {
            userID: user.userID,
			name: formData.name
        });
        if (response.data) {
            setUser({ ...user, name: formData.name });
            setSuccess("🎉 Nickname updated successfully!");
            setLoading(false);
            setTimeout(() => {
                setSuccess('');
                onClose();
            }, 1000);
        } else {
            setErrors((prev : UpdateUserDataProps) => ({ ...prev, general: response.error || 'Failed to update nickname' }));
            setLoading(false);
        }
    };

    const handleEmailSubmit = async () => {
        let fieldError = await validateEmail(formData.email);
        if (fieldError) {
            setErrors((prev : UpdateUserDataProps) => ({ ...prev, field: fieldError }));
            setLoading(false);
            return;
        }
        const response = await apiCentral.put('/user/updateEmail', {
            userID: user.userID,
            email: formData.email
        });
        
        if (response.data) {
            setUser({ ...user, email: formData.email });
            setSuccess("🎉 Email updated successfully!");
            setLoading(false);
            setTimeout(() => {
                setSuccess('');
                onClose();
            }, 1000);
        } else {
            setErrors((prev : UpdateUserDataProps) => ({ ...prev, general: response.error || 'Failed to update email' }));
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({ field: '', general: '' });

        if (updateType === 'name') {
            await handleNameSubmit();
        } else {
            await handleEmailSubmit();
        }
        setLoading(false);
    };

    const isUpdatingName = updateType === 'name';
    const title = isUpdatingName ? 'Update Nickname' : 'Update Email';
    const fieldLabel = isUpdatingName ? 'Nickname (2-7 chars)' : 'Email';

    return (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black bg-opacity-50">
            <div className="bg-pink-light p-8 rounded-lg shadow-lg w-[420px] max-w-lg">
                <h2 className="font-pixelify text-blue-deep text-2xl mb-6 text-center">
                    {title}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Current Data Display */}
                    <div className="bg-gray-100 p-4 rounded border mb-2">
                        <label className="block font-pixelify text-blue-deep text-xs mb-1">
                            {isUpdatingName ? "Current Nickname:" : "Current Email:"}
                        </label>
                        <div className="font-pixelify text-gray-700 text-sm">
                            {isUpdatingName
                                ? (currentName || <span className="text-gray-400">Not loaded</span>)
                                : (currentEmail || <span className="text-gray-400">Not loaded</span>)
                            }
                        </div>
                    </div>

                    {/* Update Field */}
                    <div>
                        <label className="block font-pixelify text-blue-deep text-sm mb-1">
                            New {fieldLabel}
                        </label>
                        {isUpdatingName ? (
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData((prev : UpdateUserDataProps) => ({ ...prev, name: e.target.value.slice(0, 7) }))}
                                className="w-full px-3 py-2 border-2 border-blue-deep rounded font-pixelify text-blue-deep bg-white"
                                maxLength={7}
                                required
                                placeholder="Enter new nickname"
                            />
                        ) : (
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData((prev : UpdateUserDataProps) => ({ ...prev, email: e.target.value }))}
                                className="w-full px-3 py-2 border-2 border-blue-deep rounded font-pixelify text-blue-deep bg-white"
                                required
                                placeholder="Enter new email"
                            />
                        )}
                        {errors.field && (
                            <p className="text-red-500 text-xs mt-1">{errors.field}</p>
                        )}
                    </div>

                    {/* General Error */}
                    {errors.general && (
                        <p className="text-red-500 text-xs text-center">{errors.general}</p>
                    )}

                    {/* Buttons or Success Message */}
                    <div className="flex gap-2 mt-6 min-h-[40px]">
                        {success ? (
                            <div className="w-full flex items-center justify-center">
                                <p className="text-green-600 text-base text-center font-dotgothic">{success}</p>
                            </div>
                        ) : (
                            <>
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-deep text-white py-2 px-4 rounded font-dotgothic hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loading}
                                >
                                    {loading ? 'Updating...' : 'Update'}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 bg-gray-500 text-white py-2 px-4 rounded font-dotgothic hover:bg-gray-600 disabled:opacity-50"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};