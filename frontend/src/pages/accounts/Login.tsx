import login_image from '../../assets/Login.png';
import ButtonPurple from '../../components/ButtonPurple'
import eye_icon from '../../assets/icons/eye.png'
import arrow_icon from '../../assets/icons/arrow.png'
import { sanitizeInput } from '../../utils/sanitizeInput';
import SafeError from '../../components/SafeError';

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../user/UserContext';

import apiCentral from '../../utils/apiCentral';

import { useLanguage } from '../../contexts/LanguageContext';

export default function LoginPage(){
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser, user } = useUser();

  const { lang, t } = useLanguage();
  const translation = t[lang];

const [email] = useState(() => {
	const authToken = localStorage.getItem('authToken');
	const currentUser = localStorage.getItem('currentUser');

	if (!currentUser && !authToken && location.state?.email) {
		return location.state.email;
	}
	return "";
});

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [show2FAInput, setShow2FAInput] = useState(false);
  const [temporaryToken, setTemporaryToken] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [userID, setUserID] = useState<any>(null);
  const hasClearedStateRef = useRef(false);

//   clean all the data if the user is not logged in anymore
  useEffect(() => {
	const authToken = localStorage.getItem('authToken');
	if (!user && !authToken) {
		setName("");
		setPassword("");
		setError("");
		setShowPassword(false);
		setShow2FAInput(false);
		setTemporaryToken("");
		setVerificationCode("");
		setUserID(null);
	} else {
		hasClearedStateRef.current = false;
	}
  }, [user]);

//   cleans up the location state to prevent showing again user's name after logout
  useEffect(() => {
	  const authToken = localStorage.getItem('authToken');
	  if (!user && !authToken && location.state?.email && !hasClearedStateRef.current) {
		  hasClearedStateRef.current = true;
		  navigate(location.pathname, { replace: true, state: undefined });
		}
	}, [user, location.pathname, navigate]);
	
	// Fetch username when component mounts
  useEffect(() => {
	const fetchUserName = async () => {
		const authToken = localStorage.getItem('authToken');
		if (user || authToken) {
			return;
		}
	if (!email || email.trim() === "") {
		setName("");
		return;
	}

      try {
        const response = await apiCentral.get(`/getUserByEmail/${encodeURIComponent(email)}`);
        if (response.data) {
          setName(response.data.name);
        }
      } catch (error) {
        console.error("Failed to fetch user name:", error);
		setName("");
      }
	};
	fetchUserName();
  }, [email, user]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

	if (!email || email.trim() === "") {
		setError("Email is missing");
		return;
	}

    try {
      // Step 1: Validate password
      const response = await apiCentral.post("/validatePasswordbyEmail", { email, password });

	  if (response.error) {
		setError(response.error);
		return;
	  }

      if (response.data) {
        // with 2FA enabled
        if (response.data.requires2FA) {
          setShow2FAInput(true);
          setTemporaryToken(response.data.temporaryToken);
          if (response.data.user) {
            setUser({
              userID: response.data.user.userID,
              name: response.data.user.name,
              avatarUrl: response.data.user.avatarUrl,
            });
			setUserID(response.data.user.userID);
          } else {
            try {
              const userResponse = await apiCentral.get(`/getUserInfoByEmail/${encodeURIComponent(email )}`);
              if (userResponse.data) {
                setUser({
                  userID: userResponse.data.userID,
                  name: userResponse.data.name,
                  avatarUrl: userResponse.data.avatarUrl,
                });
				setUserID(userResponse.data.userID);
              }
            } catch (err) {
              console.error("Failed to fetch user info for 2FA: ", err);
            }
          }
        } else {
          // without 2FA
          if (response.data.token) localStorage.setItem("authToken", response.data.token);

          if (response.data.user) {
            setUser({
              userID: response.data.user.userID,
              name: response.data.user.name,
              avatarUrl: response.data.user.avatarUrl,
            });
            navigate("/playerProfile");
          } else {

            const userResponse = await apiCentral.get(`/getUserInfoByEmail/${encodeURIComponent(email)}`);
            
			if (userResponse.data) {
              setUser({
                userID: userResponse.data.userID,
                name: userResponse.data.name,
                avatarUrl: userResponse.data.avatarUrl,
              });
              navigate("/playerProfile");
            } else {
              setError("Failed to get user information");
            }
          }
        }
      } else {
        // const data = await response.json();
        setError("Invalid password");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to login");
    }
  };

  const handle2FAVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {

		if (temporaryToken) {
			localStorage.setItem("authToken", temporaryToken);
		}
		const response = await apiCentral.post("/2fa/verify-code", { userID: userID, code: verificationCode });

      if (response.data) {

		if (response.data.token) {
			localStorage.setItem("authToken", response.data.token);
		}
		const userWithCorrectID = {
			userID: response.data.user.userID,
			name: response.data.user.name,
			avatarUrl: response.data.user.avatarUrl
		};
		setUser(userWithCorrectID);
        navigate("/playerProfile");
      } else {
        setError(response.error || "Incorrect 2FA code");
      }
    } catch (err) {
      setError("Failed to verify 2FA code");
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 bg-pink-grid flex items-center justify-center">
        <div className="bg-pink-dark shadow-no-blur-70 flex m-8 overflow-hidden">
          {/* Left column for form */}
          <section className="p-8 flex flex-col justify-between min-w-80">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <h1 className="text-4xl text-blue-deep font-pixelify mb-[2px] text-shadow font-bold">
                  LOG IN
                </h1>
                <h2 className="text-xl text-blue-deep font-dotgothic mb-[2px]">
                  {translation.pages.login.hello} {name ? sanitizeInput.escapeHtml(name) : 'User'}!
                </h2>
                <h2 className="text-xl text-blue-deep font-dotgothic mb-[100px]">{translation.pages.login.welcomeBack}</h2>
                
                {/* Password input with clickable eye */}
                <div className="relative mb-4">
                  <img
                    src={eye_icon}
                    alt={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-[30px] w-auto cursor-pointer hover:opacity-75 transition-opacity"
                    onClick={togglePasswordVisibility}
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="************"
                    className="w-full px-4 py-2 bg-blue-deep text-white placeholder-color font-dotgothic border-2 border-black focus:outline-none shadow-no-blur-50-reverse-no-active tracking-widest"
                    required
                  />
                </div>
                <SafeError error={error} className="mt-2 font-dotgothic" />
              </div>

              {/* Continue button */}
              <ButtonPurple type="submit">
                <span className="flex items-center justify-end gap-2">
                  {translation.common.continue}
                  <img src={arrow_icon} alt="Arrow" className="h-4 w-auto"/>
                  <img src={arrow_icon} alt="Arrow" className="h-4 w-auto"/>
                </span>
              </ButtonPurple>
            </form>
          </section>

          {/* Right column for image */}
          <section className="flex items-center justify-center m-4">
            <img
              src={login_image}
              alt="Login Image"
              className="h-[500px] w-auto object-cover"
            />
          </section>
        </div>
      </div>
	  {show2FAInput && (
		<form onSubmit={handle2FAVerification} className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-pink-dark p-8 rounded-lg shadow-lg">
				<h2 className="text-2xl font-bold mb-4 text-blue-deep font-pixelify">
					Enter the verification code 
				</h2>
				<p className="text-blue-deep font-dotgothic mb-4">
					Check your email for the 6-digit code
				</p>
				<input
					type="text"
					value={verificationCode}
					onChange={(e) => {
						const sanitizedCode = sanitizeInput.sanitizeVerificationCode(e.target.value);
						setVerificationCode(sanitizedCode);
					}}
					placeholder="******"
					maxLength={6}
					pattern="[0-9]{6}"
					className="w-full px-4 py-2 bg-blue-deep text-white placeholder-gray-400 font-dotgothic border-2 border-black focus:outline-none tracking-widest text-center text-2xl mb-4"
					required
				/>
				<SafeError error={error} className="mb-4 font-dotgothic" />
				<div className="flex gap-4">
					<button
						type="submit"
						className="flex-1 px-6 py-2 br-purple-600 text-white rounded hover:bg-purple-700 font-pixelify"
					>
						Verify
					</button>
					<button
						type="button"
						onClick={() => {
							setShow2FAInput(false);
							setError('');
							setVerificationCode('');
						}}
						className="flex-1 px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 font-pixelify"
						>
							Cancel
					</button>
				</div>
			</div>
		</form>
	  )}
    </main>
  );
}