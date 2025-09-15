import React from 'react';
import type { JSX } from 'react';
import avatar1 from '../assets/avatars/Avatar 1.png'
import avatar2 from '../assets/avatars/Avatar 2.png'

export default function PongGame(): JSX.Element{

    return (
        <main className="min-h-screen flex flex-col">
            {/* Top bar | LEARNED: Had to use a CSS grid instead of Flex to make sure that the score is always centered in the page.*/}
            <header className="h-40 bg-blue-deep grid grid-cols-3 items-center">
                {/* Player 1 - TODO: API call. Who is the player/avatar?*/}
                <div className="flex items-center justify-start gap-2">
                    <h1 className="player-name">Norika</h1>
                    <img src={avatar1} alt="Avatar 1" className="avatar" />
                </div>
                
                {/* Scores - TODO: API call? - Always centered */}
                <div className="flex justify-center">
                    <p className="player-name">1 - 0</p>
                </div>
                
                {/* Player 2 - TODO: API call. Who is the player/avatar?*/}
                <div className="flex items-center justify-end gap-2">
                    <img src={avatar2} alt="Avatar 2" className="avatar" />
                    <h2 className="player-name">Sara</h2>
                </div>
            </header>
            <section className="flex-1 bg-pink-grid flex items-center justify-center">
                {/* Scores Area */}
                {/* Game Area */}
                <div className="bg-pink-dark w-[1000px] h-[600px] shadow-no-blur-70">

                </div>
            </section>
            {/* Bottom bar */}
            <footer className="h-40 bg-blue-deep">
                <h1 className="font-pixelify text-pink-light text-opacity-25 text-9xl text-center m-[15px]">PONG GAME</h1>
            </footer>
        </main>
    )
}