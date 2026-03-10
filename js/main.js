/**
 * Ultimate Tic Tac Toe - Night City Edition
 * Main entry point — UI effects, player init, debug tools
 *
 * Avatar/audio/mode handlers moved to ../setup.js
 */

import { initializePlayers, updatePlayerUI, updateScoreboard } from './components/players.js';
import { startGame, resetGame, continueGame, backToSetup, emergencyReset } from './components/game.js';
import { selectAIDifficulty } from './ai/ai.js';
import { createCircuitLines, applyTimedGlitch, showNotification, showMusicInfo } from './utils/ui.js';
import { initRandomGlitches, applyMajorGlitch, glitchElement } from './utils/glitchEffects.js';

// Initialize when page is loaded
document.addEventListener('DOMContentLoaded', function() {
  createCircuitLines();
  setInterval(applyTimedGlitch, 7000);
  initRandomGlitches(10000, 20000);

  // Set background image
  const ambientBg = document.querySelector('.ambient-bg');
  if (ambientBg) ambientBg.style.backgroundImage = "url('assets/images/cyberpunkbg1.png')";

  // Initialize player UI
  initializePlayers();
});

// ─── HIDDEN DEBUG COMMAND ──────────────────────────────────────────────────
// Type: theblueprint()  in the browser console to reveal system diagnostics
window.theblueprint = function() {
  const state = {
    gameInProgress: window.gameInProgress,
    currentPlayer: window.currentPlayer,
    nextBoard: window.nextBoard,
    boardWinners: window.boardWinners ? [...window.boardWinners] : [],
    boards: window.boards ? window.boards.map(b => [...b]) : [],
    player1: { name: window.player1Name, avatar: window.player1Avatar, score: window.player1Score },
    player2: { name: window.player2Name, avatar: window.player2Avatar, score: window.player2Score },
    selectedAI: window.selectedAIBot,
    aiMoveLog: window.aayushMoveLog ? window.aayushMoveLog.slice(-5) : [],
    audioSystem: window.audioSystem ? { music: window.audioSystem.musicEnabled, sfx: window.audioSystem.sfxEnabled } : null,
  };
  console.group('%c[THE BLUEPRINT] System Diagnostics', 'color:#FF2A6D;font-weight:bold;font-size:14px;');
  console.log('%cGame State', 'color:#05D9E8;font-weight:bold;', state);
  if (window.aayushMoveLog && window.aayushMoveLog.length) {
    console.table(window.aayushMoveLog.slice(-10).map(m => ({
      Move: m.move, Action: m.action,
      Board: `(${Math.floor(m.board/3)},${m.board%3})`,
      Cell: `(${Math.floor(m.cell/3)},${m.cell%3})`,
      Score: `${m.score}/10`
    })));
  }
  console.groupEnd();
  return '> Access granted. Night City knows no mercy.';
};

// Export functions for use in other modules
export {
  initializePlayers,
  updatePlayerUI,
  updateScoreboard,
  startGame,
  resetGame,
  continueGame,
  backToSetup,
  emergencyReset,
  selectAIDifficulty,
  createCircuitLines,
  applyTimedGlitch,
  showNotification,
  showMusicInfo,
  initRandomGlitches,
  applyMajorGlitch,
  glitchElement
}; 