/**
 * Royce AI (Easy Difficulty)
 * 
 * Character: Chaotic Maelstrom gang leader with unpredictable rule-based logic
 * Strategy: Simple rule-based decisions with occasional random choices
 */

import { createVirtualBoard, evaluateWinBlock, getPositionalScore } from '../evaluation.js';
import { executeMove } from '../engine.js';
import { showAIDialogue } from '../dialogues.js';

/**
 * Make a move as Royce (Easy difficulty)
 * @param {Array} validBoards - Array of valid board indices
 */
export function makeRoyceMove(validBoards) {
  showAIDialogue('royce', 'taunt');
  // Randomly inject some chaos (20% chance of pure random move)
  const isFeelingSpontaneous = Math.random() < 0.2;
  if (isFeelingSpontaneous) {
    return makeRandomMove(validBoards);
  }
  
  // Try to win first
  for (let boardIndex of validBoards) {
    const virtualBoard = createVirtualBoard(boardIndex);
    const opportunity = evaluateWinBlock(virtualBoard, 'O');
    
    if (opportunity && opportunity.type === 'win') {
      return executeMove(boardIndex, opportunity.moveIndex);
    }
  }
  
  // Then try to block
  for (let boardIndex of validBoards) {
    const virtualBoard = createVirtualBoard(boardIndex);
    const opportunity = evaluateWinBlock(virtualBoard, 'X');
    
    if (opportunity && opportunity.type === 'block') {
      return executeMove(boardIndex, opportunity.moveIndex);
    }
  }
  
  // If no immediate win or block, make a positional move
  return makePositionalMove(validBoards);
}

/**
 * Make a random move with preference for center and corners
 * @param {Array} validBoards - Array of valid board indices
 */
function makeRandomMove(validBoards) {
  // Choose a random board from valid boards
  const boardIndex = validBoards[Math.floor(Math.random() * validBoards.length)];
  
  // Get empty cells
  const emptyCells = [];
  for (let i = 0; i < 9; i++) {
    if (window.boards[boardIndex].cells[i].textContent === '') {
      emptyCells.push(i);
    }
  }
  
  // If no empty cells (shouldn't happen with our validation), try another board
  if (emptyCells.length === 0) {
    // Remove this board and try again
    const newValidBoards = validBoards.filter(b => b !== boardIndex);
    if (newValidBoards.length > 0) {
      return makeRandomMove(newValidBoards);
    }
    console.error("[ROYCE] No valid moves available");
    return;
  }
  
  // Prefer center, corners, then sides
  const center = 4;
  const corners = [0, 2, 6, 8];
  const sides = [1, 3, 5, 7];
  
  let cellIndex;
  
  // Check for center
  if (emptyCells.includes(center)) {
    cellIndex = center;
  } 
  // Check for corners
  else if (corners.some(corner => emptyCells.includes(corner))) {
    const availableCorners = corners.filter(corner => emptyCells.includes(corner));
    cellIndex = availableCorners[Math.floor(Math.random() * availableCorners.length)];
  }
  // Use sides
  else {
    const availableSides = sides.filter(side => emptyCells.includes(side));
    cellIndex = availableSides[Math.floor(Math.random() * availableSides.length)];
  }
  return executeMove(boardIndex, cellIndex);
}

/**
 * Make a move based on positional value (center and corners preferred)
 * @param {Array} validBoards - Array of valid board indices
 */
function makePositionalMove(validBoards) {
  let bestBoardIndex = null;
  let bestCellIndex = null;
  let bestScore = -Infinity;
  
  // Evaluate each valid board and cell
  for (let boardIndex of validBoards) {
    const emptyCells = [];
    for (let i = 0; i < 9; i++) {
      if (window.boards[boardIndex].cells[i].textContent === '') {
        emptyCells.push(i);
      }
    }
    
    // Skip boards with no empty cells
    if (emptyCells.length === 0) continue;
    
    for (let cellIndex of emptyCells) {
      // Get positional score
      const score = getPositionalScore(cellIndex, 'royce');
      
      // Add some randomness to make behavior less predictable
      const randomFactor = Math.random() * 2 - 1; // -1 to 1
      const finalScore = score + randomFactor;
      
      if (finalScore > bestScore) {
        bestScore = finalScore;
        bestBoardIndex = boardIndex;
        bestCellIndex = cellIndex;
      }
    }
  }
  
  // If no good move found, make a random move
  if (bestBoardIndex === null) {
    return makeRandomMove(validBoards);
  }
  return executeMove(bestBoardIndex, bestCellIndex);
} 