// main.ts
const canvas = document.getElementById("pongCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

// Paddle properties
const paddleWidth = 10;
const paddleHeight = 100;
const paddleX = 20;
const paddleY = (canvas.height - paddleHeight) / 2;

function drawPaddle() {
  ctx.fillStyle = "#000";
  ctx.fillRect(paddleX, paddleY, paddleWidth, paddleHeight);
}

// Initial drawing
drawPaddle();
