import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import signup_image from '../assets/SignUp.jpg';
import ButtonPurple from '../components/ButtonPurple';
import mail_icon from '../assets/icons/mail.png';
import person_icon from '../assets/icons/person.png';
import eye_icon from '../assets/icons/eye.png';
import arrow_icon from '../assets/icons/arrow.png';

export default function signupUnkownUser() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
                <div className='relative mb-4'>
                  <img
                    src={person_icon}
                    alt="Person icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-[30px] w-auto"
                  />
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter Name"
                    className="w-full px-4 py-2 bg-blue-deep text-white placeholder-color font-dotgothic border-2 border-black focus:outline-none shadow-no-blur-50-reverse-no-active tracking-widest"
                    required
                  />
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

                <div className="relative mb-4">
                  <img
                    src={eye_icon}
                    alt="Eye icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-[30px] w-auto"
                  />
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="************"
                    className="w-full px-4 py-2 bg-blue-deep text-white placeholder-color font-dotgothic border-2 border-black focus:outline-none shadow-no-blur-50-reverse-no-active tracking-widest"
                    required
                  />
                </div>

                {error && <p className="text-red-500 mt-2">{error}</p>}
              </div>

              {/* <button type="submit" className="w-full"> */}
                <ButtonPurple type='submit'>
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