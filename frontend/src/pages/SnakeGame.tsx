import type { JSX } from 'react';
import avatar1 from '../assets/avatars/Avatar 1.png'
import avatar2 from '../assets/avatars/Avatar 2.png'


export default function SnakeGame(): JSX.Element{

    return (
        <main className="min-h-screen flex flex-col">
            {/* Top bar | LEARNED: Had to use a CSS grid instead of Flex to make sure that the score is always centered in the page.*/}
            <header className="h-40 bg-blue-deep grid grid-cols-3 items-center">
                {/* Player 1 - TODO: API call. Who is the player/avatar?*/}
                <div className="flex items-center justify-start gap-2">
                    <h1 className="player-name">Eduarda</h1>
                    <img src={avatar1} alt="Avatar 1" className="avatar" />
                </div>
                
                {/* Scores - TODO: API call? - Always centered */}
                <div className="flex justify-center">
                    <p className="player-name">0 - 0</p>
                </div>
                
                {/* Player 2 - TODO: API call. Who is the player/avatar?*/}
                <div className="flex items-center justify-end gap-2">
                    <img src={avatar2} alt="Avatar 2" className="avatar" />
                    <h2 className="player-name">Gosia</h2>
                </div>
            </header>
            {/* Game Area */}
            <section className="flex-1 bg-pink-dark-grid bg-pink-dark flex items-center justify-center">
                <div className="relative bg-pink-light w-[1000px] h-[600px] shadow-no-blur-70">
                    {/* Snake1 */}
                    <div className="snake snake-blue snake-border-pink absolute left-6 top-1/2 transform -translate-y-1/2">
                        <div className="snake-head snake-head-pink absolute right-1 top-1/2 transform -translate-y-1/2"></div>
                    </div>
                    {/* Snake2 */}
                    <div className="snake snake-pink snake-border-blue absolute right-6 top-1/2 transform  -translate-y-1/2">
                        <div className="snake-head snake-head-blue absolute left-1 top-1/2 transform -translate-y-1/2"></div>
                    </div>
                    {/* Food */}
                    <div className="snake-food absolute left-1/2 top-1/2"></div>
                </div>
            </section>
            {/* Bottom bar */}
            <footer className="h-40 bg-blue-deep">
                <h1 className="font-pixelify text-pink-light text-opacity-25 text-9xl text-center m-[15px]">SNAKE GAME</h1>
            </footer>
        </main>
    )
}