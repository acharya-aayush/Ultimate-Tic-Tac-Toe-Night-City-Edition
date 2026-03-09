require('dotenv').config();
const path    = require('path');
const http    = require('http');
const express = require('express');
const WebSocket = require('ws');

const PORT   = process.env.PORT   || 8080;
const ORIGIN = process.env.ALLOWED_ORIGIN || '*';

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin',  ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.get('/health', (_, res) => res.json({ ok: true, ts: Date.now() }));

app.use(express.static(path.join(__dirname, '..')));
app.get('*', (_, res) => res.sendFile(path.join(__dirname, '..', 'index.html')));

const server = http.createServer(app);
const wss    = new WebSocket.Server({ server });

const rooms = new Map();

function genCode() {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 5; i++) s += c[Math.floor(Math.random() * c.length)];
  return s;
}

function send(ws, obj) {
  if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj));
}

function peer(room, ws) {
  return room.players[0] === ws ? room.players[1] : room.players[0];
}

wss.on('connection', (ws, req) => {
  const origin = req.headers.origin || '';
  if (ORIGIN !== '*' && origin && !origin.includes('localhost') && origin !== ORIGIN) {
    ws.close(1003, 'Forbidden');
    return;
  }

  ws.roomCode    = null;
  ws.playerIndex = null;

  ws.on('message', raw => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    switch (msg.type) {
      case 'create': {
        let code;
        do { code = genCode(); } while (rooms.has(code));
        rooms.set(code, { players: [ws, null], rematchVotes: new Set() });
        ws.roomCode    = code;
        ws.playerIndex = 0;
        send(ws, { type: 'created', roomCode: code });
        send(ws, { type: 'waiting' });
        console.log(`[${code}] created`);
        break;
      }

      case 'join': {
        const code = (msg.roomCode || '').trim().toUpperCase();
        const room = rooms.get(code);
        if (!room)         { send(ws, { type: 'error', message: 'Room not found.'  }); return; }
        if (room.players[1]) { send(ws, { type: 'error', message: 'Room is full.' }); return; }
        room.players[1] = ws;
        ws.roomCode    = code;
        ws.playerIndex = 1;
        send(room.players[0], { type: 'start', playerNumber: 1 });
        send(room.players[1], { type: 'start', playerNumber: 2 });
        console.log(`[${code}] started`);
        break;
      }

      case 'move': {
        const room = rooms.get(ws.roomCode);
        if (!room) return;
        const { boardIndex, cellIndex } = msg;
        if (boardIndex == null || cellIndex == null) return;
        send(peer(room, ws), { type: 'move', boardIndex, cellIndex });
        break;
      }

      case 'rematch': {
        const room = rooms.get(ws.roomCode);
        if (!room) return;
        room.rematchVotes.add(ws.playerIndex);
        if (room.rematchVotes.size === 1) {
          send(peer(room, ws), { type: 'rematch_requested' });
        } else {
          room.rematchVotes.clear();
          send(room.players[0], { type: 'rematch_start', playerNumber: 2 });
          send(room.players[1], { type: 'rematch_start', playerNumber: 1 });
          [room.players[0], room.players[1]] = [room.players[1], room.players[0]];
          room.players[0].playerIndex = 0;
          room.players[1].playerIndex = 1;
          console.log(`[${ws.roomCode}] rematch — players swapped`);
        }
        break;
      }
    }
  });

  ws.on('close', () => {
    const room = ws.roomCode ? rooms.get(ws.roomCode) : null;
    if (!room) return;
    send(peer(room, ws), { type: 'opponent_disconnected' });
    rooms.delete(ws.roomCode);
    console.log(`[${ws.roomCode}] closed`);
  });
});

server.listen(PORT, () => console.log(`Server on port ${PORT}`));
