import type { GameConfig } from './PongEngine';

// Function to calculate game config based on screen size
export const calculateGameConfig = (): GameConfig => {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  // Reserve space for header (160px) and footer (160px) // @sara can we normalize this? 
  const availableHeight = screenHeight - 320;
  
  const maxWidth = Math.min(screenWidth * 0.8, 1200);
  const maxHeight = Math.min(availableHeight * 0.8, 700);
  
  let gameWidth, gameHeight;  
  if (maxWidth / maxHeight > 5/3) {
    gameHeight = maxHeight;
    gameWidth = gameHeight * (5/3);
  } else {
    gameWidth = maxWidth;
    gameHeight = gameWidth * (3/5);
  }
  
  const scale = gameWidth / 1000;
  
  return {
    gameWidth: Math.round(gameWidth),
    gameHeight: Math.round(gameHeight),
    paddleWidth: Math.round(20 * scale),
    paddleHeight: Math.round(120 * scale),
    ballSize: Math.round(30 * scale),
    paddleSpeed: Math.max(2, Math.round(10 * scale)),
    ballSpeed: Math.max(2, Math.round(10 * scale)),
    winScore: 3
  };
};
