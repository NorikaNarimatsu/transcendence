// export let gameState = {
//     ball: { x: 300, y: 200, vx: 2, vy: 2 },
//     paddles: [
//         { y: 150 }, // Player 1
//         { y: 150 }  // Player 2
//     ],
//     scores: [0, 0]
// };

// export let gameInterval = null;

// export function startGameLoop(players) {
//     if (gameInterval) return; // Prevent multiple intervals
//         gameInterval = setInterval(() => {
//         // Move ball
//         gameState.ball.x += gameState.ball.vx;
//         gameState.ball.y += gameState.ball.vy;

//     // Collision with top/bottom
//     if (gameState.ball.y <= 0 || gameState.ball.y >= 400) {
//         gameState.ball.vy *= -1;
//     }

//     // TODO: Add paddle collision and scoring logic

//     // Broadcast state to both players
//     players.forEach(conn => {
//             conn.send(JSON.stringify({ type: 'state', state: gameState }));
//         });
//         }, 16); // ~60 FPS
//     }

// export function stopGameLoop() {
//     if (gameInterval) {
//         clearInterval(gameInterval);
//         gameInterval = null;
//     }
// }