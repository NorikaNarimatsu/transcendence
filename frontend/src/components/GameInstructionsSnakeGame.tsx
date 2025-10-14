import React from 'react'

import ArrowIcon from '../assets/icons/arrow.png'

export default function GameInstructionsSnakeGame(): JSX.Element {
    return (
        <div className="absolute inset-4 p-4 border-solid border-8 border-purple" style={{backgroundColor: 'rgba(25, 0, 167, 0.5)'}}>
            <div className="h-full flex flex-col justify-between">
                <h1 className="font-pixelify text-center text-4xl text-shadow text-white bg-purple-purple shadow-no-blur border-solid border-2 border-black p-2">Game Instructions</h1>
                <section className="font-dotgothic text-white text-center tracking-wide mt-4 p-4">
                   <p>Use the Arrow Keys to change the snake direction.</p>
                   <p>Goal: Eat at least 10 times.</p>
                   <p>You die if: you eat yourself or hit a wall.</p>
                </section>
                    <p className="text-center font-dotgothic text-shadow text-white text-2xl text-border-blue tracking-wide border-solid border-2 border-pink-light p-2">Press Space to Start the Game!</p>
                    <p className="text-center font-pixelify text-white text-l">*On the bottom of the page you can find aditional game settings and the game scores.</p>
            </div>
        </div>
    )
}