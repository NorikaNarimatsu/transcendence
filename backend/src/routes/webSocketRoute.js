// import { handlePlayerMove } from '../games/pong/pongGameLogic.js';

export default async function (app) {
  app.get('/game', { websocket: true }, (connection, request) => {
    console.log('Websocket client connected');
    connection.on('message', message => {
      // Example: handle player move and send result
    //   const result = handlePlayerMove('player1', message.toString());
    //   connection.socket.send(JSON.stringify(result));
        connection.send('pong: ' + message);
    });

    connection.on('close', () => {
      // Handle disconnect if needed
      console.log('Client disconnected');
    });
  });
}