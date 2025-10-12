import login_image from '../../assets/Login.png';
import ButtonPurple from '../../components/ButtonPurple'
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

  const email = location.state?.email || '';
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
        console.error('Failed to fetch user name:', error);
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
    setError('');

    console.log("🔍 Login: Starting login process for email:", email);

    try {
      // Step 1: Validate password
      const response = await fetch('https://localhost:8443/validatePasswordbyEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("🔍 Login: Password validation response status:", response.status);

      if (response.ok) {
        // Step 2: Get user info
        const userResponse = await fetch(
          `https://localhost:8443/getUserInfoByEmail/${encodeURIComponent(email)}`
        );

        console.log("🔍 Login: User info response status:", userResponse.status);

        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log("🔍 Login: Full API response:", userData);
          
          // Step 3: Prepare user data
          const userToStore = {
            userID: userData.userID,
            email: email,
            name: userData.name,
            avatarUrl: userData.avatarUrl
          };
          
          console.log("🔍 Login: About to store user:", userToStore);
          
          // Step 4: Set user (this should trigger localStorage save)
          setUser(userToStore);
          
          console.log("🔍 Login: setUser called, userID:", userData.userID);
          
          // Step 5: Debug localStorage after a delay
          setTimeout(() => {
            const stored = localStorage.getItem('currentUser');
            console.log("🔍 Login: What's in localStorage after setUser:", stored);
            if (stored) {
              try {
                const parsed = JSON.parse(stored);
                console.log("🔍 Login: Parsed stored user:", parsed);
              } catch (e) {
                console.error("🔍 Login: Error parsing stored user:", e);
              }
            } else {
              console.error("🔍 Login: NO DATA in localStorage!");
            }
          }, 1000);
          
          // Step 6: Navigate
          console.log("🔍 Login: Navigating to playerProfile");
          navigate('/playerProfile');
        } else {
          console.error("🔍 Login: Failed to get user info, status:", userResponse.status);
          setError('Failed to get user information');
        }
      } else {
        const data = await response.json();
        console.error("🔍 Login: Password validation failed:", data);
        setError(data.message || 'Invalid password');
      }
    } catch (err) {
      console.error("🔍 Login: Error during login:", err);
      setError('Failed to login');
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
                <h1 className="text-4xl text-blue-deep font-pixelify mb-[2px] text-shadow font-bold">LOG IN</h1>
                <h2 className="text-xl text-blue-deep font-dotgothic mb-[2px]">
                  Hello {name ? sanitizeInput.escapeHtml(name) : 'User'}!
                </h2>
                <h2 className="text-xl text-blue-deep font-dotgothic mb-[100px]">Welcome back :)</h2>
                
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
              <ButtonPurple type='submit'>
                <span className="flex items-center justify-end gap-2">
                  Continue
                  <img src={arrow_icon} alt="Arrow" className="h-4 w-auto"/>
                  <img src={arrow_icon} alt="Arrow" className="h-4 w-auto"/>
                </span>
              </ButtonPurple>
            </form>
          </section>
          
          {/* Right column for image */}
          <section className="flex items-center justify-center m-4">
            <img src={login_image} alt="Login Image" className='h-[500px] w-auto object-cover'/>
          </section>
        </div>
      </div>
    </main>
  )
}