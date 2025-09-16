// import { handlePlayerMove } from '../games/pong/pongGameLogic.js';

export default async function (app) {
  app.get('/game', { websocket: true }, (connection, request) => {
    connection.socket.on('message', message => {
      // Example: handle player move and send result
    //   const result = handlePlayerMove('player1', message.toString());
    //   connection.socket.send(JSON.stringify(result));
        connection.socket.send('pong: ' + message);
    });

    connection.socket.on('close', () => {
      // Handle disconnect if needed
      console.log('Client disconnected');
    });
  });
}