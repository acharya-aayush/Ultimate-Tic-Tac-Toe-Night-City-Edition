/**
 * Setup Screen Controller
 * Handles all setup-screen interactions: mode switching, avatar selection,
 * JACK IN / AI selection, audio controls, and export dialog.
 *
 * Extracted from index.html inline <script> to keep the HTML clean.
 */

import { showAIDialogue } from './ai/dialogues.js';
import { setTimedMode } from './timer.js';
import { initTournament, hideTournamentBracket, closeBountyPoster } from './tournament.js';

// ── State ────────────────────────────────────────────────────────────────────
let currentMode = 'human'; // 'human' | 'ai'

export function getCurrentMode() { return currentMode; }

// ── Mode switching ───────────────────────────────────────────────────────────
function setActiveMode(mode) {
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('selected-mode'));
  const btnId = mode === 'human' ? 'humanGameButton' : mode === 'ai' ? 'aiGameButton' : null;
  if (btnId) {
    const btn = document.getElementById(btnId);
    if (btn) btn.classList.add('selected-mode');
  }

  const p2Card  = document.getElementById('p2Card');
  const aiPanel = document.getElementById('aiSelectorPanel');
  const jackIn  = document.getElementById('jackInBtn');

  if (mode === 'human') {
    if (p2Card)  p2Card.style.display  = '';
    if (aiPanel) aiPanel.style.display = 'none';
    if (jackIn)  jackIn.style.display  = '';
  } else if (mode === 'ai') {
    if (p2Card)  p2Card.style.display  = 'none';
    if (aiPanel) aiPanel.style.display = '';
    if (jackIn)  jackIn.style.display  = 'none';
  }
  currentMode = mode;
  window._currentMode = mode;
}

// ── Avatar selection ─────────────────────────────────────────────────────────
function handleAvatarClick(button) {
  const player = button.dataset.player;
  const avatar = button.dataset.avatar;
  const characterName = button.dataset.name || (window.characterNames ? window.characterNames[avatar] : '');

  if (player === '1') {
    window.player1Avatar = avatar;
    window.player1Character = avatar;
    window.player1Name = characterName;

    const preview = document.getElementById('player1AvatarPreview');
    if (preview) preview.src = window.avatarPaths ? window.avatarPaths[avatar] : '';
    const nameInput = document.getElementById('player1Name');
    if (nameInput) nameInput.value = characterName;

    const playerImage = preview ? preview.closest('.player-image') : null;
    if (playerImage) {
      playerImage.classList.add('selected');
      setTimeout(() => playerImage.classList.remove('selected'), 500);
    }
  } else if (player === '2') {
    window.player2Avatar = avatar;
    window.player2Character = avatar;
    window.player2Name = characterName;

    const preview = document.getElementById('player2AvatarPreview');
    if (preview) preview.src = window.avatarPaths ? window.avatarPaths[avatar] : '';
    const nameInput = document.getElementById('player2Name');
    if (nameInput) nameInput.value = characterName;

    const playerImage = preview ? preview.closest('.player-image') : null;
    if (playerImage) {
      playerImage.classList.add('selected');
      setTimeout(() => playerImage.classList.remove('selected'), 500);
    }
  }

  // Mark active in its group
  document.querySelectorAll(`.avatar-button[data-player="${player}"]`).forEach(btn => {
    btn.classList.remove('active');
  });
  button.classList.add('active');

  if (window.audioSystem) window.audioSystem.playSound('ui', 'click');
}

// ── Move-log export helpers ──────────────────────────────────────────────────
function updateMoveLogPreview() {
  const el = document.getElementById('moveLogPreview');
  if (!el) return;

  // Prefer the structured game-move logs from script.js
  if (window._gameMoveLogs && window._gameMoveLogs.length) {
    const last = window._gameMoveLogs[window._gameMoveLogs.length - 1];
    let txt = `${last.player1} vs ${last.player2}\nWinner: ${last.winner || 'In progress'}\n\n`;
    const moves = last.moves;
    const start = Math.max(0, moves.length - 5);
    for (let i = start; i < moves.length; i++) {
      const m = moves[i];
      txt += `Move ${m.moveNumber}: ${m.playerName}\n`;
      txt += `Board (${Math.floor(m.boardIndex / 3)},${m.boardIndex % 3}) `;
      txt += `Cell (${Math.floor(m.cellIndex / 3)},${m.cellIndex % 3})\n`;
      txt += `Marker: ${m.marker}\n\n`;
    }
    el.textContent = txt;
    return;
  }

  // Fallback: Aayush AI internal log
  if (window.aayushMoveLog && window.aayushMoveLog.length) {
    const logs = window.aayushMoveLog;
    const start = Math.max(0, logs.length - 5);
    let txt = '';
    for (let i = start; i < logs.length; i++) {
      const m = logs[i];
      txt += `Move ${m.move}: ${m.action}\n`;
      txt += `Board (${Math.floor(m.board / 3)},${m.board % 3}) `;
      txt += `Cell (${Math.floor(m.cell / 3)},${m.cell % 3})\n`;
      txt += `Score: ${m.score}\n\n`;
    }
    el.textContent = txt;
    return;
  }

  el.textContent = 'No move data yet.\nPlay a game to generate data.';
}

function downloadFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Master init (call once from script.js DOMContentLoaded) ──────────────────
export function initSetupScreen() {
  // ---- Mode buttons ----
  const humanBtn  = document.getElementById('humanGameButton');
  const aiBtn     = document.getElementById('aiGameButton');
  const onlineBtn = document.getElementById('onlineGameButton');
  const jackInBtn = document.getElementById('jackInBtn');

  if (humanBtn) {
    humanBtn.addEventListener('click', () => {
      setActiveMode('human');
      if (window.audioSystem) window.audioSystem.playSound('ui', 'click');
    });
  }
  if (aiBtn) {
    aiBtn.addEventListener('click', () => {
      setActiveMode('ai');
      if (window.audioSystem) window.audioSystem.playSound('ui', 'click');
    });
  }
  if (onlineBtn) {
    onlineBtn.addEventListener('click', () => {
      if (window.showMultiplayerLobby) window.showMultiplayerLobby();
      if (window.audioSystem) window.audioSystem.playSound('ui', 'click');
    });
  }
  if (jackInBtn) {
    jackInBtn.addEventListener('click', () => {
      if (typeof window.startGame === 'function') window.startGame('human');
      if (window.audioSystem) window.audioSystem.playSound('ui', 'click');
    });
  }

  // ---- Game-end control buttons ----
  const continueBtn = document.getElementById('continueButton');
  const newMatchBtn = document.getElementById('newMatchButton');
  const resetBtn    = document.getElementById('emergencyReset');

  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      if (typeof window.continueGame === 'function') window.continueGame();
    });
  }
  if (newMatchBtn) {
    newMatchBtn.addEventListener('click', () => {
      if (typeof window.backToSetup === 'function') window.backToSetup();
    });
  }
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (typeof window.emergencyReset === 'function') window.emergencyReset();
    });
  }

  // ---- Audio buttons ----
  const nextTrackBtn  = document.getElementById('nextTrack');
  const toggleMusicBtn = document.getElementById('toggleMusic');
  const toggleSfxBtn   = document.getElementById('toggleSfx');

  if (nextTrackBtn) {
    nextTrackBtn.addEventListener('click', () => {
      if (typeof window.nextTrack === 'function') window.nextTrack();
    });
  }
  if (toggleMusicBtn) {
    toggleMusicBtn.addEventListener('click', () => {
      if (typeof window.toggleMusic === 'function') window.toggleMusic();
    });
  }
  if (toggleSfxBtn) {
    toggleSfxBtn.addEventListener('click', () => {
      if (typeof window.toggleSFX === 'function') window.toggleSFX();
    });
  }

  // ---- Export dialog ----
  const exportBtn = document.getElementById('exportMoveLog');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const dialog = document.getElementById('moveLogDialog');
      if (dialog) {
        updateMoveLogPreview();
        dialog.style.display = 'flex';
      }
      if (window.audioSystem) window.audioSystem.playSound('ui', 'click');
    });
  }
  const exportJSON = document.getElementById('exportJSON');
  const exportCSV  = document.getElementById('exportCSV');
  if (exportJSON) {
    exportJSON.addEventListener('click', () => {
      if (window.downloadMoveLog) {
        window.downloadMoveLog('json');
      }
      const dialog = document.getElementById('moveLogDialog');
      if (dialog) dialog.style.display = 'none';
    });
  }
  if (exportCSV) {
    exportCSV.addEventListener('click', () => {
      if (window.downloadMoveLog) {
        window.downloadMoveLog('csv');
      }
      const dialog = document.getElementById('moveLogDialog');
      if (dialog) dialog.style.display = 'none';
    });
  }
  const closeDialogBtn = document.querySelector('#moveLogDialog .close-button');
  if (closeDialogBtn) {
    closeDialogBtn.addEventListener('click', () => {
      document.getElementById('moveLogDialog').style.display = 'none';
    });
  }

  // ---- Avatar buttons (P1 & P2 character select) ----
  document.querySelectorAll('.avatar-button:not(.ai-option)').forEach(btn => {
    btn.addEventListener('click', function () { handleAvatarClick(this); });
  });

  // Auto-select defaults after a tick so constants are ready
  setTimeout(() => {
    const p1Default = document.querySelector('.avatar-button[data-player="1"][data-avatar="johnny1"]');
    const p2Default = document.querySelector('.avatar-button[data-player="2"][data-avatar="lucy2"]');
    if (p1Default) { p1Default.classList.add('active'); p1Default.click(); }
    if (p2Default) { p2Default.classList.add('active'); p2Default.click(); }
  }, 200);

  // ---- AI opponent selection (right panel) ----
  document.querySelectorAll('.ai-option').forEach(btn => {
    btn.addEventListener('click', function () {
      if (this.classList.contains('locked')) return;

      document.querySelectorAll('.ai-option').forEach(b => b.classList.remove('selected', 'active'));
      this.classList.add('selected', 'active');

      const aiImg  = this.dataset.img;
      const aiName = this.dataset.name;
      const preview = document.getElementById('aiAvatarPreview');
      const nameEl  = document.getElementById('aiSelectedName');
      if (preview && aiImg) preview.src = aiImg;
      if (nameEl && aiName) nameEl.textContent = aiName.toUpperCase();

      if (preview) {
        const pi = preview.closest('.player-image');
        if (pi) { pi.classList.add('selected'); setTimeout(() => pi.classList.remove('selected'), 500); }
      }

      const difficulty = this.dataset.difficulty || 'hard';
      const aiDiffInput = document.getElementById('aiDifficultySelector');
      if (aiDiffInput) aiDiffInput.value = difficulty;

      if (window.audioSystem) window.audioSystem.playSound('ui', 'click');

      // Start game with selected AI
      if (typeof window.selectAIDifficulty === 'function') {
        window.selectAIDifficulty(difficulty);
      }
    });
  });

  // Expose mode setter to window so game.js backToSetup can reset
  window._setActiveMode = setActiveMode;
}
