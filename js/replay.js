/**
 * Ghost Replay — step-by-step replay of a recorded game.
 * Supports:
 *   • Last game from localStorage (moveTracker.js format)
 *   • window._gameMoveLogs (script.js legacy format)
 *   • Uploaded JSON or CSV file (either format)
 *   • ?replay=BASE64 URL param (shareable link)
 * Exports: startReplay, startLastGameReplay, loadReplayFromFile,
 *          replayTogglePlayPause, replayCycleSpeed, stopReplay,
 *          generateReplayLink
 */

let _state   = null;   // { log, index, paused, boards }
let _timerId = null;

const BASE_MS = 850;
const SPEEDS  = [0.5, 1, 2, 4];
let   _spIdx  = 1;

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Start replaying a raw log object (either moveTracker or legacy format).
 * @param {object} rawLog
 */
export function startReplay(rawLog) {
  const log = _normalize(rawLog);
  if (!log || log.moves.length === 0) {
    _notif('No move data found.'); return;
  }
  _state = { log, index: 0, paused: false, boards: null };
  _showOverlay(log);
  _buildBoard();
  _updateCounter();
  // auto-start
  const btn = document.getElementById('replay-play-pause');
  if (btn) btn.textContent = '⏸';
  _scheduleNext();
}

/** Replay the most recent game. */
export function startLastGameReplay() {
  // 1. moveTracker localStorage
  try {
    const stored = JSON.parse(localStorage.getItem('nct_moves') || '[]');
    if (stored.length > 0) { startReplay(stored[stored.length - 1]); return; }
  } catch { /* fall through */ }

  // 2. script.js game logs
  if (window._gameMoveLogs?.length > 0) {
    startReplay(window._gameMoveLogs[window._gameMoveLogs.length - 1]);
    return;
  }

  _notif('No previous game found. Play a game first!');
}

/** Trigger file-input click for uploading a JSON/CSV move log. */
export function loadReplayFromFile() {
  document.getElementById('replay-file-input')?.click();
}

export function replayTogglePlayPause() {
  if (!_state) { startLastGameReplay(); return; }
  _state.paused ? _play() : _pause();
}

export function replayCycleSpeed() {
  _spIdx = (_spIdx + 1) % SPEEDS.length;
  const lbl = document.getElementById('replay-speed-label');
  if (lbl) lbl.textContent = `${SPEEDS[_spIdx]}×`;
}

export function stopReplay() {
  clearTimeout(_timerId);
  _state = null;
  const overlay = document.getElementById('replay-overlay');
  if (overlay) overlay.classList.add('hidden');
  // Restore setup screen
  const gameLayout   = document.getElementById('gameLayout');
  const playersSetup = document.getElementById('players-setup');
  const controls     = document.getElementById('controls');
  if (gameLayout)   gameLayout.style.display = 'none';
  if (playersSetup) playersSetup.style.display = 'flex';
  if (controls)     controls.style.display = 'none';
  const mb = document.getElementById('mainBoard');
  if (mb) mb.innerHTML = '';
}

/**
 * Generate a shareable ?replay=BASE64 URL for the last game.
 * @returns {string|null} URL or null if no game data
 */
export function generateReplayLink() {
  let raw = null;
  try {
    const stored = JSON.parse(localStorage.getItem('nct_moves') || '[]');
    if (stored.length > 0) raw = stored[stored.length - 1];
  } catch { /* ignore */ }
  if (!raw && window._gameMoveLogs?.length > 0) {
    raw = window._gameMoveLogs[window._gameMoveLogs.length - 1];
  }
  if (!raw) return null;
  try {
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(raw))));
    return `${location.origin}${location.pathname}?replay=${encoded}`;
  } catch { return null; }
}

/** Check URL for ?replay= param and auto-start replay on page load. */
export function checkAutoReplay() {
  const params = new URLSearchParams(location.search);
  const encoded = params.get('replay');
  if (!encoded) return;
  try {
    const raw = JSON.parse(decodeURIComponent(escape(atob(encoded))));
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => setTimeout(() => startReplay(raw), 600));
    } else {
      setTimeout(() => startReplay(raw), 600);
    }
  } catch {
    _notif('Invalid replay link — could not decode move data.');
  }
}

// ── Internal ───────────────────────────────────────────────────────────────
function _play() {
  if (!_state) return;
  _state.paused = false;
  const btn = document.getElementById('replay-play-pause');
  if (btn) btn.textContent = '⏸';
  _scheduleNext();
}

function _pause() {
  clearTimeout(_timerId);
  if (!_state) return;
  _state.paused = true;
  const btn = document.getElementById('replay-play-pause');
  if (btn) btn.textContent = '▶';
}

function _scheduleNext() {
  if (!_state || _state.paused) return;
  _timerId = setTimeout(() => {
    _step();
    if (_state && !_state.paused) _scheduleNext();
  }, BASE_MS / SPEEDS[_spIdx]);
}

function _step() {
  if (!_state) return;
  const { log, index, boards } = _state;
  if (index >= log.moves.length) {
    _pause();
    const cnt = document.getElementById('replay-move-counter');
    if (cnt) cnt.textContent = `${log.moves.length} / ${log.moves.length} — DONE`;
    return;
  }

  const mv   = log.moves[index];
  const cell = boards[mv.board]?.cells[mv.cell];
  if (cell) {
    cell.textContent = mv.marker;
    cell.className   = `cell player-${mv.marker.toLowerCase()} pop`;
    setTimeout(() => cell.classList.remove('pop'), 320);
  }

  _state.index++;
  _updateCounter();
}

function _buildBoard() {
  if (!_state) return;
  const mb = document.getElementById('mainBoard');
  if (!mb) return;
  mb.innerHTML   = '';
  mb.style.display = 'grid';

  const boards = [];
  for (let i = 0; i < 9; i++) {
    const mini = document.createElement('div');
    mini.className    = 'mini-board';
    mini.dataset.board = i;
    const cells = [];
    for (let j = 0; j < 9; j++) {
      const cell = document.createElement('div');
      cell.className    = 'cell';
      cell.dataset.index = j;
      mini.appendChild(cell);
      cells.push(cell);
    }
    boards.push({ element: mini, cells });
    mb.appendChild(mini);
  }
  _state.boards = boards;
}

function _showOverlay(log) {
  const overlay = document.getElementById('replay-overlay');
  if (!overlay) return;

  const modeEl   = overlay.querySelector('#replay-mode');
  const winnerEl = overlay.querySelector('#replay-winner');
  if (modeEl)   modeEl.textContent   = (log.mode || 'GAME').toUpperCase();
  if (winnerEl) winnerEl.textContent = log.winner ? `WINNER: ${log.winner}` : 'DRAW';

  const lbl = document.getElementById('replay-speed-label');
  if (lbl) lbl.textContent = `${SPEEDS[_spIdx]}×`;

  overlay.classList.remove('hidden');

  // Show game layout, hide setup
  const gameLayout   = document.getElementById('gameLayout');
  const playersSetup = document.getElementById('players-setup');
  const controls     = document.getElementById('controls');
  const wd           = document.getElementById('winner-display');
  if (gameLayout)   gameLayout.style.display   = 'flex';
  if (playersSetup) playersSetup.style.display = 'none';
  if (controls)     controls.style.display     = 'none';
  if (wd)           wd.style.display           = 'none';
}

function _updateCounter() {
  const el = document.getElementById('replay-move-counter');
  if (!_state || !el) return;
  el.textContent = `${_state.index} / ${_state.log.moves.length}`;
}

// ── Log Normalisation ──────────────────────────────────────────────────────
// Internal unified format: { mode, winner, moves: [{board, cell, marker}] }

function _normalize(raw) {
  if (!raw) return null;

  // moveTracker.js: { id, mode, w, mv: [{p, b, c, ...}] }
  if (Array.isArray(raw.mv)) {
    return {
      mode:   raw.mode   || 'game',
      winner: raw.w      || null,
      moves:  raw.mv.map(m => ({ board: m.b, cell: m.c, marker: m.p })),
    };
  }

  // script.js legacy: { player1, player2, winner, moves: [{boardIndex, cellIndex, marker}] }
  if (Array.isArray(raw.moves)) {
    return {
      mode:   raw.mode   || 'human',
      winner: raw.winner || null,
      moves:  raw.moves.map(m => ({
        board:  m.boardIndex ?? m.board,
        cell:   m.cellIndex  ?? m.cell,
        marker: m.marker     || m.p,
      })),
    };
  }
  return null;
}

function _parseCSV(csv) {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return null;

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const row  = {};
    headers.forEach((h, j) => { row[h] = (cols[j] || '').trim(); });
    rows.push(row);
  }

  // Detect which CSV flavour by checking headers
  if (headers.includes('board') && headers.includes('cell') && headers.includes('player')) {
    // moveTracker.js CSV: gameId,mode,winner,player,board,cell,thinkMs,moveNum
    let winner = '';
    const moves = rows.map(r => {
      winner = r.winner || winner;
      return { board: +r.board, cell: +r.cell, marker: r.player };
    });
    return { mode: rows[0]?.mode || 'game', winner, moves };
  }

  // script.js CSV: Game ID,Player 1,Player 2,Move Number,Player,Board,Cell,Marker,Timestamp
  const moves = rows.map(r => ({
    board:  parseInt(r.board),
    cell:   parseInt(r.cell),
    marker: r.marker || r.player,
  }));
  return { mode: 'human', winner: rows[rows.length - 1]?.winner || '', moves };
}

function _handleFileLoad(event) {
  const file = event.target.files[0];
  if (!file) return;
  event.target.value = ''; // allow re-upload of same file
  const reader = new FileReader();
  reader.onload = e => {
    try {
      let data;
      if (file.name.toLowerCase().endsWith('.csv')) {
        data = _parseCSV(e.target.result);
      } else {
        const parsed = JSON.parse(e.target.result);
        data = Array.isArray(parsed) ? parsed[parsed.length - 1] : parsed;
      }
      if (!data) { _notif('Unrecognised replay format.'); return; }
      startReplay(data);
    } catch { _notif('Failed to parse replay file.'); }
  };
  reader.readAsText(file);
}

function _notif(msg) {
  if (typeof window.showNotification === 'function') window.showNotification(msg, 3000);
  else console.warn('[Replay]', msg);
}

// ── Wire DOM listeners on load ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('replay-file-input')  ?.addEventListener('change', _handleFileLoad);
  document.getElementById('replay-play-pause')  ?.addEventListener('click',  replayTogglePlayPause);
  document.getElementById('replay-speed-btn')   ?.addEventListener('click',  replayCycleSpeed);
  document.getElementById('replay-close')       ?.addEventListener('click',  stopReplay);
  document.getElementById('replay-last-game')   ?.addEventListener('click',  startLastGameReplay);
  document.getElementById('replay-upload-btn')  ?.addEventListener('click',  loadReplayFromFile);
  document.getElementById('replayBtn')          ?.addEventListener('click',  startLastGameReplay);
  document.getElementById('replayShareBtn')     ?.addEventListener('click',  () => {
    const url = generateReplayLink();
    if (!url) { _notif('Play a game first to generate a replay link!'); return; }
    navigator.clipboard?.writeText(url).then(() => _notif('Replay link copied to clipboard!')).catch(() => {
      prompt('Copy this replay link:', url);
    });
  });

  // Auto-replay from URL ?replay= param
  checkAutoReplay();
});
