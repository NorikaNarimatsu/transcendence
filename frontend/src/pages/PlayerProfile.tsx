import type { JSX } from 'react';
import avatar1 from '../assets/avatars/Avatar 1.png'

export default function PlayerProfile(): JSX.Element{
    return (
        <main className="min-h-screen flex flex-col">
            <header className="h-40 bg-blue-deep flex">
                <div className="font-pixelify text-white text-opacity-25 text-7xl m-auto">What should we play today?</div>
            </header>
            <section className="flex-1 bg-pink-grid flex items-center justify-center">
                <div className="relative bg-pink-dark w-[1000px] h-[600px] m-[10px] flex justify-between items-center px-[50px]">
                    {/* Player Card */}
                    <div className="shadow-no-blur bg-pink-light w-[350px] h-[500px] flex flex-col justify-between py-6">
                        {/* PLAYER INFO title */}
                        <div className="font-pixelify text-white text-5xl text-center text-shadow-xs">PLAYER INFO</div>
                        
                        {/* Avatar and player info */}
                        <div className="bg-pink-dark mx-[25px] h-[125px] border-purple flex flex-row justify-center items-center px-4">
                            <img src={avatar1} alt="Avatar 1" className="avatar m-auto" />
                            <div className="flex flex-col m-auto">
                                <div className="font-pixelify text-white text-5xl">Norika</div>
                                <div className="font-pixelify text-white text-3xl">700 XP</div>
                            </div>
                        </div>
                        
                        {/* Buttons container - evenly distributed */}
                        <div className="flex flex-col justify-between flex-grow mx-[25px] py-4">
                            <button className="button-pp">Games</button>
                            <button className="button-pp">Friends</button>
                            <button className="button-pp">Scores</button>
                            <button className="button-pp-settings">Settings</button>
                        </div>
                    </div>
                    {/* Right side content */}
                    <div className="relative bg-blue-deep w-[500px] h-[500px]"></div>
                </div>
            </section>
            <footer className="h-40 bg-blue-deep"></footer>
        </main>
    )
}