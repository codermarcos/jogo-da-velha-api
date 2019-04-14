import WebSocket from 'ws';
import Url from 'url-parse';
import Game from 'jogo-da-velha-js';
import { IncomingMessage } from 'http';

export default new class Application {

  private websocket = new WebSocket.Server({ port: 8080 }, this.start);
  private games: { [key: string]: any } = new Object();

  constructor() {
    this.websocket.on('connection', this.connection.bind(this));
  }

  get hash(): string {
    return Math.random().toString(36).substring(2, 10);
  }

  start() {
    console.log('application start');
  }

  connection(ws: WebSocket, req: IncomingMessage) {
    const games = this.games;
    const { query } = Url(req.url || '', true);
    const game = typeof query.game !== 'string' || query.game.length !== 8 ? this.hash.toString() : query.game;
    const token = typeof query.token !== 'string' || query.token.length !== 8 ? this.hash.toString() : query.token;

    if (game in games) {
      if (!('p2' in games[game])) {
        ws.send(JSON.stringify({ game, token, event: 'waiting start' }));
        ws.on('message', this.message.bind(this));
        games[game].specs.push(ws);

        const args: IJogoDaVelhaJs = {
          onstart() {
            games[game].specs
              .forEach(
                (w: WebSocket) => w.send(JSON.stringify({ game, event: 'start' }))
              );
          },
          onnext(data: INextEvent) {
            games[game].specs
              .forEach(
                (w: WebSocket) => w.send(JSON.stringify({ game, data, event: 'next' }))
              );
          },
          onfinish(data: string) {
            games[game].specs
              .forEach(
                (w: WebSocket) => w.send(JSON.stringify({ game, data, event: 'finish' }))
              );
          }
        }
        games[game].game = new Game(args);
        games[game].p2 = token;
      } else {
        ws.send(JSON.stringify({ game, event: 'specting' }));
        ws.on('message', this.message.bind(this));
        games[game].specs.push(ws);
      }
    } else {
      Object.defineProperty(games, game, {
        value: {
          specs: new Array(ws),
          p1: token
        }
      });
      ws.send(JSON.stringify({ game, token, event: 'waiting p2' }));
      ws.on('message', this.message.bind(this));
    }
  }

  play() {
    
  }

  emit(specs: Array<WebSocket>) {
    // specs
    //   .forEach(

    //   )
  }

  message(message: string) {
    const data = JSON.parse(message);

    switch (data.event) {
      case 'play':
        break;
    
      default:
        console.log(data);
        break;
    }
  }
}