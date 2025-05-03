/**
 * Goro AI (Medium Difficulty)
 * 
 * Character: Ex-Arasaka bodyguard with a balanced tactical approach
 * Strategy: Probabilistic hybrid of rule-based logic (50%) and minimax (50%)
 */

import { createVirtualBoard, evaluateWinBlock, evaluatePosition, checkVirtualBoardWin } from '../evaluation.js';
import { executeMove } from '../engine.js';
import { makeRoyceMove } from './royce.js';

/**
 * Make a move as Goro (Medium difficulty)
 * @param {Array} validBoards - Array of valid board indices
 */
export function makeGoroMove(validBoards) {
  // 50% chance to use simple rule-based strategy (like Royce)
  // 50% chance to use a simplified minimax strategy
  const useSimpleStrategy = Math.random() < 0.5;
  
  if (useSimpleStrategy) {
    console.log(`%c[GORO] Following standard Arasaka protocols.`, 
                "color: #FFAA00; font-style: italic;");
    return makeRoyceMove(validBoards);
  } else {
    console.log(`%c[GORO] Analyzing tactical options...`, 
                "color: #FFAA00; font-style: italic;");
    return makeMinimaxMove(validBoards);
  }
}

/**
 * Make a move using a simplified minimax algorithm
 * @param {Array} validBoards - Array of valid board indices
 */
function makeMinimaxMove(validBoards) {
  // Track best move
  let bestScore = -Infinity;
  let bestMoveBoard = null;
  let bestMoveCell = null;
  
  // Fixed depth = 2 for medium difficulty (less than Adam Smasher's 3-4)
  const searchDepth = 2;
  
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
      const moveScore = evaluateMove(boardIndex, cellIndex, 'O', searchDepth, false);
      
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
    console.log(`%c[GORO] Switching to contingency plan.`, "color: #FFAA00; font-style: italic;");
    return makeRoyceMove(validBoards);
  }
  
  // Select a random Goro quote
  const quotes = [
    "This move is calculated.",
    "Your defense has a weakness.",
    "Arasaka training serves me well.",
    "I see the path to victory."
  ];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  console.log(`%c[GORO] ${quote}`, "color: #FFAA00; font-style: italic;");
  
  console.log(`[GORO] Choosing board ${bestMoveBoard}, cell ${bestMoveCell} with score ${bestScore}`);
  
  // Execute the move
  return executeMove(bestMoveBoard, bestMoveCell);
}

/**
 * Minimax evaluation with simplified evaluation function (no alpha-beta pruning)
 * @param {number} boardIndex - Board index
 * @param {number} cellIndex - Cell index
 * @param {string} player - Player symbol ('X' or 'O')
 * @param {number} depth - Search depth
 * @param {boolean} isMaximizing - Whether we're maximizing
 * @returns {number} - Evaluation score
 */
function evaluateMove(boardIndex, cellIndex, player, depth, isMaximizing) {
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
    return evaluatePosition(virtualBoard, boardIndex, cellIndex, player, 'goro');
  }
  
  const nextPlayer = player === 'O' ? 'X' : 'O';
  
  // Determine if next move targets a specific board
  let nextValidBoard = window.boardWinners[cellIndex] ? -1 : cellIndex;
  let nextBoardCandidates = nextValidBoard === -1 ? 
    window.boardWinners.map((w, i) => w ? null : i).filter(i => i !== null) : 
    [nextValidBoard];
  
  // Remove boards that are already won
  nextBoardCandidates = nextBoardCandidates.filter(i => !window.boardWinners[i]);
  
  // Only consider a subset of moves to reduce complexity at medium difficulty
  if (nextBoardCandidates.length > 1) {
    // Randomly sample 1-2 boards to consider
    const sampleSize = Math.min(2, nextBoardCandidates.length);
    const sampledBoards = [];
    
    // Simple sampling without replacement
    while (sampledBoards.length < sampleSize) {
      const randomBoard = nextBoardCandidates[Math.floor(Math.random() * nextBoardCandidates.length)];
      if (!sampledBoards.includes(randomBoard)) {
        sampledBoards.push(randomBoard);
      }
    }
    
    nextBoardCandidates = sampledBoards;
  }
  
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
      
      // Sample at most 3 moves to reduce complexity
      let cellsToEvaluate = emptyCells;
      if (emptyCells.length > 3) {
        cellsToEvaluate = [];
        // Try to include center and corners in the sample
        if (emptyCells.includes(4)) cellsToEvaluate.push(4); // Center
        
        // Add corners randomly
        const corners = [0, 2, 6, 8].filter(c => emptyCells.includes(c));
        if (corners.length > 0) {
          cellsToEvaluate.push(corners[Math.floor(Math.random() * corners.length)]);
        }
        
        // Fill remaining slots randomly
        while (cellsToEvaluate.length < 3 && emptyCells.length > cellsToEvaluate.length) {
          const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
          if (!cellsToEvaluate.includes(randomCell)) {
            cellsToEvaluate.push(randomCell);
          }
        }
      }
      
      // Try each selected empty cell
      for (let nextCell of cellsToEvaluate) {
        const score = evaluateMove(nextBoard, nextCell, nextPlayer, depth - 1, false);
        maxScore = Math.max(maxScore, score);
      }
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
      
      // Sample at most 3 moves to reduce complexity
      let cellsToEvaluate = emptyCells;
      if (emptyCells.length > 3) {
        cellsToEvaluate = [];
        // Try to include center and corners in the sample
        if (emptyCells.includes(4)) cellsToEvaluate.push(4); // Center
        
        // Add corners randomly
        const corners = [0, 2, 6, 8].filter(c => emptyCells.includes(c));
        if (corners.length > 0) {
          cellsToEvaluate.push(corners[Math.floor(Math.random() * corners.length)]);
        }
        
        // Fill remaining slots randomly
        while (cellsToEvaluate.length < 3 && emptyCells.length > cellsToEvaluate.length) {
          const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
          if (!cellsToEvaluate.includes(randomCell)) {
            cellsToEvaluate.push(randomCell);
          }
        }
      }
      
      // Try each selected empty cell
      for (let nextCell of cellsToEvaluate) {
        const score = evaluateMove(nextBoard, nextCell, nextPlayer, depth - 1, true);
        minScore = Math.min(minScore, score);
      }
    }
    
    return minScore;
  }
} 