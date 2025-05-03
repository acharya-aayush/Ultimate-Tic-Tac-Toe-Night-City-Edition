/**
 * AI Engine - Core turn manager and dispatcher
 * Manages AI turn processing and dispatches to the appropriate bot
 */

import { handleMove } from '../components/game.js';
import { makeRoyceMove } from './bots/royce.js';
import { makeGoroMove } from './bots/goro.js';
import { makeAdamSmasherMove } from './bots/adamSmasher.js';
import { makeAayushAcharyaMove, setupMoveLogExport } from './bots/aayushAcharya.js';

// Default bot if none selected
const DEFAULT_BOT = 'adamSmasher';

/**
 * Initialize AI system
 */
export function initAI() {
  // Set default bot if not already set
  window.selectedAIBot = window.selectedAIBot || DEFAULT_BOT;
  console.log(`AI Engine initialized with bot: ${window.selectedAIBot}`);
  
  // Initialize Aayush move logging system
  setupMoveLogExport();
  
  // Update the UI to reflect the selected bot
  updateAISelector(window.selectedAIBot);
}

/**
 * Update the AI selector UI based on the selected bot
 * @param {string} botName - Name of the selected bot
 */
export function updateAISelector(botName) {
  // Clear all selected states
  document.querySelectorAll('.ai-option').forEach(option => {
    option.classList.remove('selected');
  });
  
  // Select the appropriate bot in the UI
  const botSelector = document.querySelector(`.ai-option[data-ai="${botName}"]`);
  if (botSelector) {
    botSelector.classList.add('selected');
  }
}

/**
 * Map difficulty level to bot name
 * @param {string} level - Difficulty level (easy, medium, hard, extreme)
 * @returns {string} - Bot name
 */
export function selectAIDifficulty(level) {
  const mapping = {
    easy: 'royce',
    medium: 'goro',
    hard: 'adamSmasher',
    extreme: 'aayushAcharya'
  };
  
  // Map bot names to difficulty levels (for direct bot selection)
  const botToDifficulty = {
    royce: 'easy',
    goro: 'medium',
    adamSmasher: 'hard',
    aayushAcharya: 'extreme'
  };
  
  // Determine if we were passed a bot name directly instead of a difficulty
  let selectedBot;
  let difficultyLevel;
  
  if (mapping[level?.toLowerCase()]) {
    // Standard difficulty input
    selectedBot = mapping[level?.toLowerCase()];
    difficultyLevel = level;
  } else if (botToDifficulty[level]) {
    // Direct bot name input
    selectedBot = level;
    difficultyLevel = botToDifficulty[level];
  } else {
    // Fallback to default
    selectedBot = DEFAULT_BOT;
    difficultyLevel = 'hard';
  }
  
  window.selectedAIBot = selectedBot;
  
  // Update the UI
  updateAISelector(selectedBot);
  
  // Update hidden input value
  const difficultyInput = document.getElementById('aiDifficultySelector');
  if (difficultyInput) {
    difficultyInput.value = difficultyLevel;
  }
  
  // Play button sound
  if (window.audioSystem) {
    window.audioSystem.playSound('ui', 'click');
  }
  
  // Log the selection with appropriate styling based on bot
  const botStyles = {
    royce: "color: #FF5555; font-weight: bold;",
    goro: "color: #FFAA00; font-weight: bold;",
    adamSmasher: "color: #FDFE03; font-weight: bold;",
    aayushAcharya: "color: #FF00FF; font-weight: bold;"
  };
  
  console.log(`%c[${window.selectedAIBot.toUpperCase()}] AI opponent selected (${difficultyLevel} difficulty)`, 
             botStyles[window.selectedAIBot] || "color: white;");
             
  // Start game with AI
  window.startGame('ai');
}

/**
 * Dispatch AI move to appropriate bot
 */
export function aiMove() {
  // Start with a "thinking" sound
  if (window.audioSystem) {
    window.audioSystem.playGlitchSound();
  }
  
  // Get valid boards for the move
  const validBoards = getValidBoards();
  
  // If no valid moves, game is done
  if (validBoards.length === 0) {
    console.log("[AI] No valid moves available, game should be a draw");
    return;
  }
  
  // Dispatch to appropriate bot based on selection
  switch(window.selectedAIBot) {
    case 'royce':
      makeRoyceMove(validBoards);
      break;
    case 'goro':
      makeGoroMove(validBoards);
      break;
    case 'aayushAcharya':
      makeAayushAcharyaMove(validBoards);
      break;
    case 'adamSmasher':
    default:
      makeAdamSmasherMove(validBoards);
      break;
  }
}

/**
 * Get all valid boards where a move can be made
 * @returns {Array} - Array of valid board indices
 */
export function getValidBoards() {
  // Determine which boards are valid for the move
  let validBoards = window.nextBoard === -1 ? 
    window.boards.map((b, i) => window.boardWinners[i] ? null : i).filter(i => i !== null) : 
    [window.nextBoard];
    
  // Safety check: if no valid boards (shouldn't happen normally, but let's be safe)
  if (validBoards.length === 0) {
    console.log("[AI] No valid boards found, using any non-won board");
    validBoards = window.boards.map((b, i) => window.boardWinners[i] ? null : i).filter(i => i !== null);
  }
  
  // Filter out any boards that are already full (no empty cells)
  validBoards = validBoards.filter(boardIndex => {
    // Skip already won boards
    if (window.boardWinners[boardIndex]) return false;
    
    // Skip full boards
    const hasEmptyCell = window.boards[boardIndex].cells.some(cell => cell.textContent === '');
    return hasEmptyCell;
  });
  
  return validBoards;
}

/**
 * Execute a move on the game board
 * @param {number} boardIndex - Index of the board
 * @param {number} cellIndex - Index of the cell
 */
export function executeMove(boardIndex, cellIndex) {
  handleMove(boardIndex, cellIndex, window.boards[boardIndex].cells[cellIndex]);
} 