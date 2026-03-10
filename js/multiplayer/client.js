import { handleMove, startGame } from '../components/game.js';
import { showNotification } from '../utils/ui.js';

let socket         = null;
let myPlayerNumber = null;
let connected      = false;
let waitTimer      = null;
let promptTimer    = null;
let _intentionalClose = false;

function getServerURL() {
  if (window.MULTIPLAYER_SERVER_URL) return window.MULTIPLAYER_SERVER_URL;
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  return `${proto}://${location.host}`;
}

function clearWaitTimers() {
  clearTimeout(waitTimer);  waitTimer  = null;
  clearTimeout(promptTimer); promptTimer = null;
}

function startWaitTimer() {
  clearWaitTimers();
  // After 2 min: nudge the user
  promptTimer = setTimeout(() => {
    if (waitTimer) showNotification('No opponent yet — click "Play vs AI" to play while waiting.', 7000);
  }, 2 * 60 * 1000);
  // After 30 min: auto-fallback
  waitTimer = setTimeout(() => {
    clearWaitTimers();
    showNotification('No opponent found after 30 minutes. Starting AI game…', 5000);
    if (socket) { _intentionalClose = true; socket.close(); }
    setTimeout(() => { hideLobby(); startGame('ai'); }, 3500);
  }, 30 * 60 * 1000);
}

export function initMultiplayer() {
  setupLobbyUI();
}

export function sendMove(boardIndex, cellIndex) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'move', boardIndex, cellIndex }));
  }
}

export function isMyTurn() {
  if (!myPlayerNumber) return false;
  // Player 1 = X, Player 2 = O.  window.currentPlayer is 'X' or 'O'.
  return (myPlayerNumber === 1 && window.currentPlayer === 'X') ||
         (myPlayerNumber === 2 && window.currentPlayer === 'O');
}

export function requestRematch() {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'rematch' }));
  }
}

function connect(onOpen) {
  if (socket) { _intentionalClose = true; socket.close(); socket = null; }

  const url = getServerURL();
  socket = new WebSocket(url);

  socket.addEventListener('open', () => {
    connected = true;
    if (onOpen) onOpen();
  });

  socket.addEventListener('message', (event) => {
    let msg;
    try { msg = JSON.parse(event.data); }
    catch { return; }
    handleServerMessage(msg);
  });

  socket.addEventListener('close', () => {
    connected = false;
    if (_intentionalClose) { _intentionalClose = false; return; }
    if (window.gameMode === 'online') {
      showNotification('Connection lost. Return to lobby to reconnect.', 6000);
      showLobby();
    }
  });

  socket.addEventListener('error', () => {
    showNotification('Could not reach server. Is it running?', 5000);
    showLobby();
  });
}

function handleServerMessage(msg) {
  switch (msg.type) {

    case 'created':
      document.getElementById('mp-room-code-display').textContent = msg.roomCode;
      showLobbyStep('waiting-for-opponent');
      break;

    case 'waiting':
      showLobbyStep('waiting-for-opponent');
      startWaitTimer();
      break;

    case 'start':
      clearWaitTimers();
      myPlayerNumber = msg.playerNumber;
      window.onlinePlayerNumber = myPlayerNumber;
      hideLobby();
      startGame('online');
      break;

    case 'move': {
      // Apply the opponent's move to the local board
      const { boardIndex, cellIndex } = msg;
      if (!window.boards || !window.boards[boardIndex]) return;
      const cell = window.boards[boardIndex].cells[cellIndex];
      // Mark move as remote so game.js won't re-broadcast it
      window._remoteMove = true;
      handleMove(boardIndex, cellIndex, cell);
      window._remoteMove = false;
      break;
    }

    case 'rematch_requested':
      showNotification('Opponent wants a rematch! Click CONTINUE to accept.', 8000);
      // Wire up the continue button to accept rematch
      const continueBtn = document.getElementById('continueButton');
      if (continueBtn) {
        continueBtn.dataset.rematch = 'true';
      }
      break;

    case 'rematch_start':
      myPlayerNumber = msg.playerNumber;
      window.onlinePlayerNumber = myPlayerNumber;
      hideLobby();
      startGame('online');
      showNotification(`Rematch! You are now Player ${myPlayerNumber} (${myPlayerNumber === 1 ? 'X' : 'O'})`, 4000);
      break;

    case 'opponent_disconnected':
      clearWaitTimers();
      showNotification('Opponent disconnected. Create or join a new room.', 6000);
      myPlayerNumber = null;
      showLobby();
      break;

    case 'error':
      showNotification(`Error: ${msg.message}`, 5000);
      break;
  }
}

function setupLobbyUI() {
  // Create lobby overlay if it doesn't already exist
  if (document.getElementById('mp-lobby')) return;

  const lobby = document.createElement('div');
  lobby.id        = 'mp-lobby';
  lobby.className = 'mp-lobby-overlay hidden';
  lobby.innerHTML = `
    <div class="mp-lobby-panel cyber-card">
      <div class="card-corner tl"></div>
      <div class="card-corner tr"></div>
      <div class="card-corner bl"></div>
      <div class="card-corner br"></div>

      <h2 class="mp-title">ONLINE MULTIPLAYER</h2>

      <!-- Step: choose action -->
      <div class="mp-step" id="mp-step-choose">
        <button class="cyber-button" id="mp-create-btn">
          <span class="button-content">CREATE ROOM</span>
        </button>
        <button class="cyber-button" id="mp-join-btn">
          <span class="button-content">JOIN ROOM</span>
        </button>
        <button class="cyber-button mp-back-btn" id="mp-close-btn">
          <span class="button-content">BACK</span>
        </button>
      </div>

      <!-- Step: enter room code to join -->
      <div class="mp-step hidden" id="mp-step-join">
        <label class="mp-label">ENTER ROOM CODE</label>
        <input type="text" id="mp-code-input" class="mp-code-input"
               maxlength="5" placeholder="XXXXX" autocomplete="off">
        <button class="cyber-button" id="mp-join-confirm-btn">
          <span class="button-content">JOIN</span>
        </button>
        <button class="cyber-button mp-back-btn" id="mp-join-back-btn">
          <span class="button-content">BACK</span>
        </button>
      </div>

      <!-- Step: waiting for opponent -->
      <div class="mp-step hidden" id="mp-step-waiting">
        <p class="mp-label">SHARE THIS CODE WITH YOUR OPPONENT</p>
        <div class="mp-room-code" id="mp-room-code-display">-----</div>
        <p class="mp-status">Waiting for opponent to connect…</p>
        <button class="cyber-button" id="mp-play-ai-btn">
          <span class="button-content">PLAY VS AI</span>
        </button>
        <button class="cyber-button mp-back-btn" id="mp-waiting-back-btn">
          <span class="button-content">CANCEL</span>
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(lobby);

  // ── Event listeners ─────────────────────────────────────────────────────
  document.getElementById('mp-create-btn').addEventListener('click', () => {
    connect(() => socket.send(JSON.stringify({ type: 'create' })));
    showLobbyStep('choose'); // will be overridden by server reply
  });

  document.getElementById('mp-join-btn').addEventListener('click', () => {
    showLobbyStep('join');
  });

  document.getElementById('mp-join-confirm-btn').addEventListener('click', () => {
    const code = document.getElementById('mp-code-input').value.trim().toUpperCase();
    if (code.length !== 5) {
      showNotification('Room code must be 5 characters.', 3000);
      return;
    }
    connect(() => socket.send(JSON.stringify({ type: 'join', roomCode: code })));
  });

  // Back / cancel buttons
  document.getElementById('mp-close-btn').addEventListener('click', hideLobby);
  document.getElementById('mp-join-back-btn').addEventListener('click', () => showLobbyStep('choose'));
  document.getElementById('mp-waiting-back-btn').addEventListener('click', () => {
    clearWaitTimers();
    if (socket) { _intentionalClose = true; socket.close(); }
    hideLobby();
  });

  // Play vs AI while waiting
  document.getElementById('mp-play-ai-btn').addEventListener('click', () => {
    clearWaitTimers();
    if (socket) { _intentionalClose = true; socket.close(); }
    hideLobby();
    startGame('ai');
  });

  // Allow Enter key in code input
  document.getElementById('mp-code-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('mp-join-confirm-btn').click();
  });
}

function showLobby() {
  const lobby = document.getElementById('mp-lobby');
  if (lobby) {
    lobby.classList.remove('hidden');
    showLobbyStep('choose');
  }
}

function hideLobby() {
  const lobby = document.getElementById('mp-lobby');
  if (lobby) lobby.classList.add('hidden');
}

function showLobbyStep(step) {
  // step: 'choose' | 'join' | 'waiting-for-opponent'
  const steps = {
    'choose':               'mp-step-choose',
    'join':                 'mp-step-join',
    'waiting-for-opponent': 'mp-step-waiting',
  };
  Object.values(steps).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
  const target = steps[step];
  if (target) {
    const el = document.getElementById(target);
    if (el) el.classList.remove('hidden');
  }
}

// Expose showLobby globally so the ONLINE button in index.html can call it
window.showMultiplayerLobby = showLobby;
