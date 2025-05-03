/**
 * AI opponent for Ultimate Tic Tac Toe
 * This file is now a wrapper for the new multi-bot AI system
 */

import { selectAIDifficulty as selectBot } from './engine.js';
import { makeAIMove } from './moveSelector.js';
import './bots/royce.js';
import './bots/goro.js';
import './bots/adamSmasher.js';
import './bots/aayushAcharya.js';

// Export the difficulty selector function
export function selectAIDifficulty(difficulty) {
  return selectBot(difficulty);
}

// Export the AI move function
export function aiMove() {
  return makeAIMove();
}

// Initialize the multi-bot system
console.log("[AI] Multi-bot system loaded"); 