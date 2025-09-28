import signup_image from '../../assets/SignUp.jpg';
import ButtonPurple from '../../components/ButtonPurple'
import mail_icon from '../../assets/icons/mail.png'
import arrow_icon from '../../assets/icons/arrow.png'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


export default function SignUp(){
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('https://localhost:8443/validateEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      if (response.status === 200)
        navigate('/login', { state: { email } });
      else if (response.status === 204)
        navigate('/signupUnkownUser', { state: { email } });
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to validate email');
    }
  };
  
  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 bg-pink-grid flex items-center justify-center">
        <div className="bg-pink-dark shadow-no-blur-70 flex m-8 overflow-hidden">
          {/* Left column for form */}
          <section className="p-8 flex flex-col justify-between min-w-80">
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <div>
                <h1 className="text-4xl text-blue-deep font-pixelify mb-[20px] text-shadow font-bold">
                  SIGN UP</h1>
                {/* Email input */}
                <div className="relative">
                  <img
                    src={mail_icon}
                    alt="Mail icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-[30px] w-auto"
                  />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name_0000@gmail.com"
                    className="w-full px-4 py-2 bg-blue-deep text-white placeholder-color font-dotgothic border-2 border-black focus:outline-none shadow-no-blur-50-reverse-no-active tracking-widest"
                    required
                  />
                </div>
                {/* Message displays */}
                {error && <p className="text-red-500 mt-2">{error}</p>}
              </div>
              <div className="flex-grow"></div>
              <div className="flex-shrink-0">
              {/* Continue button */}
              {/* <button type="submit" className="w-full"> */}
                <ButtonPurple type='submit'>
                  <span className="flex items-center justify-end gap-2">
                    Continue
                    <img src={arrow_icon} alt="Arrow" className="h-4 w-auto"/>
                    <img src={arrow_icon} alt="Arrow" className="h-4 w-auto"/>
                  </span>
                </ButtonPurple>
              {/* </button> */}
            </div>
          </form>
          </section>
          
          {/* Right column for image */}
          <section className="flex items-center justify-center m-4">
            <img src={signup_image} alt="Login Image" className='h-[500px] w-auto object-cover'/>
          </section>
        </div>
      </div>
    </main>
  )
}