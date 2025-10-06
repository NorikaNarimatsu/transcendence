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

	export default function signupUnkownUser() {
	const location = useLocation();
	const navigate = useNavigate();

	const email = location.state?.email
	const [name, setName] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [nameError, setNameError] = useState('');
	const [passwordError, setPasswordError] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [nameAvailable, setNameAvailable] = useState(false);

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
				const response = await fetch('https://localhost:8443/validate-name', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ name: value }),
				});
				if (response.status === 200) { 
					setNameError('');
					setNameAvailable(true);
				}
				else if (response.status === 409) {
					setNameError('Nickname is already taken');
					setNameAvailable(false);
				}
				else if (response.status === 400) { 
					const data = await response.json();
					setNameError(data.message || 'Invalid nickname');
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

	if (nameError || passwordError) {
		setError('Please fix the errors before submitting the form.');
		return;
	}

	try {
		const response = await fetch('https://localhost:8443/addNewUser', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ name, email, password }),
		});
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
					SIGN UP
				</h1>
				<h2 className="text-xl text-blue-deep font-dotgothic mb-[20px]">
					You are new here!
				</h2>

				<button 
					type="button"
					onClick={() => navigate(-1)}
					className="text-blue-deep underline mb-4">
					← Wrong email? Go back 
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
					placeholder="Enter Nickname"
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
				
				<SafeError error={passwordError} className="absolute left-0 top-full mt-1 text-xs" />
				</div>

				<SafeError error={error} className="mt-2" />
				</div>

				{/* <button type="submit" className="w-full"> */}
				<ButtonPurple 
				type='submit'
				disabled={!nameAvailable || !!nameError || !!passwordError}
				>
					<span className="flex items-center justify-end gap-2">
					Continue
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
	</main>
	);
}