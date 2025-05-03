/**
 * Ultimate Tic Tac Toe - Night City Edition
 * Main Script File
 */

// Prevent ServiceWorker errors
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register = function() {
    return Promise.reject(new Error("ServiceWorker disabled"));
  };
}

// Import modules
import { initGlobalState } from './js/utils/constants.js';
import { startGame, continueGame, backToSetup, emergencyReset } from './js/components/game.js';
import { selectAIDifficulty } from './js/ai/ai.js';
import { createCircuitLines, showMusicInfo } from './js/utils/ui.js';
import * as mainModule from './js/main.js';

// Track initialization to prevent doubles
let isInitialized = false;

// Add this after the imports
let gameMoveLogs = [];
let currentGameLog = null;

let unlockClickCount = 0;
let unlockAudio = null;
let bgMusic = null;

/**
 * Initialize a new game log
 * @param {string} player1Name - Name of player 1
 * @param {string} player2Name - Name of player 2
 */
export function initializeGameLog(player1Name, player2Name) {
  currentGameLog = {
    gameId: Date.now(),
    player1: player1Name,
    player2: player2Name,
    moves: [],
    startTime: new Date().toISOString(),
    endTime: null,
    winner: null
  };
}

/**
 * Log a move in the current game
 * @param {string} playerName - Name of the player making the move
 * @param {number} boardIndex - Index of the board where move was made
 * @param {number} cellIndex - Index of the cell where move was made
 * @param {string} marker - X or O
 */
export function logMove(playerName, boardIndex, cellIndex, marker) {
  if (!currentGameLog) return;
  
  currentGameLog.moves.push({
    playerName,
    boardIndex,
    cellIndex,
    marker,
    timestamp: new Date().toISOString(),
    moveNumber: currentGameLog.moves.length + 1
  });
}

/**
 * End the current game log and save it
 * @param {string} winner - Name of the winning player
 */
export function finalizeGameLog(winner) {
  if (!currentGameLog) return;
  
  currentGameLog.endTime = new Date().toISOString();
  currentGameLog.winner = winner;
  gameMoveLogs.push({...currentGameLog});
  currentGameLog = null;
}

/**
 * Download the move logs in specified format
 * @param {string} format - 'json' or 'csv'
 */
function downloadMoveLog(format) {
  if (gameMoveLogs.length === 0) {
    alert('No game data available yet. Play some games first!');
    return;
  }

  let content = '';
  let filename = `tictactoe_moves_${new Date().toISOString().split('T')[0]}`;

  if (format === 'json') {
    content = JSON.stringify(gameMoveLogs, null, 2);
    filename += '.json';
  } else if (format === 'csv') {
    // CSV Header
    content = 'Game ID,Player 1,Player 2,Move Number,Player,Board,Cell,Marker,Timestamp\n';
    
    // Add each move to CSV
    gameMoveLogs.forEach(game => {
      game.moves.forEach(move => {
        content += `${game.gameId},${game.player1},${game.player2},${move.moveNumber},${move.playerName},${move.boardIndex},${move.cellIndex},${move.marker},${move.timestamp}\n`;
      });
    });
    filename += '.csv';
  }

  // Create and trigger download
  const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Update the move log preview function
function updateMoveLogPreview() {
  const previewElement = document.getElementById('moveLogPreview');
  if (!previewElement || gameMoveLogs.length === 0) {
    if (previewElement) {
      previewElement.textContent = "No game data available yet.\nPlay some games to generate move data.";
    }
    return;
  }

  let previewContent = '';
  // Show the last game's moves
  const lastGame = gameMoveLogs[gameMoveLogs.length - 1];
  
  previewContent += `${lastGame.player1} vs ${lastGame.player2}\n`;
  previewContent += `Winner: ${lastGame.winner || 'Game in progress'}\n\n`;
  
  // Show the last 5 moves or all if less than 5
  const moves = lastGame.moves;
  const startIndex = Math.max(0, moves.length - 5);
  
  for (let i = startIndex; i < moves.length; i++) {
    const move = moves[i];
    const boardPos = `(${Math.floor(move.boardIndex / 3)},${move.boardIndex % 3})`;
    const cellPos = `(${Math.floor(move.cellIndex / 3)},${move.cellIndex % 3})`;
    
    previewContent += `Move ${move.moveNumber}: ${move.playerName}\n`;
    previewContent += `Board ${boardPos} Cell ${cellPos}\n`;
    previewContent += `Marker: ${move.marker}\n\n`;
  }
  
  previewElement.textContent = previewContent;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  // Prevent double initialization
  if (isInitialized) return;
  isInitialized = true;
  
  console.log('DOM fully loaded. Initializing game...');
  
  // Always start with Aayush locked regardless of localStorage
  hideAayushInitially();
  
  // Initialize global state
  initGlobalState();
  console.log('Global state initialized');
  
  // Initialize audio on first user interaction (needed for browsers)
  initAudioOnInteraction();
  
  // Expose functions to window object for HTML event handlers
  window.startGame = startGame;
  window.continueGame = continueGame;
  window.backToSetup = backToSetup;
  window.emergencyReset = emergencyReset;
  window.selectAIDifficulty = selectAIDifficulty;
  window.showMusicInfo = showMusicInfo;
  
  // Initialize Aayush AI unlock feature
  initAayushUnlock();
  
  // Check if Aayush AI is already unlocked (respecting session-only unlock)
  checkAayushUnlockStatus();
  
  // Call the module load handler
  if (typeof window.handleModuleLoad === 'function') {
    window.handleModuleLoad();
  }
  
  console.log('Game functions exposed to global scope');
  
  updateCharacterSelection();
  
  // Initialize background music
  bgMusic = new Audio('sounds/background.mp3');
  bgMusic.loop = true;
  
  // Add click handler for Aayush character if locked
  document.querySelectorAll('.character-option[data-character="aayush"]').forEach(option => {
    option.addEventListener('click', (e) => {
      if (option.classList.contains('locked')) {
        playUnlockAnimation();
      }
    });
  });
});

// Function to initialize audio playback on user interaction
function initAudioOnInteraction() {
  console.log('Setting up audio initialization...');
  
  // Track if audio is already activated
  let audioActivated = false;
  
  const activateAudio = () => {
    // Prevent double activation
    if (audioActivated) return;
    audioActivated = true;
    
    // Create and play a silent audio to unlock the audio context
    const silentAudio = new Audio("data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV");
    silentAudio.play().catch(error => console.log("Silent audio play failed:", error));
    
    // The AudioManager class is defined in audio.js which is loaded normally in the HTML
    // So we can access it directly once the audio context is unlocked
    if (window.AudioManager && !window.audioSystem) {
      window.audioSystem = new window.AudioManager();
      console.log('Audio system created and initialized');
    } else if (window.audioSystem) {
      console.log('Using existing audio system');
    } else {
      console.error('AudioManager class not found. Check if audio.js is properly loaded.');
    }
    
    // Remove event listeners once audio is activated
    document.removeEventListener('click', activateAudio);
    document.removeEventListener('keydown', activateAudio);
    document.removeEventListener('touchstart', activateAudio);
    
    console.log('Audio context activated');
    
    // Continue with initialization after audio is activated
    if (typeof createCircuitLines === 'function') {
      createCircuitLines();
    }
  };
  
  // Add event listeners for user interaction
  document.addEventListener('click', activateAudio);
  document.addEventListener('keydown', activateAudio);
  document.addEventListener('touchstart', activateAudio);
}

/**
 * Initialize the Aayush AI unlock Easter egg
 */
function initAayushUnlock() {
  // Track unlock in localStorage:
  // - aayushUnlocked: true when unlocked by any method
  // - unlockMethod: 'adamSmasher' or 'easterEgg' to track how it was unlocked
  
  // Set up counter for developer credit clicks
  let clickCount = 0;
  const devCredit = document.getElementById('dev-credit');
  
  if (devCredit) {
    devCredit.addEventListener('click', () => {
      clickCount++;
      
      // Provide visual feedback on click
      devCredit.classList.add('active');
      setTimeout(() => devCredit.classList.remove('active'), 500);
      
      // Play a subtle UI sound if audio system is available
      if (window.audioSystem) {
        window.audioSystem.playSound('ui', 'click');
      }
      
      // Check if the user has clicked 3 times
      if (clickCount === 3) {
        unlockAayushAI('easterEgg');
      }
    });
  }
  
  // Set up the close button for the unlock notification
  const closeButton = document.getElementById('closeUnlockNotification');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      const notification = document.getElementById('unlockNotification');
      if (notification) {
        notification.style.display = 'none';
      }
      
      // Play UI sound if available
      if (window.audioSystem) {
        window.audioSystem.playSound('ui', 'click');
      }
    });
  }
}

/**
 * Make sure Aayush is hidden initially, regardless of localStorage
 */
function hideAayushInitially() {
  // Create a session-only flag to track unlocks during this session
  if (!sessionStorage.getItem('aayushSessionUnlock')) {
    sessionStorage.setItem('aayushSessionUnlock', 'false');
    
    // Hide the Aayush AI option
    const aayushOption = document.getElementById('aayushAIOption');
    if (aayushOption) {
      aayushOption.style.display = 'none';
      aayushOption.classList.add('locked');
      
      const lockOverlay = aayushOption.querySelector('.lock-overlay');
      if (lockOverlay) {
        lockOverlay.style.display = 'block';
      }
    }
  }
}

/**
 * Check if Aayush AI is already unlocked in this session
 * @returns {boolean} Whether Aayush AI is unlocked
 */
function checkAayushUnlockStatus() {
  // Only check session storage, not localStorage
  const isUnlocked = sessionStorage.getItem('aayushSessionUnlock') === 'true';
  
  if (isUnlocked) {
    console.log('Aayush AI is already unlocked in this session');
    
    // Show the Aayush AI option without the lock
    const aayushOption = document.getElementById('aayushAIOption');
    if (aayushOption) {
      aayushOption.style.display = 'flex'; // Make the option visible
      aayushOption.classList.remove('locked');
      const lockOverlay = aayushOption.querySelector('.lock-overlay');
      if (lockOverlay) {
        lockOverlay.style.display = 'none';
      }
    }
  }
  
  return isUnlocked;
}

/**
 * Record a win against Adam Smasher to potentially unlock Aayush AI
 * @param {string} winnerName - Name of the player who won
 * @param {string} loserName - Name of the AI who lost
 */
export function recordAdamSmasherDefeat(winnerName, loserName) {
  // Only process if the loser is Adam Smasher and Aayush isn't already unlocked in this session
  if (loserName !== 'Adam Smasher' || sessionStorage.getItem('aayushSessionUnlock') === 'true') {
    return;
  }
  
  console.log(`${winnerName} defeated ${loserName}! Unlocking Aayush AI...`);
  unlockAayushAI('adamSmasher');
}

/**
 * Unlock the Aayush AI character
 * @param {string} method - The method used to unlock ('easterEgg' or 'adamSmasher')
 */
function unlockAayushAI(method) {
  // Don't unlock if already unlocked in this session
  if (sessionStorage.getItem('aayushSessionUnlock') === 'true') {
    return;
  }
  
  // Save unlock status to sessionStorage instead of localStorage
  sessionStorage.setItem('aayushSessionUnlock', 'true');
  sessionStorage.setItem('unlockMethod', method);
  
  // Add a glitch effect to the body
  document.body.classList.add('johnny-glitch');
  setTimeout(() => {
    document.body.classList.remove('johnny-glitch');
  }, 300);
  
  // Update AI option appearance
  const aayushOption = document.getElementById('aayushAIOption');
  if (aayushOption) {
    // Make the option visible with an animation
    aayushOption.style.display = 'flex';
    aayushOption.classList.add('unlocking');
    setTimeout(() => {
      aayushOption.classList.remove('locked');
      aayushOption.classList.remove('unlocking');
      
      // Remove the lock overlay
      const lockOverlay = aayushOption.querySelector('.lock-overlay');
      if (lockOverlay) {
        lockOverlay.style.display = 'none';
      }
    }, 1500);
  }

  // Display unlock message based on method
  let unlockMessage = '';
  if (method === 'easterEgg') {
    unlockMessage = 'The Architect watches you now...';
  } else if (method === 'adamSmasher') {
    unlockMessage = 'You defeated Adam Smasher! The Architect is impressed...';
  } else {
    unlockMessage = 'The Architect watches you now...';
  }
  
  // Update and display unlock notification
  const unlockNotificationElement = document.getElementById('unlockNotification');
  const unlockMessageElement = document.getElementById('unlockMessage');
  
  if (unlockMessageElement) {
    unlockMessageElement.textContent = unlockMessage;
  }
  
  if (unlockNotificationElement) {
    unlockNotificationElement.style.display = 'flex';
    
    // Play glitch sound if available
    if (window.audioSystem) {
      window.audioSystem.playGlitchSound();
    }
  }
}

// Update the export buttons event listeners
document.getElementById('exportJSON').addEventListener('click', function() {
  downloadMoveLog('json');
  document.getElementById('moveLogDialog').style.display = 'none';
});

document.getElementById('exportCSV').addEventListener('click', function() {
  downloadMoveLog('csv');
  document.getElementById('moveLogDialog').style.display = 'none';
});

function playUnlockAnimation() {
    // Create unlock sequence container
    const unlockSequence = document.createElement('div');
    unlockSequence.className = 'unlock-sequence';
    
    // Create matrix background
    const matrixBg = document.createElement('div');
    matrixBg.className = 'matrix-bg';
    unlockSequence.appendChild(matrixBg);
    
    // Create Aayush icon container
    const aayushIcon = document.createElement('div');
    aayushIcon.className = 'aayush-icon';
    const iconImg = document.createElement('img');
    iconImg.src = 'assets/aayush.jpg';  // Make sure this path is correct
    aayushIcon.appendChild(iconImg);
    unlockSequence.appendChild(aayushIcon);
    
    // Create glitch text
    const glitchText = document.createElement('div');
    glitchText.className = 'glitch-text';
    glitchText.textContent = 'UNLOCKING AAYUSH AI';
    unlockSequence.appendChild(glitchText);
    
    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    const progressFill = document.createElement('div');
    progressFill.className = 'progress-fill';
    progressBar.appendChild(progressFill);
    unlockSequence.appendChild(progressBar);
    
    // Create skip text
    const skipText = document.createElement('div');
    skipText.className = 'skip-text';
    skipText.textContent = 'Click 3 times to skip';
    unlockSequence.appendChild(skipText);
    
    // Add to body
    document.body.appendChild(unlockSequence);
    
    // Handle background music
    if (bgMusic) {
        bgMusic.pause();
    }
    
    // Play unlock sound
    unlockAudio = new Audio('sounds/aayushunlock.mp3');
    unlockAudio.play().catch(error => console.log('Audio play failed:', error));
    
    // Handle skip functionality
    setTimeout(() => {
        unlockSequence.classList.add('skippable');
        unlockSequence.addEventListener('click', () => {
            unlockClickCount++;
            if (unlockClickCount >= 3) {
                completeUnlock(unlockSequence);
            }
        });
    }, 3000);
    
    // Auto-complete after animation
    setTimeout(() => completeUnlock(unlockSequence), 17000);
}

function completeUnlock(unlockSequence) {
    // Stop unlock sound
    if (unlockAudio) {
        unlockAudio.pause();
        unlockAudio.currentTime = 0;
    }
    
    // Resume background music if it exists
    if (bgMusic) {
        bgMusic.play().catch(error => console.log('Background music play failed:', error));
    }
    
    // Remove unlock sequence
    unlockSequence.style.animation = 'none';
    unlockSequence.style.background = 'transparent';
    setTimeout(() => {
        document.body.removeChild(unlockSequence);
        unlockClickCount = 0;
        
        // Update game state to show Aayush is unlocked
        localStorage.setItem('aayushUnlocked', 'true');
        updateCharacterSelection();
    }, 500);
}

function updateCharacterSelection() {
    const aayushUnlocked = localStorage.getItem('aayushUnlocked') === 'true';
    const aayushOption = document.querySelector('.character-option[data-character="aayush"]');
    
    if (aayushOption) {
        if (aayushUnlocked) {
            aayushOption.classList.remove('locked');
            aayushOption.querySelector('.lock-overlay')?.remove();
        } else {
            if (!aayushOption.classList.contains('locked')) {
                aayushOption.classList.add('locked');
                const lockOverlay = document.createElement('div');
                lockOverlay.className = 'lock-overlay';
                lockOverlay.innerHTML = '🔒';
                aayushOption.appendChild(lockOverlay);
            }
        }
    }
}