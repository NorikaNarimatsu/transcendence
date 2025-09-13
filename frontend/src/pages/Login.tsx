import { Link } from 'react-router-dom'
import login_image from '../assets/Login.png';
import ButtonPurple from '../components/ButtonPurple'
import eye_icon from '../assets/icons/eye.png'
import arrow_icon from '../assets/icons/arrow.png'

export default function LoginPage(){
  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 bg-pink-grid flex items-center justify-center">
        <div className="bg-pink-dark shadow-no-blur-70 flex m-8 overflow-hidden">
          {/* Left column for form */}
          <section className="p-8 flex flex-col justify-between min-w-80">
            <div className="mb-4">
            <h1 className="text-4xl text-blue-deep font-pixelify mb-[2px] text-shadow font-bold">LOG IN</h1>
                <h2 className="text-xl text-blue-deep font-dotgothic mb-[2px]">Hello ????!</h2> {/* TODO: Use the user name, API call to the back end? */}
                <h2 className="text-xl text-blue-deep font-dotgothic mb-[100px]">Welcome back :)</h2>
            {/* Password input */}
            <div className="relative mb-4">
              <img
                src={eye_icon}
                alt="Eye icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-[30px] w-auto"
                />

              <input 
                type="password" 
                placeholder="************"
                className="w-full px-4 py-2 bg-blue-deep text-white placeholder-color font-dotgothic border-2 border-black focus:outline-none shadow-no-blur-50-reverse-no-active tracking-widest"
              />
            </div>
            </div>
            
            {/* Continue button */} {/*TODO: CHANGE to path, THIS ONE DEPENDS ON THE DATABASE, DOES THE USER EXIST ALREADY OR NOT?*/}
            <ButtonPurple to="/">
                <span className="flex items-center justify-end gap-2">
                    Continue
                    <img src={arrow_icon} alt="Arrow" className="h-4 w-auto"/>
                    <img src={arrow_icon} alt="Arrow" className="h-4 w-auto"/>
                </span>
            </ButtonPurple>
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