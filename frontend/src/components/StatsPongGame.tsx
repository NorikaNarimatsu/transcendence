import React from "react"

interface GameStatsProps {
    onClose: () => void;
}

export default function StatsPongGame({ onClose }: GameStatsProps): JSX.Element {
    return (
        <div className = "absolute inset-4 bg-pink-dark border-solid border-4 border-blue-deep">
            <h1 className="font-pixelify text-center text-4xl text-shadow text-white bg-purple-purple shadow-no-blur border-solid border-2 border-black p-2 m-4">Game Stats</h1>
        </div>
    )
}