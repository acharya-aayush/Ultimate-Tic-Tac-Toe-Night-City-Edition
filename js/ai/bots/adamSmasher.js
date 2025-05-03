/**
 * Adam Smasher AI (Hard Difficulty)
 * 
 * Character: Full-borg mercenary with advanced combat algorithms
 * Strategy: Deep minimax with alpha-beta pruning for optimal decision making
 */

import { createVirtualBoard, evaluatePosition, checkVirtualBoardWin } from '../evaluation.js';
import { executeMove } from '../engine.js';
import { makeRoyceMove } from './royce.js';

/**
 * Make a move as Adam Smasher (Hard difficulty)
 * @param {Array} validBoards - Array of valid board indices
 */
export function makeAdamSmasherMove(validBoards) {
  // Track best move
  let bestScore = -Infinity;
  let bestMoveBoard = null;
  let bestMoveCell = null;
  
  // Depth for minimax calculation - adjust based on game complexity
  const searchDepth = validBoards.length === 1 ? 4 : 3;
  
  // Check each valid board
  for (let boardIndex of validBoards) {
    // Skip boards that are already won
    if (window.boardWinners[boardIndex]) {
      continue;
    }
    
    const emptyIndices = [];
    for (let i = 0; i < 9; i++) {
      if (window.boards[boardIndex].cells[i].textContent === '') {
        emptyIndices.push(i);
      }
    }
    
    // Skip boards with no empty cells
    if (emptyIndices.length === 0) {
      continue;
    }
    
    // Try each empty cell
    for (let cellIndex of emptyIndices) {
      // Make hypothetical move
      const moveScore = evaluateMove(boardIndex, cellIndex, 'O', searchDepth, -Infinity, Infinity, false);
      
      // Update best move if better
      if (moveScore > bestScore) {
        bestScore = moveScore;
        bestMoveBoard = boardIndex;
        bestMoveCell = cellIndex;
      }
    }
  }
  
  // If no good move found, fall back to a simple strategy
  if (bestMoveBoard === null) {
    console.log(`%c[ADAM SMASHER] Resorting to basic combat protocols.`, 
                "color: #FDFE03; font-style: italic;");
    return makeRoyceMove(validBoards);
  }
  
  // Cyberpunk-themed AI decision message
  const messages = [
    "Calculating optimal destruction path.",
    "Target acquired. Executing tactical move.",
    "Primitive strategy detected. Countering.",
    "Combat algorithm predicts victory in 3 moves.",
    "Your defeat is inevitable, meatbag."
  ];
  const aiMessage = messages[Math.floor(Math.random() * messages.length)];
  console.log(`%c[ADAM SMASHER] ${aiMessage}`, "color: #FDFE03; font-style: italic;");
  
  console.log(`[ADAM SMASHER] Choosing board ${bestMoveBoard}, cell ${bestMoveCell} with score ${bestScore}`);
  
  // Execute the move
  return executeMove(bestMoveBoard, bestMoveCell);
}

/**
 * Minimax with alpha-beta pruning evaluation function
 * @param {number} boardIndex - Board index
 * @param {number} cellIndex - Cell index
 * @param {string} player - Player symbol ('X' or 'O')
 * @param {number} depth - Search depth
 * @param {number} alpha - Alpha value for pruning
 * @param {number} beta - Beta value for pruning
 * @param {boolean} isMaximizing - Whether we're maximizing
 * @returns {number} - Evaluation score
 */
function evaluateMove(boardIndex, cellIndex, player, depth, alpha, beta, isMaximizing) {
  // Create a virtual board to simulate moves
  const virtualBoard = createVirtualBoard(boardIndex);
  
  // Apply the move
  virtualBoard[cellIndex] = player;
  
  // Check if this move wins the mini-board
  if (checkVirtualBoardWin(virtualBoard, player)) {
    return player === 'O' ? 100 + depth : -100 - depth;
  }
  
  // Check for draw
  if (virtualBoard.every(cell => cell !== '')) {
    return 0;
  }
  
  // Recursion depth limit or leaf node
  if (depth === 0) {
    return evaluatePosition(virtualBoard, boardIndex, cellIndex, player, 'adamSmasher');
  }
  
  const nextPlayer = player === 'O' ? 'X' : 'O';
  
  // Determine if next move targets a specific board
  let nextValidBoard = window.boardWinners[cellIndex] ? -1 : cellIndex;
  let nextBoardCandidates = nextValidBoard === -1 ? 
    window.boardWinners.map((w, i) => w ? null : i).filter(i => i !== null) : 
    [nextValidBoard];
  
  // Remove boards that are already won
  nextBoardCandidates = nextBoardCandidates.filter(i => !window.boardWinners[i]);
  
  if (isMaximizing) {
    let maxScore = -Infinity;
    
    // Consider each potential next board
    for (let nextBoard of nextBoardCandidates) {
      // Get available cells in this board
      const emptyCells = [];
      for (let i = 0; i < 9; i++) {
        if (createVirtualBoard(nextBoard)[i] === '') {
          emptyCells.push(i);
        }
      }
      
      // Try each empty cell in this board
      for (let nextCell of emptyCells) {
        const score = evaluateMove(nextBoard, nextCell, nextPlayer, depth - 1, alpha, beta, false);
        maxScore = Math.max(maxScore, score);
        alpha = Math.max(alpha, score);
        
        // Alpha-beta pruning
        if (beta <= alpha) break;
      }
      
      // Break early if we've already found a good enough move
      if (beta <= alpha) break;
    }
    
    return maxScore;
  } else {
    let minScore = Infinity;
    
    // Consider each potential next board
    for (let nextBoard of nextBoardCandidates) {
      // Get available cells in this board
      const emptyCells = [];
      for (let i = 0; i < 9; i++) {
        if (createVirtualBoard(nextBoard)[i] === '') {
          emptyCells.push(i);
        }
      }
      
      // Try each empty cell in this board
      for (let nextCell of emptyCells) {
        const score = evaluateMove(nextBoard, nextCell, nextPlayer, depth - 1, alpha, beta, true);
        minScore = Math.min(minScore, score);
        beta = Math.min(beta, score);
        
        // Alpha-beta pruning
        if (beta <= alpha) break;
      }
      
      // Break early if we've already found a good enough move
      if (beta <= alpha) break;
    }
    
    return minScore;
  }
} 