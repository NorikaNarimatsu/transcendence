// import { gameState, startGameLoop, gameInterval, stopGameLoop } from '../games/pong/pongGameLogic.js';

let pongPlayers = [];
let snakePlayers = [];

function pongHandler(connection, request) {
  pongPlayers.push(connection);
  const playerNumber = pongPlayers.length;

  console.log(`Websocket client connected as Pong Player ${playerNumber}`);

  connection.on('message', message => {
      connection.send('pong: ' + message);
      let data;
      try {
        data = JSON.parse(message);
      } catch (err){
        console.error('Received invalid JSON:', message);
        return;
      }
      if (data.type === 'move'){
        pongPlayers.forEach(conn => {
          if (conn != connection) {
            // conn.send(JSON.stringify({ type: 'opponent_move', direction: data.direction}));
            // gameState.paddles[playerNumber - 1].y = data.y;
          }
        });
      }
  });

    if (pongPlayers.length === 2) { // change this logic if we will handle more than 2 connections at time
      pongPlayers.forEach((conn, idx) => {
        conn.send(JSON.stringify({ type: 'start', player: idx + 1 }));
        // startGameLoop(players); // logic pong
      });
    }

    connection.on('close', () => {
      // console.log(`This is the number os active connections before`, players.length);
      pongPlayers = pongPlayers.filter(conn => conn !== connection);
      if (pongPlayers.length < 2 && gameInterval) {
          startGameLoop();
      }
      console.log(`This is the number of active connections`, pongPlayers.length);
      console.log(`Pong Player ${playerNumber} disconnected`);
    });
}

function snakeHandler(connection, request) {
  snakePlayers.push(connection);
  const playerNumber = snakePlayers.length;
  console.log(`Websocket client connected as Snake Player ${playerNumber}`);


    connection.on('message', message => {
      connection.send('snake: ' + message);
      // logic snake it will be single player?
    });

  connection.on('close', () => {
    snakePlayers = snakePlayers.filter(conn => conn !== connection);
    console.log(`Snake Player ${playerNumber} disconnected`);
  });
}

export default async function (app) {
  app.get('/pong', { websocket: true }, pongHandler);
  app.get('/snake', { websocket: true }, snakeHandler);
}