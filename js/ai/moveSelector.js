/**
 * AI Move Selector - Unified interface for AI move selection
 * Provides a single entry point for making AI moves
 */

import { aiMove } from './engine.js';

/**
 * Make an AI move based on the currently selected bot
 * This is the main function to be called from the game logic
 */
export function makeAIMove() {
  aiMove();
}

// Export the main function as the default export
export default makeAIMove; 