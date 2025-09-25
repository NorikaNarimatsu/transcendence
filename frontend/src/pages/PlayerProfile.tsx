import type { JSX } from 'react';

export default function PlayerProfile(): JSX.Element{
    return (
        <main className="min-h-screen flex flex-col">
            <header className="h-40 bg-blue-deep flex">
                <div className="font-pixelify text-white text-opacity-25 text-7xl m-auto">What should we play today?</div>
            </header>
            <section className="flex-1 bg-pink-grid flex items-center justify-center">
                <div className="relative bg-pink-dark w-[1000px] h-[600px] m-[10px] flex justify-between items-center px-[50px]">
                    <div className="relative bg-pink-light w-[300px] h-[500px]"></div>
                    <div className="relative bg-blue-deep w-[500px] h-[500px]"></div>
                </div>
            </section>
            <footer className="h-40 bg-blue-deep"></footer>

        </main>
    )
}