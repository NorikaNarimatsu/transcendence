import React from 'react';
import bgimage from '../assets/Game.jpg'

interface GameSettingsProps {
    onClose: () => void;
}

export default function SettingsPongGame({ onClose }: GameSettingsProps): JSX.Element {
    return (
        <div className = "absolute flex flex-col gap-2 inset-4 bg-purple-purple border-solid border-4 border-blue-deep overflow-clip">
            <div className='w-full h-full relative'>

            <h1 className="absolute top-0 h-1/5 w-full font-pixelify text-center text-4xl text-shadow text-white bg-pink-dark shadow-no-blur border-solid border-2 border-black p-2 m-4">Game Settings</h1>
            <div className='absolute bottom-0 h-4/5 pt-4'>
      <div className="flex h-full flex-row justify-between bg">
                <div className="m-5 font-dotgothic text-white text-xl">
                    <h2>Game Mode</h2>
                    <h2>Costumize background</h2>
                    <h2>Costumize paddles</h2>
                    <h2>Costumize ball</h2>
                    <h2>Language</h2>
                </div>
                <div className="max-w-md p-4 mb-4">
                    <img className=" max-w-1/3" src={bgimage} alt="Background images"/>
                </div>
           </div>
            </div>
     
            </div>
        </div>
    )
}