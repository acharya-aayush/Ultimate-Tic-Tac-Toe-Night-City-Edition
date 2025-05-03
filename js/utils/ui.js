/**
 * UI utilities for visual effects and notifications
 */

import { glitchElement } from './glitchEffects.js';

// Circuit lines animation
export function createCircuitLines() {
  const container = document.getElementById('circuitLines');
  if (!container) return;
  
  container.innerHTML = '';
  
  let styleSheet = document.getElementById('dynamic-keyframes-style');
  if (!styleSheet) {
    styleSheet = document.createElement('style');
    styleSheet.id = 'dynamic-keyframes-style';
    document.head.appendChild(styleSheet);
  }
  
  const sheet = styleSheet.sheet;
  const generatedKeyframes = new Set();
  
  for (let i = 0; i < 15; i++) {
    const line = document.createElement('div');
    line.className = 'circuit-line';
    
    const top = Math.random() * 100;
    const left = Math.random() * 100 - 10;
    line.style.top = `${top}%`;
    line.style.left = `${left}%`;
    
    const width = 100 + Math.random() * 200;
    line.style.width = `${width}px`;
    
    const duration = 2 + Math.random() * 3;
    const delay = Math.random() * 5;
    
    const animationName = `lineMove_${i}`;
    
    if (!generatedKeyframes.has(animationName)) {
      const keyframes = `
        @keyframes ${animationName} {
          0% { opacity: 0; transform: translateX(0); }
          10% { opacity: 0.7; } 90% { opacity: 0.7; }
          100% { opacity: 0; transform: translateX(${width + 50}px); }
        }`;
      
      try {
        sheet.insertRule(keyframes, sheet.cssRules.length);
        generatedKeyframes.add(animationName);
      } catch (e) {
        console.error("Could not insert keyframe rule:", e);
      }
    }
    
    line.style.animation = `${animationName} ${duration}s linear ${delay}s infinite`;
    container.appendChild(line);
  }
}

// Apply glitch effect to text elements
export function applyTimedGlitch() {
  const elementsToGlitch = document.querySelectorAll('.glitchable-text');
  
  if (elementsToGlitch.length === 0) return;
  
  // Play glitch sound
  if (window.audioSystem) {
    window.audioSystem.playGlitchSound();
  }
  
  elementsToGlitch.forEach(el => {
    const originalText = el.textContent;
    el.dataset.text = originalText;
    el.classList.add('apply-glitch');
    
    setTimeout(() => {
      el.classList.remove('apply-glitch');
      delete el.dataset.text;
    }, 1000); // Glitch duration
  });
}

// Show a temporary notification
export function showNotification(message, duration = 3000) {
  // Create notification element if it doesn't exist
  let notification = document.getElementById('game-notification');
  
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'game-notification';
    notification.className = 'game-notification';
    document.body.appendChild(notification);
  }
  
  // Set message and show
  notification.textContent = message;
  notification.classList.add('show');
  
  // Hide after duration
  setTimeout(() => {
    notification.classList.remove('show');
  }, duration);
}

// Show a more helpful notification about the background music
export function showMusicInfo() {
  if (window.audioSystem && !window.audioSystem.dummyAudioEnabled) {
    showNotification("Now playing background music tracks sequentially", 3000);
  }
}

// Place marker with animation effect
export function placeMarkerWithEffect(cell, marker) {
  // Add marker
  cell.textContent = marker;
  cell.classList.add(marker);
  
  // Add glitch animation
  cell.classList.add('apply-glitch');
  cell.dataset.text = marker;
  
  // Occasionally apply extra cyberpunk glitch effect (20% chance)
  if (Math.random() < 0.2) {
    glitchElement(cell);
  }
  
  // Play marker placement sound
  if (window.audioSystem) {
    window.audioSystem.playMarkerSound(marker);
    
    // Check if player is Johnny and play Johnny-specific sounds (only when Player 1/X places)
    if (marker === 'X' && 
        (window.player1Character === 'johnny1' || window.player1Character === 'johnny2') && 
        Math.random() < 0.15) { // 15% chance to trigger Johnny sounds
      window.audioSystem.playJohnnySilverlandEffect();
    }
  }
  
  // Remove glitch effect after animation
  setTimeout(() => {
    cell.classList.remove('apply-glitch');
    delete cell.dataset.text;
  }, 1000);
}

// Show winner with cyberpunk effects
export function showWinner(winnerName, winnerSymbol) {
  const winnerDisplay = document.getElementById('winner-display');
  winnerDisplay.style.display = 'flex';
  
  const winnerText = document.getElementById('winnerText');
  const sliceGlitch = winnerText.querySelector('.slice-glitch');
  const textContent = document.getElementById('winner-name');
  
  // Set winner name
  textContent.textContent = winnerName === 'DRAW' ? 'DRAW GAME' : winnerName;
  
  // Reset and reapply animations
  winnerText.classList.remove('active');
  sliceGlitch.classList.remove('active');
  
  setTimeout(() => {
    winnerText.classList.add('active');
    sliceGlitch.classList.add('active');
    applyTimedGlitch();
  }, 100);
} 