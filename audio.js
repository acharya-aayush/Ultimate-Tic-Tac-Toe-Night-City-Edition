/**
 * Night City Ultimate Tic Tac Toe - Audio Manager
 * Handles all game audio including music, UI sounds and effects
 */

// Define AudioManager as a global class
window.AudioManager = class AudioManager {
  constructor() {
    // Audio state
    this.musicEnabled = true;
    this.sfxEnabled = true;
    this.currentMusic = null;
    this.currentMusicIndex = 0;
    this.musicQueue = ['gameplay1', 'gameplay2', 'gameplay3', 'gameplay4', 'gameplay5']; // All gameplay tracks
    this.glitchSounds = ['glitch1', 'glitch2', 'glitch3', 'glitch4', 'glitch5']; // All glitch sounds
    
    // Audio elements
    this.sounds = {};
    this.dummyAudioEnabled = false; // Force real audio to be used
    this._isInitialized = false; // Track if audio has been initialized
    this.missingFiles = new Set(); // Track missing audio files
    
    // Initialize
    this.initAudio();
    this.setupEventListeners();
    
    console.log("[AUDIO] Audio system initialized with real audio enabled");
    
    // Setup hooks for module system
    this.setupGlobalHooks();
  }
  
  // Set up global hooks for module system to access
  setupGlobalHooks() {
    // Make audio system functions available globally
    window.toggleMusic = () => this.toggleMusic();
    window.toggleSFX = () => this.toggleSFX();
    window.toggleSfx = () => this.toggleSFX();
    window.playSound = (category, name) => this.playSound(category, name);
    window.playMusic = (name) => this.playMusic(name);
    window.stopMusic = () => this.stopMusic();
    window.playMarkerSound = (marker) => this.playMarkerSound(marker);
    window.playBoardWinSound = () => this.playBoardWinSound();
    window.playGameWinSound = () => this.playGameWinSound();
    window.playDrawSound = () => this.playDrawSound();
    window.nextTrack = () => this.playNextTrack();
    
    console.log("[AUDIO] Global audio hooks set up");
  }
  
  /**
   * Initialize audio elements
   */
  initAudio() {
    // Prevent double initialization
    if (this._isInitialized) return;
    this._isInitialized = true;
    
    // Create audio objects
    this.sounds = {
      // Background music - reduced volume from 0.4 to 0.25
      music: {
        gameplay1: this.createAudio('assets/audio/gameplay1.mp3', { loop: false, volume: 0.25 }),
        gameplay2: this.createAudio('assets/audio/gameplay2.mp3', { loop: false, volume: 0.25 }),
        gameplay3: this.createAudio('assets/audio/gameplay3.mp3', { loop: false, volume: 0.25 }),
        gameplay4: this.createAudio('assets/audio/gameplay4.mp3', { loop: false, volume: 0.25 }),
        gameplay5: this.createAudio('assets/audio/gameplay5.mp3', { loop: false, volume: 0.25 }),
        victory: this.createAudio('assets/audio/victory.mp3', { loop: true, volume: 0.25 })
      },
      
      // UI sounds
      ui: {
        click: this.createAudio('assets/audio/click.mp3', { volume: 0.6 }),
        invalid: this.createAudio('assets/audio/invalid.mp3', { volume: 0.5 })
      },
      
      // Gameplay sounds
      gameplay: {
        placeX: this.createAudio('assets/audio/place_x.mp3', { volume: 0.6 }),
        placeO: this.createAudio('assets/audio/place_o.mp3', { volume: 0.6 }),
        boardWin: this.createAudio('assets/audio/board_win.mp3', { volume: 0.7 }),
        gameWin: this.createAudio('assets/audio/game_win.mp3', { volume: 0.8 }),
        draw: this.createAudio('assets/audio/draw.mp3', { volume: 0.6 })
      },
      
      // Special effects
      effects: {
        glitch1: this.createAudio('assets/audio/glitch1.mp3', { volume: 0.6 }),
        glitch2: this.createAudio('assets/audio/glitch2.mp3', { volume: 0.6 }),
        glitch3: this.createAudio('assets/audio/glitch3.mp3', { volume: 0.6 }),
        glitch4: this.createAudio('assets/audio/glitch4.mp3', { volume: 0.6 }),
        glitch5: this.createAudio('assets/audio/glitch5.mp3', { volume: 0.6 }),
        johnnySilverhand1: this.createAudio('assets/audio/johnnys1.mp3', { volume: 0.7 }),
        johnnySilverhand2: this.createAudio('assets/audio/johnnys2.mp3', { volume: 0.7 })
      }
    };
    
    // Generate fallback sounds for missing files
    this.generateFallbackSounds();
    
    // Simplify track ended handling - we'll set this individually when playing a track
    // rather than setting up for all tracks here
    
    // Shuffle the music queue initially
    this.shuffleMusicQueue();
  }
  
  /**
   * Generate fallback sounds for missing files
   */
  generateFallbackSounds() {
    // If we have missing UI sounds, create placeholders
    if (this.missingFiles.has('assets/audio/click.mp3') || this.missingFiles.has('assets/audio/invalid.mp3')) {
      // Create fallback click sound
      const clickContext = new (window.AudioContext || window.webkitAudioContext)();
      const clickBuffer = clickContext.createBuffer(1, 1024, 22050);
      const clickData = clickBuffer.getChannelData(0);
      for (let i = 0; i < 1024; i++) {
        clickData[i] = Math.random() * 2 - 1;
      }
      
      this.sounds.ui.click = {
        play: () => {
          if (!this.sfxEnabled) return;
          const source = clickContext.createBufferSource();
          source.buffer = clickBuffer;
          source.connect(clickContext.destination);
          source.start(0);
          return Promise.resolve();
        },
        pause: () => {},
        currentTime: 0,
        error: null,
        readyState: 4
      };
      
      // Make a copy for invalid sound
      this.sounds.ui.invalid = { ...this.sounds.ui.click };
    }
    
    // Create placeholder for all missing music files
    this.musicQueue = this.musicQueue.filter(track => {
      return !this.missingFiles.has(`assets/audio/${track}.mp3`);
    });
    
    // If all tracks are missing, create at least one fallback
    if (this.musicQueue.length === 0) {
      // Use a silent track as fallback
      this.sounds.music.fallback = {
        play: () => Promise.resolve(),
        pause: () => {},
        currentTime: 0,
        error: null,
        readyState: 4,
        volume: 0
      };
      this.musicQueue = ['fallback'];
    }
  }
  
  /**
   * Shuffle the music queue using Fisher-Yates algorithm
   */
  shuffleMusicQueue() {
    // Don't shuffle if we only have one track
    if (this.musicQueue.length <= 1) {
      return;
    }
    
    for (let i = this.musicQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.musicQueue[i], this.musicQueue[j]] = [this.musicQueue[j], this.musicQueue[i]];
    }
    console.log('[AUDIO] Shuffled music queue:', this.musicQueue);
  }
  
  /**
   * Get random glitch sound
   */
  getRandomGlitchSound() {
    const index = Math.floor(Math.random() * this.glitchSounds.length);
    return this.glitchSounds[index];
  }
  
  /**
   * Create an audio element with options
   */
  createAudio(src, options = {}) {
    // Create a new audio element
    const audio = new Audio();
    
    // Set source directly - no dummy audio check needed
    audio.src = src;
    
    // Add error handler to catch 404 errors
    audio.onerror = () => {
      console.warn(`[AUDIO] Could not load audio file: ${src}`);
      this.missingFiles.add(src); // Track missing files
      this.dummyAudioEnabled = true; // Fall back to dummy audio mode when files are missing
    };
    
    // Apply options
    if (options.loop) audio.loop = true;
    if (options.volume !== undefined) audio.volume = options.volume;
    
    // Log that we're loading this audio file
    console.log(`[AUDIO] Loading audio file: ${src}`);
    
    return audio;
  }
  
  /**
   * Set up event listeners for UI elements
   */
  setupEventListeners() {
    // Music toggle button
    const musicBtn = document.getElementById('toggleMusic');
    if (musicBtn) {
      musicBtn.addEventListener('click', () => this.toggleMusic());
    }
    
    // SFX toggle button
    const sfxBtn = document.getElementById('toggleSfx');
    if (sfxBtn) {
      sfxBtn.addEventListener('click', () => this.toggleSFX());
    }
    
    // Button click sounds
    document.addEventListener('click', (e) => {
      const isButton = e.target.closest('.cyber-button, .icon-button');
      if (isButton) this.playSound('ui', 'click');
    });
  }
  
  /**
   * Play a sound from the sound library
   */
  playSound(category, name) {
    // Don't play if sound effects are disabled
    if (!this.sfxEnabled) return;
    
    // Check if the sound exists
    if (!this.sounds[category] || !this.sounds[category][name]) {
      console.warn(`[AUDIO] Sound not found: ${category}.${name}`);
      return;
    }
    
    // Get the sound
    const sound = this.sounds[category][name];
    
    // Reset the sound if it's still playing
    sound.currentTime = 0;
    
    // Check if audio file has loaded correctly
    if (sound.error || sound.readyState === 0) {
      console.warn(`[AUDIO] Sound ${category}.${name} not loaded properly, skipping playback`);
      return;
    }
    
    // Try to play the sound
    const playPromise = sound.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn(`[AUDIO] Error playing sound ${category}.${name}: ${error.message}`);
      });
    }
    
    console.log(`[AUDIO] Playing sound: ${category}.${name}`);
  }
  
  /**
   * Play the next track in the music queue
   */
  playNextTrack() {
    if (!this.musicEnabled) return;
    
    // Stop any currently playing music first
    this.stopCurrentTrack();
    
    // Advance to next track in the queue
    this.currentMusicIndex = (this.currentMusicIndex + 1) % this.musicQueue.length;
    this.currentMusic = this.musicQueue[this.currentMusicIndex];
    
    console.log(`[AUDIO] Playing next track: ${this.currentMusic} (index ${this.currentMusicIndex}/${this.musicQueue.length-1})`);
    
    // Play the next track
    if (this.sounds.music[this.currentMusic]) {
      this.sounds.music[this.currentMusic].currentTime = 0;
      
      // Check if audio file has loaded correctly
      if (this.sounds.music[this.currentMusic].error || this.sounds.music[this.currentMusic].readyState === 0) {
        console.warn(`[AUDIO] Track ${this.currentMusic} not loaded properly, skipping to next track`);
        // Try the next track in the sequence
        setTimeout(() => this.playNextTrack(), 500);
        return;
      }
      
      // Set up ended handler for this track
      this.sounds.music[this.currentMusic].onended = () => {
        console.log(`[AUDIO] Track ${this.currentMusic} ended naturally, playing next track`);
        this.playNextTrack();
      };
      
      const playPromise = this.sounds.music[this.currentMusic].play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn(`[AUDIO] Error playing music ${this.currentMusic}: ${error.message}`);
          // Try the next track on error
          setTimeout(() => this.playNextTrack(), 500);
        });
      }
    } else {
      console.warn(`[AUDIO] Track ${this.currentMusic} not found in sound library`);
      // Try the next track
      setTimeout(() => this.playNextTrack(), 500);
    }
  }
  
  /**
   * Stop the currently playing music track
   */
  stopCurrentTrack() {
    if (this.currentMusic && this.sounds.music[this.currentMusic]) {
      this.sounds.music[this.currentMusic].pause();
      this.sounds.music[this.currentMusic].currentTime = 0;
    }
  }
  
  /**
   * Play background music - updated to support track sequence
   */
  playMusic(name) {
    if (!this.musicEnabled) return;
    
    // Stop any currently playing music first
    this.stopMusic();
    
    // If name is 'gameplay', start the music sequence
    if (name === 'gameplay') {
      // Reset to first track in the queue
      this.currentMusicIndex = 0;
      this.currentMusic = this.musicQueue[this.currentMusicIndex];
      name = this.currentMusic; // Use the first track
      
      console.log(`[AUDIO] Starting gameplay music sequence with: ${name} (Queue: ${this.musicQueue.join(', ')})`);
    } else {
      // For non-gameplay music (like victory), just play it directly
      this.currentMusic = name;
      console.log(`[AUDIO] Starting specific music: ${name}`);
    }
    
    // Start new music if available
    if (this.sounds.music[name]) {
      // Check if audio file has loaded correctly
      if (this.sounds.music[name].error || this.sounds.music[name].readyState === 0) {
        console.warn(`[AUDIO] Track ${name} not loaded properly, skipping to next track`);
        if (name !== 'victory') {
          // If it's gameplay music, try the next track
          setTimeout(() => this.playNextTrack(), 500);
        }
        return;
      }
      
      // Make sure the ended event is properly set up
      if (name !== 'victory') {
        // Ensure the ended event listener is attached to switch to the next track
        this.sounds.music[name].onended = () => {
          console.log(`[AUDIO] Track ${name} ended naturally, playing next track`);
          this.playNextTrack();
        };
      }
      
      const playPromise = this.sounds.music[name].play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error(`[AUDIO] Error starting music ${name}:`, error);
          if (name !== 'victory') {
            // If it's gameplay music, try the next track
            setTimeout(() => this.playNextTrack(), 500);
          }
        });
      }
    }
  }
  
  /**
   * Stop all music playback
   */
  stopMusic() {
    // Stop all music tracks
    for (let track in this.sounds.music) {
      if (this.sounds.music[track]) {
        this.sounds.music[track].pause();
        this.sounds.music[track].currentTime = 0;
      }
    }
    this.currentMusic = null;
    console.log('[AUDIO] All music stopped');
  }
  
  /**
   * Toggle music on/off
   */
  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    const musicBtn = document.getElementById('toggleMusic');
    
    if (this.musicEnabled) {
      // Enable music by starting/resuming current track
      console.log('[AUDIO] Music enabled');
      if (this.currentMusic && this.sounds.music[this.currentMusic]) {
        this.sounds.music[this.currentMusic].play().catch(error => {
          console.error('[AUDIO] Error resuming music:', error);
        });
      } else {
        this.playMusic('gameplay');
      }
    } else {
      // Disable music by stopping all tracks
      console.log('[AUDIO] Music disabled');
      this.stopMusic();
    }
    
    // Update button state
    if (musicBtn) {
      musicBtn.classList.toggle('muted', !this.musicEnabled);
    }
  }
  
  /**
   * Toggle sound effects on/off
   */
  toggleSFX() {
    this.sfxEnabled = !this.sfxEnabled;
    const sfxBtn = document.getElementById('toggleSfx');
    
    console.log(`[AUDIO] Sound effects ${this.sfxEnabled ? 'enabled' : 'disabled'}`);
    
    if (sfxBtn) {
      sfxBtn.classList.toggle('muted', !this.sfxEnabled);
    }
    
    // Play a sound to indicate the new state if turning on
    if (this.sfxEnabled) {
      this.playSound('ui', 'click');
    }
  }
  
  /**
   * Play marker placement sound
   */
  playMarkerSound(marker) {
    // Play the marker sound
    if (marker === 'X') {
      this.playSound('gameplay', 'placeX');
    } else {
      this.playSound('gameplay', 'placeO');
    }
    
    // Always play a random glitch sound when placing markers
    const glitchSound = this.getRandomGlitchSound();
    this.playSound('effects', glitchSound);
  }
  
  /**
   * Play board win sound
   */
  playBoardWinSound() {
    this.playSound('gameplay', 'boardWin');
  }
  
  /**
   * Play game win sound
   */
  playGameWinSound() {
    this.playSound('gameplay', 'gameWin');
  }
  
  /**
   * Play draw sound
   */
  playDrawSound() {
    this.playSound('gameplay', 'draw');
  }
  
  /**
   * Play Johnny Silverhand glitch effect - now with randomized Johnny sounds
   */
  playJohnnySilverlandEffect() {
    // Choose randomly between Johnny sound 1 and 2
    const johnnySound = Math.random() < 0.5 ? 'johnnySilverhand1' : 'johnnySilverhand2';
    this.playSound('effects', johnnySound);
    
    // Add glitch overlay effect
    const glitchOverlay = document.querySelector('.glitch-overlay');
    if (glitchOverlay) {
      glitchOverlay.classList.add('johnny-glitch');
      
      // Remove class after animation ends
      setTimeout(() => {
        glitchOverlay.classList.remove('johnny-glitch');
      }, 300);
    }
  }
  
  /**
   * Play a random glitch sound
   */
  playGlitchSound() {
    const glitchSound = this.getRandomGlitchSound();
    this.playSound('effects', glitchSound);
  }
}

// Export the audio system for use in the main script - but only create ONE instance
if (!window.audioSystem) {
  window.audioSystem = new window.AudioManager();
}

// Fix for browsers that require user interaction before playing audio
document.addEventListener('click', function() {
  // Try to play a silent audio to unlock audio context
  if (window.audioSystem && window.audioSystem.musicEnabled) {
    console.log('[AUDIO] User interaction detected, enabling audio playback');
    window.audioSystem.playMusic('gameplay');
  }
}, { once: true }); 