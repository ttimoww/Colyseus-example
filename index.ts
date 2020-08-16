import express from 'express';
import serveIndex from 'serve-index';
import path from 'path'
import { createServer } from 'http';
import { Server } from 'colyseus';

import { MyRoom } from './rooms/MyRoom'

const port = Number(process.env.PORT || 3000) + Number(process.env.NODE_APP_INSTANCE || 0);
const app = express();

app.use(express.json());

// Attach WebSocket Server on HTTP Server.
const gameServer = new Server({
  server: createServer(app),
  express: app
});

gameServer.define('MyRoom', MyRoom);


// Serve static files
app.use('/', serveIndex(path.join(__dirname, "client"), {'icons': true}))
app.use('/', express.static(path.join(__dirname, "client")));

gameServer.onShutdown(function(){
  console.log(`game server is going down.`);
});

gameServer.listen(port);

console.log(`Listening on http://localhost:${ port }`);
