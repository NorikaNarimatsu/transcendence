import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import signup_image from '../../assets/SignUp.jpg';
import ButtonPurple from '../../components/ButtonPurple';
import mail_icon from '../../assets/icons/mail.png';
import person_icon from '../../assets/icons/person.png';
import eye_icon from '../../assets/icons/eye.png';
import arrow_icon from '../../assets/icons/arrow.png';
import { validatePasswordRealTime } from '../../utils/passwordValidation';
import SafeError from '../../components/SafeError';
import PrivacyPolicyModal from '../../components/PrivacyPolicyModal';
import { useLanguage } from '../../contexts/LanguageContext';
import apiCentral from '../../utils/apiCentral';

export default function signupUnkownUser() {
	const location = useLocation();
	const navigate = useNavigate();

	const { lang, t } = useLanguage();
	const translation = t[lang];

	const email = location.state?.email
	const [name, setName] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [nameError, setNameError] = useState('');
	const [passwordError, setPasswordError] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [nameAvailable, setNameAvailable] = useState(false);
	const [privacyAccepted, setPrivacyAccepted] = useState(false);
	const [showPrivacyModal, setShowPrivacyModal] = useState(false);

	const handleNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setName(value);

		const validCharacters = /^[a-zA-Z0-9]*$/;

		// Real-time validation
		if (value.length > 0 && !validCharacters.test(value)) {
			setNameError('Nickname can only contain letters (a-z, A-Z) and numbers (0-9)');
			setNameAvailable(false);
			return;
		} 
		if (value.length < 2 && value.length > 0) {
			setNameError('Nickname must be at least 2 characters long');
			setNameAvailable(false);
			return;
		}
		if (value.length > 7) {
			setNameError('Nickname cannot exceed 7 characters');
			setNameAvailable(false);
			return;
		}

		setNameError('');
		setNameAvailable(false); // Reset availability while checking

		if (value.length >= 2 && value.length <= 7 && validCharacters.test(value)) {
			try {
				const response = await apiCentral.post('/validateName', { name: value });

				if (response.status === 200) { 
					setNameError('');
					setNameAvailable(true);
				}
				else if (response.status === 409) {
					setNameError('Nickname is already taken');
					setNameAvailable(false);
				}
				else if (response.status === 400) { 
					setNameError(response.error || 'Invalid nickname');
					setNameAvailable(false);
				}
			} catch (error) {
				console.error('Error checking the name availability in handleNameChange():', error);
				setNameAvailable(false);
			}
		}
	};

	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
	const value = e.target.value;
	setPassword(value);

	// Real-time validation
	const errorMessage = validatePasswordRealTime(value);
	setPasswordError(errorMessage);
	}

	const togglePasswordVisibility = () => {
	setShowPassword(!showPassword);
	};


	const handleSubmit = async (e: React.FormEvent) => {
	e.preventDefault();
	setError('');

	if (!privacyAccepted) {
		setError('You must accept the Privacy Policy to continue.');
		return;
	}

	if (nameError || passwordError) {
		setError('Please fix the errors before submitting the form.');
		return;
	}

	try {
		const response = await apiCentral.post('/addNewUser', { name, email, password });
		if (response.status === 201) {
			navigate('/login', { state: { email } });
		}
	} catch (err) {
		setError('Failed to register user');
	}
	};

	return (
	<main className="min-h-screen flex flex-col">
		<div className="flex-1 bg-pink-grid flex items-center justify-center">
		<div className="bg-pink-dark shadow-no-blur-70 flex m-8 overflow-hidden">
			<section className="p-8 flex flex-col justify-between min-w-80">
			<form onSubmit={handleSubmit}>
				<div className="mb-4">
				<h1 className="text-4xl text-blue-deep font-pixelify mb-[1px] text-shadow font-bold">
					{translation.pages.signup.signup}
				</h1>
				<h2 className="text-xl text-blue-deep font-dotgothic mb-[20px]">
					{translation.pages.signup.newUser}
				</h2>

				<button 
					type="button"
					onClick={() => navigate(-1)}
					className="text-blue-deep underline mb-4">
					{translation.pages.signup.wrongEmail}
				</button>

				{/* Form inputs */}
				<div className='relative mb-6'> {/* Increased margin bottom to accommodate error */}
					<img
					src={person_icon}
					alt="Person icon"
					className="absolute right-2 top-1/2 transform -translate-y-1/2 h-[30px] w-auto"
					/>
					<input 
					type="text"
					value={name}
					onChange={handleNameChange}
					placeholder={translation.pages.signup.enterNickname}
					className={`w-full px-4 py-2 bg-blue-deep text-white placeholder-color font-dotgothic border-2 ${
						nameError ? 'border-red-500' : 'border-black'
					} focus:outline-none shadow-no-blur-50-reverse-no-active tracking-widest`}
					maxLength={7}
					required
					/>
					<SafeError error={nameError} className="absolute left-0 top-full mt-1 text-xs" />
				</div>

				<div className="relative mb-4">
					<img
					src={mail_icon}
					alt="Mail icon"
					className="absolute right-2 top-1/2 transform -translate-y-1/2 h-[30px] w-auto"
					/>
					<input 
					type="email"
					value={email}
					readOnly
					className="w-full px-4 py-2 bg-blue-deep text-white placeholder-color font-dotgothic border-2 border-black focus:outline-none shadow-no-blur-50-reverse-no-active tracking-widest opacity-70"
					/>
				</div>


				<div className="relative mb-6"> {/* Increased margin bottom to accommodate error */}
				<img
					src={eye_icon}
					alt= {showPassword ? "Hide password" : "Show password"}
					className="absolute right-2 top-1/2 transform -translate-y-1/2 h-[30px] w-auto cursor-pointer hover:opacity-75 transition-opacity"
					onClick={togglePasswordVisibility}
				/>

				<input 
					type={showPassword ? "text" : "password"} 
					value={password}
					onChange={handlePasswordChange}
					placeholder="************"
					className={`w-full px-4 py-2 bg-blue-deep text-white placeholder-color font-dotgothic border-2 ${passwordError ? 'border-red-500' : 'border-black'} focus:outline-none shadow-no-blur-50-reverse-no-active tracking-widest`}
					required
				/>
				
				<SafeError 
					error={passwordError} 
					className="absolute left-0 top-full mt-1 text-xs"
					sanitize={false} />
				</div>


				<div className="mb-4">
					<div className="flex items-start gap-3">
						<input
							type="checkbox"
							id="privacy-checkbox"
							checked={privacyAccepted}
							onChange={(e) => setPrivacyAccepted(e.target.checked)}
							className="mt-1 h-5 w-5 cursor-pointer accent-purple-game border-2 border-black shadow-no-blur-50-reverse-no-active"
							required
						/>
						<label htmlFor="privacy-checkbox" className="text-blue-deep font-dotgothic text-sm leading-tight">
							{translation.pages.signup.gdprAgree}{' '}
							<button
								type="button"
								onClick={() => setShowPrivacyModal(true)}
								className="text-purple-game underline font-bold hover:text-purple-700 transition-colors"
							>
								{translation.common.privacyPolicy}
							</button>
						</label>
					</div>
				</div>

				<SafeError error={error} className="mt-2" />
				</div>

				{/* <button type="submit" className="w-full"> */}
				<ButtonPurple 
				type='submit'
				disabled={!nameAvailable || !!nameError || !!passwordError || !privacyAccepted}
				>
					<span className="flex items-center justify-end gap-2">
					{translation.common.continue}
					<img src={arrow_icon} alt="Arrow" className="h-4 w-auto"/>
					<img src={arrow_icon} alt="Arrow" className="h-4 w-auto"/>
					</span>
				</ButtonPurple>
				{/* </button> */}
			</form>
			</section>

			<section className="flex items-center justify-center m-4">
			<img src={signup_image} alt="Login Image" className='h-[500px] w-auto object-cover'/>
			</section>
		</div>
		</div>

		{/* Privacy Policy Modal */}
		<PrivacyPolicyModal
			isOpen={showPrivacyModal}
			onClose={() => setShowPrivacyModal(false)}
		/>
	</main>
	);
}