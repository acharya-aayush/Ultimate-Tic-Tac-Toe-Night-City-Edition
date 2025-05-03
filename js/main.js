/**
 * Ultimate Tic Tac Toe - Night City Edition
 * Main entry point
 */

import { initializePlayers, updatePlayerUI, updateScoreboard } from './components/players.js';
import { startGame, resetGame, continueGame, backToSetup, emergencyReset } from './components/game.js';
import { selectAIDifficulty } from './ai/ai.js';
import { createCircuitLines, applyTimedGlitch, showNotification, showMusicInfo } from './utils/ui.js';
import { initRandomGlitches, applyMajorGlitch, glitchElement } from './utils/glitchEffects.js';

// Initialize when page is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Main.js loaded and initialized');

  createCircuitLines();
  setInterval(applyTimedGlitch, 7000); // Periodically apply glitch effect
  
  // Initialize random cyberpunk glitch effects (every 10-20 seconds)
  initRandomGlitches(10000, 20000);
  
  // Add event listeners to avatar selectors
  document.querySelectorAll('.avatar-button').forEach(button => {
    button.addEventListener('click', function() {
      const player = this.dataset.player;
      const avatar = this.dataset.avatar;
      const characterName = this.dataset.name || window.characterNames[avatar];
      
      if (player === '1') {
        window.player1Avatar = avatar;
        window.player1Character = avatar; // Sync character with avatar
        window.player1Name = characterName;
        
        // Update player preview
        const preview = document.getElementById('player1AvatarPreview');
        if (preview) preview.src = window.avatarPaths[avatar];
        
        // Update player name input field with character name
        const nameInput = document.getElementById('player1Name');
        if (nameInput) nameInput.value = characterName;

        // Flash the preview to show selection
        const playerImage = preview.closest('.player-image');
        if (playerImage) {
          playerImage.classList.add('selected');
          setTimeout(() => playerImage.classList.remove('selected'), 500);
        }
      } else {
        window.player2Avatar = avatar;
        window.player2Character = avatar; // Sync character with avatar
        window.player2Name = characterName;
        
        // Update player preview
        const preview = document.getElementById('player2AvatarPreview');
        if (preview) preview.src = window.avatarPaths[avatar];
        
        // Update player name input field with character name
        const nameInput = document.getElementById('player2Name');
        if (nameInput) nameInput.value = characterName;

        // Flash the preview to show selection
        const playerImage = preview.closest('.player-image');
        if (playerImage) {
          playerImage.classList.add('selected');
          setTimeout(() => playerImage.classList.remove('selected'), 500);
        }
      }
      
      // Add active class to selected avatar
      document.querySelectorAll(`.avatar-button[data-player="${player}"]`).forEach(btn => {
        btn.classList.remove('active');
      });
      this.classList.add('active');
      
      // Play UI sound
      if (window.audioSystem) {
        window.audioSystem.playSound('ui', 'click');
      }
      
      console.log(`Player ${player} selected ${characterName} (${avatar})`);
    });
  });

  // Set default active avatars and trigger click events to set initial characters
  setTimeout(() => {
    const player1Avatar = document.querySelector('.avatar-button[data-player="1"][data-avatar="johnny1"]');
    const player2Avatar = document.querySelector('.avatar-button[data-player="2"][data-avatar="lucy2"]');
    
    if (player1Avatar) {
      player1Avatar.classList.add('active');
      player1Avatar.click();
    }
    
    if (player2Avatar) {
      player2Avatar.classList.add('active');
      player2Avatar.click();
    }
  }, 100);
  
  // Set background image
  const ambientBg = document.querySelector('.ambient-bg');
  if (ambientBg) ambientBg.style.backgroundImage = "url('assets/images/cyberpunkbg1.png')";
  
  // Setup sound control buttons
  setupAudioControls();
  
  // Initialize UI
  initializePlayers();

  // Set up AI difficulty buttons
  setupAIDifficultyButtons();
});

// Setup audio control buttons
function setupAudioControls() {
  const toggleMusic = document.getElementById('toggleMusic');
  const toggleSfx = document.getElementById('toggleSfx');
  
  if (toggleMusic) {
    toggleMusic.addEventListener('click', function() {
      if (window.audioSystem && typeof window.audioSystem.toggleMusic === 'function') {
        window.audioSystem.toggleMusic();
        // Update button appearance based on state
        this.classList.toggle('active', window.audioSystem.musicEnabled);
      }
    });
  }
  
  if (toggleSfx) {
    toggleSfx.addEventListener('click', function() {
      if (window.audioSystem && typeof window.toggleSFX === 'function') {
        window.toggleSFX(); // Use the global function we set up
        // Update button appearance based on state
        this.classList.toggle('active', window.audioSystem.sfxEnabled);
      }
    });
  }
  
  // Set initial button states
  if (window.audioSystem) {
    if (toggleMusic) toggleMusic.classList.toggle('active', window.audioSystem.musicEnabled);
    if (toggleSfx) toggleSfx.classList.toggle('active', window.audioSystem.sfxEnabled);
  }
}

/**
 * Set up AI difficulty selection buttons
 */
function setupAIDifficultyButtons() {
  const aiButtons = document.querySelectorAll('.ai-button');
  const difficultySelector = document.getElementById('aiDifficultySelector');
  
  aiButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Get difficulty value from button
      const difficulty = this.dataset.difficulty;
      
      // Update hidden input value
      if (difficultySelector) {
        difficultySelector.value = difficulty;
      }
      
      // Remove selected class from all buttons
      aiButtons.forEach(btn => btn.classList.remove('selected'));
      
      // Add selected class to clicked button
      this.classList.add('selected');
      
      // Play UI sound
      if (window.audioSystem) {
        window.audioSystem.playSound('ui', 'click');
      }
      
      // Update AI opponent name in the game
      updateAIOpponentName(difficulty);
    });
  });
}

/**
 * Update AI opponent name based on difficulty
 */
function updateAIOpponentName(difficulty) {
  const difficultyToName = {
    'easy': 'Royce',
    'medium': 'Goro',
    'hard': 'Adam Smasher',
    'extreme': 'Aayush Acharya'
  };
  
  // Set the AI opponent name in the global scope
  if (difficultyToName[difficulty]) {
    window.player2Name = difficultyToName[difficulty];
    
    // Update the side name display if it exists and the game is in progress
    const sideName2 = document.getElementById('sideName2');
    if (sideName2 && window.gameInProgress) {
      sideName2.textContent = window.player2Name;
    }
    
    // Update the avatar for the selected AI
    updateAIAvatar(difficulty);
  }
}

/**
 * Update AI avatar based on difficulty
 */
function updateAIAvatar(difficulty) {
  const difficultyToAvatar = {
    'easy': 'royce',
    'medium': 'goro',
    'hard': 'adam',
    'extreme': 'aayush'
  };
  
  // Set the AI avatar in the global scope
  if (difficultyToAvatar[difficulty]) {
    window.player2Avatar = difficultyToAvatar[difficulty];
    window.player2Character = difficultyToAvatar[difficulty];
    
    // Update the avatar image if it exists
    const avatar = document.getElementById('sideAvatar2');
    if (avatar && window.avatarPaths && window.avatarPaths[window.player2Avatar]) {
      avatar.src = window.avatarPaths[window.player2Avatar];
    } else if (avatar) {
      // Fallback to a direct path if avatar paths aren't defined
      avatar.src = `assets/images/${window.player2Avatar}pfp.png`;
    }
  }
}

// Export functions for use in other modules
export {
  setupAudioControls,
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