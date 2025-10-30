import login_image from '../../assets/Login.png';
import ButtonPurple from '../../components/decoration/ButtonPurple'
import eye_icon from '../../assets/icons/eye.png'
import arrow_icon from '../../assets/icons/arrow.png'
import { sanitizeInput } from '../../utils/sanitizeInput';
import SafeError from '../../components/SafeError';

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../user/UserContext'; 

export default function LoginPage(){
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useUser();

  const email = location.state?.email || "";
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [show2FAInput, setShow2FAInput] = useState(false);
  const [temporaryToken, setTemporaryToken] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [userID, setUserID] = useState<any>(null);

  // Fetch username when component mounts
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const response = await fetch(
          `https://localhost:8443/getUserByEmail/${encodeURIComponent(email)}`
        );
        if (response.ok) {
          const data = await response.json();
          setName(data.name);
        }
      } catch (error) {
        console.error("Failed to fetch user name:", error);
      }
    };

    if (email) {
      fetchUserName();
    }
  }, [email]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // Step 1: Validate password
      const response = await fetch(
        "https://localhost:8443/validatePasswordbyEmail",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // with 2FA enabled
        if (data.requires2FA) {
          setShow2FAInput(true);
          setTemporaryToken(data.temporaryToken);
          if (data.user) {
            setUser({
              userID: data.user.userID,
              name: data.user.name,
              avatarUrl: data.user.avatarUrl,
            });
			setUserID(data.user.userID);
          } else {
            try {
              const userResponse = await fetch(
                `https://localhost:8443/getUserInfoByEmail/${encodeURIComponent(
                  email
                )}`
              );
              if (userResponse.ok) {
                const userData = await userResponse.json();
                setUser({
                  userID: userData.userID,
                  name: userData.name,
                  avatarUrl: userData.avatarUrl,
                });
				setUserID(userData.userID);
              }
            } catch (err) {
              console.error("Failed to fetch user info for 2FA: ", err);
            }
          }
        } else {
          // without 2FA
          if (data.token) localStorage.setItem("authToken", data.token);

          if (data.user) {
            setUser({
              userID: data.user.userID,
              name: data.user.name,
              avatarUrl: data.user.avatarUrl,
            });
            navigate("/playerProfile");
          } else {
            const userResponse = await fetch(
              `https://localhost:8443/getUserInfoByEmail/${encodeURIComponent(
                email
              )}`
            );
            if (userResponse.ok) {
              const userData = await userResponse.json();
              setUser({
                userID: userData.userID,
                name: userData.name,
                avatarUrl: userData.avatarUrl,
              });
              navigate("/playerProfile");
            } else {
              setError("Failed to get user information");
            }
          }
        }

        // // Step 2: Get user info
        // const userResponse = await fetch(
        //   `https://localhost:8443/getUserInfoByEmail/${encodeURIComponent(email)}`
        // );

        // if (userResponse.ok) {
        //   const userData = await userResponse.json();

        //   // Step 3: Prepare user data
        //   const userToStore = {
        //     userID: userData.userID,
        //     name: userData.name,
        //     avatarUrl: userData.avatarUrl
        //   };

        //   // Step 4: Set user (this should trigger localStorage save)
        //   setUser(userToStore);

        //   // TODO: check it > I think this is not being use
        //   // // Step 5: Debug localStorage after a delay
        //   // setTimeout(() => {
        //   //   const stored = localStorage.getItem('currentUser');
        //   //   if (stored) {
        //   //     try {
        //   //       const parsed = JSON.parse(stored);
        //   //     } catch (e) {
        //   //       console.error("Login: Error parsing stored user:", e);
        //   //     }
        //   //   } else {
        //   //     console.error("Login: NO DATA in localStorage!");
        //   //   }
        //   // }, 1000);

        //   // Step 6: Navigate
        //   navigate('/playerProfile');
        // } else {
        //   setError('Failed to get user information');
        // }
      } else {
        // const data = await response.json();
        setError(data.message || "Invalid password");
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
      const response = await fetch("https://localhost:8443/2fa/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userID: userID,
          code: verificationCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("authToken", data.token);
		// console.log('2FA verification success, data: ', data);
		// console.log('2FA verification success, data.user: ', data.user);
        setUser(data.user);
		// console.log('2FA verification success, data.user.userID: ', data.user.userID);
		const userWithCorrectID = {
			userID: data.user.userID,
			name: data.user.name,
			avatarUrl: data.user.avatarUrl
		};
		// console.log('Setting user with correct ID: ', userWithCorrectID);
		setUser(userWithCorrectID);
        navigate("/playerProfile");
      } else {
        setError(data.message || "Incorrect 2FA code");
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
                  Hello {name ? sanitizeInput.escapeHtml(name) : "User"}!
                </h2>
                <h2 className="text-xl text-blue-deep font-dotgothic mb-[100px]">
                  Welcome back :)
                </h2>

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
                  Continue
                  <img src={arrow_icon} alt="Arrow" className="h-4 w-auto" />
                  <img src={arrow_icon} alt="Arrow" className="h-4 w-auto" />
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
					onChange={(e) =>setVerificationCode(e.target.value)}
					placeholder="******"
					maxLength={6}
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