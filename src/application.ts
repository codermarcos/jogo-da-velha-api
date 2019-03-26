import WebSocket from 'ws';
import Url from 'url-parse';
import Game from 'jogo-da-velha-js';
import { IncomingMessage } from 'http';

export default new class Application {

  private websocket = new WebSocket.Server({ port: 8080 }, this.start);
  private games = new Object();

  constructor() {
    this.websocket.on('connection', this.connection);
  }

  start() {
    console.log('application start');
  }

  connection(_ws: WebSocket, req: IncomingMessage) {
    const { query } = Url(req.url || '', true);

    typeof query.game === 'undefined'
      && (query.game = Math.random().toString(36).substring(2, 15));

    Object.defineProperty(
      this.games,
      query.game,
      {
        value: new Game()
      }
    )
  }
}