/**
 * Core game logic for Ultimate Tic Tac Toe
 */

import { WIN_PATTERNS } from '../utils/constants.js';
import { placeMarkerWithEffect, showWinner, showNotification } from '../utils/ui.js';
import { updatePlayerUI, updateScoreboard } from './players.js';
import { aiMove } from '../ai/ai.js';
import { glitchElement, applyMajorGlitch } from '../utils/glitchEffects.js';
import { recordAdamSmasherDefeat } from '../../script.js';
import { resetSession, recordMove, finalizeGame } from '../utils/moveTracker.js';

// Lazy import for multiplayer send helper (avoids circular deps)
let _sendMove = null;
function importMultiplayer() {
  if (_sendMove) return;
  import('../multiplayer/client.js').then(m => { _sendMove = m.sendMove; }).catch(() => {});
}
importMultiplayer();

// DOM element references
const mainBoard = document.getElementById('mainBoard');
const scoreboard = document.getElementById('scoreboard');
const winnerDisplay = document.getElementById('winner-display');
const modeSelector = document.getElementById('modeSelector');
const playersSetup = document.getElementById('players-setup');
const controls = document.getElementById('controls');
const glitchOverlay = document.querySelector('.glitch-overlay');
const aiDifficultySelector = document.getElementById('aiDifficultySelector');

// Start the game with the selected mode
export function startGame(mode) {
  // Get player names from input fields and apply any manual changes
  const player1Input = document.getElementById('player1Name');
  const player2Input = document.getElementById('player2Name');
  
  // Only update if user has manually changed the name
  if (player1Input && player1Input.value.trim()) {
    window.player1Name = player1Input.value.trim();
  }
  
  // Set up AI mode or handle human opponent
  if (mode === 'ai') {
    // Map the selected AI bot to the proper character names and avatars
    const aiAvatars = {
      'royce': { name: 'Royce', avatar: 'royce', character: 'royce' },
      'goro': { name: 'Goro', avatar: 'goro', character: 'goro' },
      'adamSmasher': { name: 'Adam Smasher', avatar: 'adam', character: 'adam' },
      'aayushAcharya': { name: 'The Architect', avatar: 'aayush', character: 'aayush' }
    };
    
    // Get the selected AI from the window variable
    const selectedAI = window.selectedAIBot || 'adamSmasher';
    const aiData = aiAvatars[selectedAI] || aiAvatars.adamSmasher;
    
    // Set the AI player data
    window.player2Name = aiData.name;
    window.player2Avatar = aiData.avatar;
    window.player2Character = aiData.character;
    
    // Update the side avatar with the correct AI image
    const sideAvatar2 = document.getElementById('sideAvatar2');
    if (sideAvatar2) {
      sideAvatar2.src = `assets/ai/${aiData.avatar}.png`;
    }
    
    // Show AI dialogue box only for The Architect
    const aiDialogue = document.getElementById('ai-dialogue');
    if (aiDialogue) {
      aiDialogue.style.display = selectedAI === 'aayushAcharya' ? 'block' : 'none';
    }
  } else if (mode === 'online') {
    // Online multiplayer — player number is set by the WebSocket client
    const playerNum = window.onlinePlayerNumber || 1;
    window.player2Name = `Player ${playerNum === 1 ? 2 : 1}`;
    showNotification(
      playerNum === 1
        ? 'You are X — make the first move!'
        : "You are O — waiting for opponent's first move…",
      4000
    );
  } else {
    // Only update player 2 name if user has manually changed it
    if (player2Input && player2Input.value.trim()) {
      window.player2Name = player2Input.value.trim();
    }
  }
  
  // Check if we need to disable animations
  window.disableWinAnimation = window.player1Name.toLowerCase() === 'aayush';
  
  window.gameMode = mode;
  window.gameInProgress = true;
  
  // Hide setup elements, show game elements
  if (playersSetup) playersSetup.style.display = 'none';
  if (modeSelector) modeSelector.style.display = 'none';
  if (controls) controls.style.display = 'none';
  
  // Make sure game layout is visible first
  const gameLayout = document.getElementById('gameLayout');
  if (gameLayout) gameLayout.style.display = 'flex';
  
  if (mainBoard) mainBoard.style.display = 'grid';
  
  // Show a temporary notification about audio status
  if (window.audioSystem && window.audioSystem.dummyAudioEnabled) {
    showNotification("Audio files not found, game will run silently", 5000);
  }
  
  // Initialize UI first, then reset game
  updatePlayerUI();
  
  // Update side panels with player names and records
  updateScoreboard();
  
  // Reset the game board
  resetSession(mode);
  resetGame();
  
  // Play UI sounds
  if (window.audioSystem) {
    window.audioSystem.playSound('ui', 'click');
    window.audioSystem.playMusic('gameplay');
  }
}

// Reset the game board
export function resetGame() {
  window.currentPlayer = 'X';
  window.nextBoard = -1;
  window.boardWinners = Array(9).fill('');
  mainBoard.innerHTML = '';
  window.boards = [];
  winnerDisplay.style.display = 'none';

  // Create the game board with cyberpunk styling
  for (let i = 0; i < 9; i++) {
    const mini = document.createElement('div');
    mini.className = 'mini-board';
    mini.dataset.board = i;
    
    // Make sure there are no leftover symbols from previous games
    const oldSymbol = mini.querySelector('.giant-symbol');
    if (oldSymbol) {
      oldSymbol.remove();
    }
    
    const cells = [];
    
    for (let j = 0; j < 9; j++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.index = j;
      cell.onclick = () => handleMove(i, j, cell);
      mini.appendChild(cell);
      cells.push(cell);
    }
    
    window.boards.push({ element: mini, cells, winner: '' });
    mainBoard.appendChild(mini);
  }
  
  updateHighlight();
}

// Emergency reset - bypasses normal game flow to reset everything
export function emergencyReset() {
  // Reset all game state
  window.gameMode = 'ai';
  window.currentPlayer = 'X';
  window.nextBoard = -1;
  window.boards = [];
  window.boardWinners = Array(9).fill('');
  window.gameInProgress = true;
  
  // Clear DOM elements
  mainBoard.innerHTML = '';
  
  // Show the proper UI elements
  controls.style.display = 'none';
  winnerDisplay.style.display = 'none';
  mainBoard.style.display = 'grid';
  playersSetup.style.display = 'flex';
  modeSelector.style.display = 'flex';
  
  // Play UI sound
  if (window.audioSystem) {
    window.audioSystem.playSound('ui', 'click');
  }
  
  // Update scoreboard
  updateScoreboard();
}

// Handle player move
export function handleMove(bi, ci, cell) {
  // Extra error check to prevent race conditions
  if (!cell || cell.parentNode === null) {
    console.error("Invalid cell reference in handleMove", bi, ci);
    return;
  }

  // Add more detailed debugging info
  // More robust check for valid move
  if (!window.gameInProgress) {
    if (window.audioSystem) {
      window.audioSystem.playSound('ui', 'invalid');
    }
    return;
  }

  // ── Online mode: block moves on wrong turn (unless this is a relayed remote move) ──
  if (window.gameMode === 'online' && !window._remoteMove) {
    const myNum = window.onlinePlayerNumber || 1;
    const mySymbol = myNum === 1 ? 'X' : 'O';
    if (window.currentPlayer !== mySymbol) {
      showNotification("Wait for your opponent's move.", 2000);
      return;
    }
  }

  // Check if the board is already won
  if (window.boardWinners[bi]) {
    if (window.audioSystem) {
      window.audioSystem.playSound('ui', 'invalid');
    }
    return;
  }

  // Check if the cell is already occupied
  if (cell.textContent) {
    if (window.audioSystem) {
      window.audioSystem.playSound('ui', 'invalid');
    }
    return;
  }

  // Check if we're playing on the correct board
  if (window.nextBoard !== -1 && bi !== window.nextBoard) {
    if (window.audioSystem) {
      window.audioSystem.playSound('ui', 'invalid');
    }
    return;
  }

  // ── Online mode: broadcast this local move to the server (before state changes) ──
  if (window.gameMode === 'online' && !window._remoteMove && _sendMove) {
    _sendMove(bi, ci);
  }
  // Place marker with animation effect
  placeMarkerWithEffect(cell, window.currentPlayer);
  recordMove(window.currentPlayer, bi, ci, window.boardWinners, window.nextBoard);
  
  // Store the player who made this move to verify win attribution
  const playerWhoMoved = window.currentPlayer;
  
  // Calculate next board immediately (before any async operations)
  let nextBoardTarget = window.boardWinners[ci] ? -1 : ci;
  
  // Check if the target board is already won or full to allow free move
  if (nextBoardTarget !== -1) {
    const targetBoard = window.boards[nextBoardTarget];
    const isBoardWon = window.boardWinners[nextBoardTarget];
    const isBoardFull = targetBoard.cells.every(c => c.textContent);
    
    if (isBoardWon || isBoardFull) {
      nextBoardTarget = -1; // Allow free move
    }
  }
  
  // Handle board win logic
  let boardWon = false;
  let gameWon = false;
  
  if (checkMiniWin(window.boards[bi], playerWhoMoved)) {
    boardWon = true;
    
    // Process the board win and check if it resulted in a game win
    gameWon = handleBoardWin(bi, playerWhoMoved);
    
    if (gameWon) {
      return; // Game over, no need to continue
    }
  } else if (window.boards[bi].cells.every(c => c.textContent)) {
    window.boardWinners[bi] = 'D';
    
    // Add visual indication of draw
    window.boards[bi].element.classList.add('draw');
    
    // Add a draw symbol to show this mini-board is a draw
    const existingSymbol = window.boards[bi].element.querySelector('.giant-symbol');
    if (existingSymbol) {
      existingSymbol.remove();
    }
    
    const drawSymbol = document.createElement('div');
    drawSymbol.className = 'giant-symbol draw';
    drawSymbol.textContent = '=';
    window.boards[bi].element.appendChild(drawSymbol);
    
    // Play draw sound for mini-board
    if (window.audioSystem) {
      window.audioSystem.playSound('gameplay', 'smallDraw');
    }
  }

  // Set next board immediately
  window.nextBoard = nextBoardTarget;
  // Check for draw
  if (checkForDraw()) {
    return; // Game is a draw, no need to continue
  }

  // Only switch player and proceed if game isn't won
  if (!gameWon) {
    // Switch to next player
    window.currentPlayer = window.currentPlayer === 'X' ? 'O' : 'X';
    // Update UI with highlight effects immediately to avoid race conditions
    updateHighlight();
    
    // Only make AI move if the game is still in progress
    if (window.gameMode === 'ai' && window.currentPlayer === 'O' && window.gameInProgress) {
      setTimeout(aiMove, 700); // Longer delay for AI moves to build anticipation
    }
  }

  // Update player indicators after move
  updatePlayerUI();
}

// Check if a mini-board is won
export function checkMiniWin(board, p) {
  const g = board.cells.map(c => c.textContent);
  const win = WIN_PATTERNS;
  const hasWin = win.some(line => line.every(i => g[i] === p));
  
  if (hasWin) {
  }
  
  return hasWin;
}

// Check if the full game is won
export function checkGameWin(p) {
  // Count how many boards each player has won
  const xWins = window.boardWinners.filter(winner => winner === 'X').length;
  const oWins = window.boardWinners.filter(winner => winner === 'O').length;
  const w = window.boardWinners;
  const win = WIN_PATTERNS;
  
  // Check each winning line
  for (let i = 0; i < win.length; i++) {
    const line = win[i];
    const boardsInLine = [w[line[0]], w[line[1]], w[line[2]]];
    if (line.every(i => w[i] === p)) {
      return true;
    }
  }
  
  // If no winning line is found, the game continues
  return false;
}

// Handle board win logic with properly updated records
export function handleBoardWin(boardIndex, player) {
  // Make changes to the board immediately
  window.boards[boardIndex].element.classList.add('won');
  
  // Clear previous player-specific classes
  window.boards[boardIndex].element.classList.remove('won-x', 'won-o');
  
  // Add player-specific class for styling
  window.boards[boardIndex].element.classList.add(player === 'X' ? 'won-x' : 'won-o');
  
  // Store the winner
  window.boardWinners[boardIndex] = player;
  
  // Add the giant symbol to show who won this mini-board
  const existingSymbol = window.boards[boardIndex].element.querySelector('.giant-symbol');
  if (existingSymbol) {
    existingSymbol.remove();
  }
  
  const giantSymbol = document.createElement('div');
  giantSymbol.className = `giant-symbol ${player}`;
  giantSymbol.textContent = player;
  window.boards[boardIndex].element.appendChild(giantSymbol);
  
  // Apply glitch effect to the board that was won
  glitchElement(window.boards[boardIndex].element);
  
  // Play board win sound
  if (window.audioSystem) {
    window.audioSystem.playBoardWinSound();
  }
  
  // Check for game win
  if (checkGameWin(player)) {
    const winner = player === 'X' ? window.player1Name : window.player2Name;
    const loser = player === 'X' ? window.player2Name : window.player1Name;
    
    // Apply major glitch effect for game win
    applyMajorGlitch();
    
    // Update records (win for one is loss for other)
    if (player === 'X') {
      window.player1Record[0]++; // Add win for player 1
      window.player2Record[1]++; // Add loss for player 2
      
      // Check if player defeated Adam Smasher
      if (window.gameMode === 'ai' && loser === 'Adam Smasher') {
        recordAdamSmasherDefeat(winner, loser);
      }
    } else {
      window.player2Record[0]++; // Add win for player 2
      window.player1Record[1]++; // Add loss for player 1
    }
    
    // Johnny Silverhand effect (random chance)
    if (Math.random() < window.johnnySilverlandChance) {
      if (window.audioSystem) {
        window.audioSystem.playJohnnySilverlandEffect();
      }
    }
    
    // Show winner animation
    showWinner(winner, player);
    
    window.score[player]++;
    updateScoreboard();
    window.gameInProgress = false;
    
    // Make sure controls are displayed
    setTimeout(() => {
      controls.style.display = 'flex';
    }, 500);
    
    // Play game win sound
    if (window.audioSystem) {
      window.audioSystem.playGameWinSound();
    }
    
    finalizeGame(player);
    return true;
  }
  
  return false;
}

// Highlight active boards with cyberpunk effect
export function updateHighlight() {
  // First remove active class from all boards
  window.boards.forEach(b => b.element.classList.remove('active'));
  
  // List of valid boards (not won and not full)
  const validBoards = [];
  // Guard clause: if game isn't in progress, don't highlight anything
  if (!window.gameInProgress) {
    return;
  }
  
  // If nextBoard is -1, highlight all valid boards
  if (window.nextBoard === -1) {
    window.boards.forEach((b, i) => {
      // Only highlight boards that aren't won and aren't full
      const isBoardWon = !!window.boardWinners[i];
      const isBoardFull = b.cells.every(c => c.textContent);
      
      if (!isBoardWon && !isBoardFull) {
        b.element.classList.add('active');
        validBoards.push(i);
      }
    });
  } 
  // Check if the specified next board is valid
  else if (!window.boardWinners[window.nextBoard]) {
    // Check if the board is full
    const isBoardFull = window.boards[window.nextBoard].cells.every(c => c.textContent);
    
    if (isBoardFull) {
      // Board is full, highlight all valid boards instead
      window.nextBoard = -1; // Reset to allow free move
      window.boards.forEach((b, i) => {
        if (!window.boardWinners[i] && !b.cells.every(c => c.textContent)) {
          b.element.classList.add('active');
          validBoards.push(i);
        }
      });
    } else {
      // Board is valid, highlight it
      window.boards[window.nextBoard].element.classList.add('active');
      validBoards.push(window.nextBoard);
    }
  } 
  // The specified board is already won or drawn, allow free move
  else {
    // Reset nextBoard to indicate free move
    window.nextBoard = -1;
    
    // Highlight all valid boards
    window.boards.forEach((b, i) => {
      if (!window.boardWinners[i] && !b.cells.every(c => c.textContent)) {
        b.element.classList.add('active');
        validBoards.push(i);
      }
    });
  }
  
  // Log the active boards for debugging
  // If no valid boards are highlighted, game might be a draw
  if (validBoards.length === 0) {
    checkForDraw();
  }
}

// Check for draw - updated to not reference draw counter in UI
export function checkForDraw() {
  if (window.boardWinners.every(w => w)) {
    // Update records for draw
    window.player1Record[2]++; // Add draw for player 1
    window.player2Record[2]++; // Add draw for player 2
    
    showWinner('DRAW', 'draw');
    window.score.draw++;
    updateScoreboard();
    window.gameInProgress = false;
    
    // Make sure controls are displayed with a delay to ensure they appear
    setTimeout(() => {
      controls.style.display = 'flex';
    }, 500);
    
    // Play draw sound
    if (window.audioSystem) {
      window.audioSystem.playDrawSound();
    }
    
    finalizeGame('draw');
    return true;
  }
  
  return false;
}

// Continue after game ends
export function continueGame() {
  controls.style.display = 'none';
  winnerDisplay.style.display = 'none';
  window.gameInProgress = true;
  
  // Play continue sound
  if (window.audioSystem) {
    window.audioSystem.playSound('ui', 'click');
    window.audioSystem.playMusic('gameplay');
  }
  
  resetGame();
}

// Go back to setup screen
export function backToSetup() {
  controls.style.display = 'none';
  winnerDisplay.style.display = 'none';
  mainBoard.style.display = 'none';
  
  // Hide AI dialogue
  const aiDialogue = document.getElementById('ai-dialogue');
  if (aiDialogue) aiDialogue.style.display = 'none';

  playersSetup.style.display = 'flex';
  modeSelector.style.display = 'flex';
  
  // Reset game state to make sure we start clean
  window.gameInProgress = false;
  window.boardWinners = Array(9).fill('');
  
  // Play UI sound
  if (window.audioSystem) {
    window.audioSystem.playSound('ui', 'click');
  }
} 