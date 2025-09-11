import { Link } from 'react-router-dom'
import login_image from '../assets/Login.jpg';

export default function LoginPage(){
  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 bg-pink-grid flex items-center justify-center">
        <div className="bg-brand-dark_pink shadow-no-blur-70 flex m-8 rounded-lg overflow-hidden">
          {/* Left column for form */}
          <div className="p-8 flex flex-col justify-center min-w-80">
            <h1 className="text-2xl text-brand-deep_blue font-pixelify mb-6">SIGN UP</h1>
            
            {/* Email input */}
            <div className="mb-4">
              <input 
                type="email" 
                placeholder="name_00@email.com"
                className="w-full px-4 py-2 bg-brand-deep_blue text-white placeholder-gray-300 rounded border-2 border-brand-deep_blue focus:outline-none"
              />
            </div>
            
            {/* Continue button */}
            <button className="bg-brand-purple text-white px-6 py-2 rounded font-pixelify hover:bg-opacity-80 transition">
              Continue ››
            </button>
          </div>
          
          {/* Right column for image */}
          <div className="flex items-center justify-center">
            <img src={login_image} alt="Login Image" className='h-64 w-auto object-cover'/>
          </div>
        </div>
      </div>
    </main>
  )
}
