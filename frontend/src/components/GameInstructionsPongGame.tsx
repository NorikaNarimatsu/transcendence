import React from 'react'

import ArrowIcon from '../assets/icons/arrow.png'

export default function GameInstructionsPongGame(): JSX.Element {
    return (
        <div className="absolute inset-4 p-4 border-solid border-8 border-purple" style={{backgroundColor: 'rgba(25, 0, 167, 0.5)'}}>
            <div className="h-full flex flex-col justify-between">
                <h1 className="font-pixelify text-center text-4xl text-shadow text-white bg-purple-purple shadow-no-blur border-solid border-2 border-black p-2">Game Instructions</h1>
                <section className="flex justify-around font-pixelify text-white mt-4 p-4">
                    {/* LEFT SIDE */}
                    <section>
                        <h2 className="text-3xl">Left Player</h2>
                        <p className="mt-4">
                            "W" key - Moves Up
                        </p>
                        <p className="mt-4">
                            "S" key - Moves Down
                        </p>
                    </section>
                    {/* RIGHT SIDE */}
                    <section>
                        <h2 className="text-3xl">Right Player</h2>
                        <p className="mt-4 flex gap-4">
                            <img src={ArrowIcon} alt="Arrow Up" className="h-4 -rotate-90"/> key - Moves Up
                        </p>
                        <p className="mt-4 flex gap-4">
                            <img src={ArrowIcon} alt="Arrow Up" className="h-4 rotate-90"/> key - Moves Down
                        </p>
                    </section>
                </section>
                    <p className="text-center font-dotgothic text-shadow text-white text-2xl text-border-blue tracking-wide mb-4 border-solid border-2 border-pink-light p-2">Press Space to Start the Game!</p>
                    <p className="text-center font-pixelify text-white text-l">*On the bottom of the page you can find aditional game settings and the game scores.</p>
            </div>
        </div>
    )
}