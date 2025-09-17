import React, { useState, useEffect, useRef } from 'react'; //Import React and React Hooks
import type { JSX } from 'react';
import avatar1 from '../assets/avatars/Avatar 1.png'
import avatar2 from '../assets/avatars/Avatar 2.png'


export default function PongGame(): JSX.Element{
	const [leftPaddleY, setLeftPaddleY] = useState(250); //State variable for left paddle vertical position. (leftPaddleY is the current position - initially 250, setLeftPaddleY is the updater function for the previous variable),
	const [rightPaddleY, setRightPaddleY] = useState(250);
	const [ballX, setBallX] = useState(500); //initial ball position horizontal
	const [ballY, setBallY] = useState(300); //initial ball position vertical

	const ballVelocity = useRef({ dx: 0, dy: 0});

	const keysPressed = useRef<{ [key: string]: boolean }>({}); //useRef gives a mutable object that persists across renders and changing it doesn't cause re-renders.

	const launchBall = () => {
		const speed = 4; // pixels per frame
		const angle = (Math.random() * Math.PI / 4) - Math.PI/8; // small random angle
		const direction = Math.random() < 0.5 ? -1 : 1; // left or right
		ballVelocity.current.dx = direction * speed * Math.cos(angle);
  		ballVelocity.current.dy = speed * Math.sin(angle);
	};


	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => { //KeyboardEvent is a built-in browser type/interface (TS) part of the DOM API. e- stands for event object 
			keysPressed.current[e.key] = true;
			if (e.key === " " && ballVelocity.current.dx === 0 && ballVelocity.current.dy === 0) {
				launchBall();
			}
		};
		const handleKeyUp = (e: KeyboardEvent) => {
			keysPressed.current[e.key] = false;
		};

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);

		const step = 3;

		const loop = () => {
		// Left paddle movement
		setLeftPaddleY((prev) => {
			let next = prev;
			if (keysPressed.current["w"] || keysPressed.current["W"]) next = Math.max(prev - step, 3);
			if (keysPressed.current["s"] || keysPressed.current["S"]) next = Math.min(prev + step, 600 - 133);
			return next;
		});

		// Right paddle movement
		setRightPaddleY((prev) => {
			let next = prev;
			if (keysPressed.current["ArrowUp"]) next = Math.max(prev - step, 3);
			if (keysPressed.current["ArrowDown"]) next = Math.min(prev + step, 600 - 133);
			return next;
		});

		// Ball movement
		setBallX((prevX) => {
			let nextX = prevX + ballVelocity.current.dx;

			// Left/Right wall collision (reset)
			if (nextX <= 0 || nextX + 20 >= 1000) {
				ballVelocity.current.dx = 0;
				ballVelocity.current.dy = 0;
				nextX = 500;
				setBallY(300);
			} else{
				// Left paddle collision
				if (
				nextX <= 13 && // paddle width + ball margin
				ballY + 10 >= leftPaddleY &&
				ballY <= leftPaddleY + 133
				) {
				ballVelocity.current.dx = -ballVelocity.current.dx;
				}
	
				// Right paddle collision
				if (
				nextX >= 1000 - 13 - 10 && // game width - paddle - ball width
				ballY + 10 >= rightPaddleY &&
				ballY <= rightPaddleY + 133
				) {
				ballVelocity.current.dx = -ballVelocity.current.dx;
				}
			}
			return nextX;
		});

		setBallY((prevY) => {
			let nextY = prevY + ballVelocity.current.dy;

			// Top/bottom wall bounce
			if (nextY <= 0 || nextY >= 600 - 20) {
			ballVelocity.current.dy = -ballVelocity.current.dy;
			}

			return nextY;
		});

			requestAnimationFrame(loop); //Schedules next frame
		};

		requestAnimationFrame(loop); //Starts the loop.

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
	};
}, []);

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
                    <p className="player-name">0 - 0</p>
                </div>
                
                {/* Player 2 - TODO: API call. Who is the player/avatar?*/}
                <div className="flex items-center justify-end gap-2">
                    <img src={avatar2} alt="Avatar 2" className="avatar" />
                    <h2 className="player-name">Sara</h2>
                </div>
            </header>
			{/* Game Area */}
            <section className="flex-1 bg-pink-grid flex items-center justify-center">
                <div className="relative bg-pink-dark w-[1000px] h-[600px] shadow-no-blur-70">
					{/* Center bar, field division */}
					<div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[5px] h-[550px] bg-white opacity-30 rounded-xl"></div>
					{/* Paddles */}
					<div className="paddle absolute left-3"
						style={{ top: `${leftPaddleY}px` }}>
					</div>
					<div className="paddle absolute right-3"
						style={{ top: `${rightPaddleY}px` }}>
					</div>
					{/* Ball */}
					<div className="ball absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
						style={{ top: `${ballY}px`, left: `${ballX}px` }}>
					</div>
                </div>
            </section>
            {/* Bottom bar */}
            <footer className="h-40 bg-blue-deep">
                <h1 className="font-pixelify text-pink-light text-opacity-25 text-9xl text-center m-[15px]">PONG GAME</h1>
            </footer>
        </main>
    )
}