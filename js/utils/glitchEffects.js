/**
 * Cyberpunk Glitch Effects
 * Adds random glitch effects to elements throughout the game
 */

// List of selectors for elements that can be glitched
const GLITCHABLE_ELEMENTS = [
  '.game-header h1',
  '.subtitle',
  '.side-avatar',
  '.mini-board',
  '.player-name-input',
  '.character-select-label',
  '.button-content',
  '.side-name',
  '.avatar-preview',
  '.card-corner',
  '.winner-display',
  '.side-marker'
];

// CSS for the glitch effect
const GLITCH_STYLE = `
.cyberpunk-glitch {
  position: relative;
  animation: glitch-anim 5s ease-in-out;
}

.cyberpunk-glitch::before,
.cyberpunk-glitch::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  opacity: 0.8;
  mix-blend-mode: difference;
  pointer-events: none;
}

.cyberpunk-glitch::before {
  left: -2px;
  background: rgba(233, 30, 99, 0.3);
  animation: glitch-anim-1 2s linear infinite alternate-reverse;
}

.cyberpunk-glitch::after {
  left: 2px;
  background: rgba(33, 150, 243, 0.3);
  animation: glitch-anim-2 3s linear infinite alternate-reverse;
}

@keyframes glitch-anim {
  0% {
    transform: rotateX(0deg) skewX(0deg);
  }
  1% {
    transform: rotateX(10deg) skewX(70deg);
  }
  2% {
    transform: rotateX(0deg) skewX(0deg);
  }
}

@keyframes glitch-anim-1 {
  0% {
    clip-path: inset(33% 0 56% 0);
  }
  20% {
    clip-path: inset(80% 0 10% 0);
  }
  40% {
    clip-path: inset(15% 0 75% 0);
  }
  60% {
    clip-path: inset(90% 0 2% 0);
  }
  80% {
    clip-path: inset(35% 0 55% 0);
  }
  100% {
    clip-path: inset(60% 0 25% 0);
  }
}

@keyframes glitch-anim-2 {
  0% {
    clip-path: inset(70% 0 20% 0);
  }
  20% {
    clip-path: inset(25% 0 65% 0);
  }
  40% {
    clip-path: inset(5% 0 85% 0);
  }
  60% {
    clip-path: inset(40% 0 43% 0);
  }
  80% {
    clip-path: inset(92% 0 7% 0);
  }
  100% {
    clip-path: inset(12% 0 78% 0);
  }
}

.scanlines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 10;
  mix-blend-mode: difference;
  opacity: 0.6;
}

.scanlines::before {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0%,
    rgba(255, 255, 255, 0.05) .5%,
    transparent 1%
  );
  animation: fudge 7s ease-in-out alternate infinite;
}

@keyframes fudge {
  from {
    transform: translate(0px, 0px);
  }
  to {
    transform: translate(0px, 2%);
  }
}
`;

// Apply the CSS to the page
function injectGlitchStyles() {
  // Only add styles once
  if (document.getElementById('cyberpunk-glitch-style')) return;

  const styleElement = document.createElement('style');
  styleElement.id = 'cyberpunk-glitch-style';
  styleElement.textContent = GLITCH_STYLE;
  document.head.appendChild(styleElement);
}

// Apply glitch effect to a random element
function applyRandomGlitch() {
  // Get all possible elements
  const allElements = [];
  GLITCHABLE_ELEMENTS.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => allElements.push(el));
  });
  
  // Filter to only visible elements
  const visibleElements = allElements.filter(el => {
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
  });
  
  if (visibleElements.length === 0) return;
  
  // Pick 1-3 random elements
  const numElements = Math.floor(Math.random() * 3) + 1;
  const selectedElements = [];
  
  for (let i = 0; i < numElements && i < visibleElements.length; i++) {
    let randIndex;
    do {
      randIndex = Math.floor(Math.random() * visibleElements.length);
    } while (selectedElements.includes(visibleElements[randIndex]));
    
    selectedElements.push(visibleElements[randIndex]);
  }
  
  // Apply glitch effect to selected elements
  selectedElements.forEach(element => {
    // Add scanlines for extra effect to some elements (30% chance)
    if (Math.random() < 0.3) {
      const scanlines = document.createElement('div');
      scanlines.className = 'scanlines';
      
      // Only add if it doesn't already have scanlines
      if (!element.querySelector('.scanlines')) {
        // Make sure the element can contain the scanlines properly
        if (window.getComputedStyle(element).position === 'static') {
          element.style.position = 'relative';
        }
        element.appendChild(scanlines);
      }
      
      // Remove scanlines after effect
      setTimeout(() => {
        if (scanlines.parentNode === element) {
          element.removeChild(scanlines);
        }
      }, 5000);
    }
    
    // Apply the glitch class
    element.classList.add('cyberpunk-glitch');
    
    // Play glitch sound with 50% chance
    if (window.audioSystem && Math.random() < 0.5) {
      window.audioSystem.playGlitchSound();
    }
    
    // Remove the class after the animation completes
    setTimeout(() => {
      element.classList.remove('cyberpunk-glitch');
    }, 5000);
  });
}

// Initialize random glitch effects
export function initRandomGlitches(minInterval = 10000, maxInterval = 20000) {
  // Inject the CSS
  injectGlitchStyles();
  
  // Function to schedule the next glitch
  function scheduleNextGlitch() {
    // Random time between min and max interval
    const nextGlitchTime = minInterval + Math.random() * (maxInterval - minInterval);
    
    setTimeout(() => {
      // Only apply if game is in progress or on menu
      if (document.querySelector('.cyberpunk-container')) {
        applyRandomGlitch();
        console.log(`Applied cyberpunk glitch effect, next in ~${Math.round(nextGlitchTime/1000)}s`);
      }
      scheduleNextGlitch();
    }, nextGlitchTime);
  }
  
  // Start the cycle
  scheduleNextGlitch();
}

// Apply a major glitch effect to the whole screen
export function applyMajorGlitch() {
  injectGlitchStyles();
  
  // Create a fullscreen overlay for the glitch
  const overlay = document.createElement('div');
  overlay.className = 'glitch-overlay cyberpunk-glitch';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.pointerEvents = 'none';
  overlay.style.zIndex = '9999';
  overlay.style.opacity = '0.3';
  
  document.body.appendChild(overlay);
  
  // Play a major glitch sound
  if (window.audioSystem) {
    window.audioSystem.playSound('effects', 'majorGlitch');
  }
  
  // Remove the overlay after effect
  setTimeout(() => {
    if (overlay.parentNode) {
      document.body.removeChild(overlay);
    }
  }, 2000);
}

// Force a glitch effect on a specific element
export function glitchElement(element) {
  if (!element) return;
  
  injectGlitchStyles();
  element.classList.add('cyberpunk-glitch');
  
  // Remove the class after the animation completes
  setTimeout(() => {
    element.classList.remove('cyberpunk-glitch');
  }, 5000);
} 