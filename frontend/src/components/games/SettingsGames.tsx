import React, { useState } from 'react';
import bgimage from '../../assets/Game.jpg'
import LeftButton from '../decoration/ButtonPurple'

interface GameSettingsProps {
    onClose: () => void;
    onBackgroundChange: (background: string) => void;
    currentBackground: string;
}

export default function SettingsPongGame({ onClose, onBackgroundChange, currentBackground }: GameSettingsProps): JSX.Element {

    const [selectedOption, setSelectedOption] = useState<'gameMode' | 'background' | 'language' | null>(null);
    const buttonClasses = 'button-pp-purple shadow-no-blur-60 !bg-pink-dark !text-2xl';

    const handleBackgroundSelect = (bgColor: string) => {
        onBackgroundChange(bgColor);
        // setSelectedOption(null);
    };

    //TODO: API Call to update the Language Selected + What does the Game Mode means? Faster snake? Faster Ball?.
    const renderOptions = () => {
        switch (selectedOption) {
            case 'gameMode':
                return (
                     <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col gap-4 opacity-80'>
                         <button className={buttonClasses}>Easy</button>
                         <button className={buttonClasses}>Medium</button>
                         <button className={buttonClasses}>Hard</button>
                     </div>
                );
            case 'background':
                return (
                    <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col gap-4 opacity-80'>
                         <button className='button-pp-purple shadow-no-blur-60 !bg-blue-deep !text-2xl'
                            onClick={() => handleBackgroundSelect('bg-blue-deep')}>Blue</button>
                         <button className='button-pp-purple shadow-no-blur-60 !bg-purple-purple !text-2xl'
                            onClick={() => handleBackgroundSelect('bg-purple-purple')}>Purple</button>
                         <button className='button-pp-purple shadow-no-blur-60 !bg-pink-light !text-2xl'
                            onClick={() => handleBackgroundSelect('bg-pink-light')}>Pink</button>
                         <button className='button-pp-purple shadow-no-blur-60 !bg-pink-dark !text-2xl'
                            onClick={() => handleBackgroundSelect('bg-pink-dark')}>Default Pink</button>
                     </div>
                );
            case 'language':
                return(
                    <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col gap-4 opacity-80'>
                         <button className={buttonClasses}>English</button>
                         <button className={buttonClasses}>Portuguese</button>
                         <button className={buttonClasses}>Japanese</button>
                         <button className={buttonClasses}>Polish</button>
                     </div>
                );
            default:
                return null;
        }
    };

      return (
        <div className='absolute flex flex-col inset-4 bg-purple-purple border-solid border-4 border-blue-deep'>
            <div className='w-full flex-shrink-0'>
                <h1 className='font-pixelify text-center text-4xl text-shadow text-white bg-pink-dark shadow-no-blur border-solid border-2 border-black p-2 m-4'>Game Settings</h1>
            </div>
            <div className='flex flex-1 overflow-hidden p-4 gap-4'> 
                <div className='flex-1 !font-dotgothic flex flex-col justify-start'>
                    <LeftButton className='!font-dotgothic !mb-4 !text-left' onClick={() => setSelectedOption(selectedOption === 'gameMode' ? null : 'gameMode')}>Game Mode</LeftButton>
                    <LeftButton className='!font-dotgothic !mb-4 !text-left' onClick={() => setSelectedOption(selectedOption === 'background' ? null : 'background')}>Background Color</LeftButton>
                    <LeftButton className='!font-dotgothic !mb-4 !text-left' onClick={() => setSelectedOption(selectedOption === 'language' ? null : 'language')}>Language</LeftButton>
                </div>
                <div className='flex-1 relative'>
                    <img className='w-full h-full max-h-full object-cover object-bottom rounded border-solid border-blue-deep border-4' src={bgimage} alt='Background images'/>
                    {selectedOption && renderOptions()}
                </div>
            </div>
        </div>
    )
}