import type { JSX } from 'react';
import { useState } from 'react';
import avatar1 from '../assets/avatars/Avatar 1.png'
import bgimage from '../assets/Player_Page.jpg'
import arrow_icon from '../assets/icons/arrow.png'

export default function PlayerProfile(): JSX.Element{
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const getButtonsForCategory = (category: string) => {
        switch(category) {
            case 'Games' :
                return [
                    { name: 'Play Pong', action: () => console.log('Starting Pong') },
                    { name: 'Play Snake', action: () => console.log('Starting Snake') }
                ];
            case 'Friends' :
                return [
                    { name: 'Add Friend', action: () => console.log('Adding Friend') },
                    { name: 'Remove Friend', action: () => console.log('Removing Friend') },
                    { name: 'See Friends', action: () => console.log('See Friends') }
                ];
            case 'Scores' :
                return [
                    { name: 'See Scores', action: () => console.log('Seeing Scores')},
                    { name: 'Reset all Scores', action: () => console.log('Reseting all scores')},
                ];
            case 'Settings' :
                return [
                    { name: 'Delete Acount', action: () => console.log('Deleting acount')},
                    { name: 'Update data', action: () => console.log('Updating account data')},
                ];
            default:
                return [];
        }
    };

    return (
        <main className="min-h-screen flex flex-col">
            <header className="h-40 bg-blue-deep flex">
                <div className="font-pixelify text-white text-opacity-25 text-7xl m-auto">What should we play today?</div>
            </header>
            <section className="flex-1 bg-pink-grid flex items-center justify-center">
                <div className="relative bg-pink-dark w-[825px] h-[600px] m-[10px] flex justify-between items-center px-[50px]">
                    {/* Player Card */}
                    <div className="shadow-no-blur-50-purple-bigger bg-pink-light w-[350px] h-[500px] flex flex-col justify-between py-6">
                        {/* PLAYER INFO title */}
                        <div className="font-pixelify text-white text-5xl text-center text-shadow mb-6">PLAYER INFO</div>
                        
                        {/* Avatar and player info */}
                        <div className="bg-pink-dark mx-[25px] h-[125px] border-purple flex flex-row justify-center items-center px-4">
                            <img src={avatar1} alt="Avatar 1" className="avatar m-auto" style={{borderColor: '#7a63fe'}}/>
                            <div className="flex flex-col m-auto">
                                <div className="font-pixelify text-white text-5xl">Norika</div> {/* TODO: API Call Player Name */}
                                <div className="font-dotgothic font-bold text-white text-2xl text-border-blue">700 XP</div> {/* TODO: API Call Player XP */}
                            </div>
                        </div>
                        
                        {/* Buttons container - evenly distributed */}
                        <div className="flex flex-col justify-between flex-grow mx-[25px] py-4">
                            {/* Game Button */}
                            <button className="button-pp-blue shadow-no-blur flex items-center justify-between "
                                    onClick={() => setSelectedCategory('Games')}
                            >
                                Games
                                <img src={arrow_icon} alt="Arrow" className="h-5 m-4"/>
                            </button>
                            {/* Friends Button */}
                            <button className="button-pp-blue shadow-no-blur flex items-center justify-between"
                                    onClick={() => setSelectedCategory('Friends')}
                            >
                                Friends
                                <img src={arrow_icon} alt="Arrow" className="h-5 m-4"/>
                            </button>
                            {/* Scores Button */}
                            <button className="button-pp-blue shadow-no-blur flex items-center justify-between"
                                    onClick={() => setSelectedCategory('Scores')}
                            >
                                Scores
                                <img src={arrow_icon} alt="Arrow" className="h-5 m-4"/>
                            </button>
                            {/* Settings Button */}
                            <button className="button-pp-blue-settings shadow-no-blur flex items-center justify-between"
                                    onClick={() => setSelectedCategory('Settings')}
                            >
                                Settings
                                <img src={arrow_icon} alt="Arrow" className="h-3 m-5"/>
                            </button>
                        </div>
                 </div>
                    {/* Right side content */}
                    <div className="w-[350px] h-[500px] overflow-hidden bg-cover bg-center relative border-img"
                        style={{ backgroundImage: `url(${bgimage})`, opacity: 0.5, boxShadow: 'inset 8px 0 2px -4px rgba(0, 0, 0, 0.6), inset 0 8px 2px -4px rgba(0, 0, 0, 0.6)'}}>
                        {selectedCategory && (
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col gap-4">
                                {getButtonsForCategory(selectedCategory).map((button, index) => (
                                    <button
                                        key={index}
                                        className="button-pp-purple shadow-no-blur-60"
                                        onClick={button.action}
                                    >
                                        {button.name}
                                        
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
            <footer className="h-40 bg-blue-deep"></footer>
        </main>
    )
}