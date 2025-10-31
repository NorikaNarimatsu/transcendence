import React from 'react'
import { useLanguage } from '../contexts/LanguageContext'

import ArrowIcon from '../assets/icons/arrow.png'

export default function GameInstructionsSnakeGame(): JSX.Element {
    const { lang, t } = useLanguage();
    const translation = t[lang];
    return (
        <div className="absolute inset-4 p-4 border-solid border-8 border-purple" style={{backgroundColor: 'rgba(25, 0, 167, 0.5)'}}>
            <div className="h-full flex flex-col justify-between">
                <h1 className="font-pixelify text-center text-4xl text-shadow text-white bg-purple-purple shadow-no-blur border-solid border-2 border-black p-2">{translation.pages.gameInstructions.gameInstructions}</h1>
                <section className="font-dotgothic text-white text-center tracking-wide mt-4 p-4">
                   <p>{translation.pages.gameInstructionsSnake.instructionsA}</p>
                   <p>{translation.pages.gameInstructionsSnake.instructionsB}</p>
                   <p>{translation.pages.gameInstructionsSnake.instructionsC}</p>
                </section>
                    <p className="text-center font-dotgothic text-shadow text-white text-2xl text-border-blue tracking-wide border-solid border-2 border-pink-light p-2">{translation.pages.gameInstructionsSnake.pressSpaceToStartTheGame}</p>
                    <p className="text-center font-pixelify text-white text-l">*{translation.pages.gameInstructionsSnake.note}</p>
            </div>
        </div>
    )
}