/**
 * AI Evaluation - Shared evaluation functions and bot-specific weights
 * Contains heuristics for evaluating board positions
 */

import { WIN_PATTERNS } from '../utils/constants.js';

/**
 * Bot-specific evaluation weights
 */
export const BotWeights = {
  // Royce (Easy) - No search, uses rule-based logic only
  royce: {
    nearWin: 10,        // Two in a row with empty
    blockingMove: 8,    // Block opponent's two in a row
    potential: 1,       // One in a row with two empty
    center: 4,          // Value of center position
    corner: 2,          // Value of corner position
    sendToWonBoard: -1, // Penalty for sending to already won board
    sendToWinningOpp: -5 // Penalty for sending to a board where opponent can win
  },
  
  // Goro (Medium) - Uses mix of rule-based and minimax
  goro: {
    nearWin: 10,
    blockingMove: 9,
    potential: 2,
    center: 5,
    corner: 3,
    sendToWonBoard: -2,
    sendToWinningOpp: -8
  },
  
  // Adam Smasher (Hard) - Using advanced minimax with pruning
  adamSmasher: {
    nearWin: 10,
    blockingMove: 8,
    potential: 1,
    center: 5,
    corner: 3,
    sendToWonBoard: -2,
    sendToWinningOpp: -10
  },
  
  // Aayush Acharya (Extreme) - Deeper search, more sophisticated evaluation 
  aayushAcharya: {
    nearWin: 15,
    blockingMove: 12,
    potential: 3,
    center: 6,
    corner: 4,
    sendToWonBoard: -3,
    sendToWinningOpp: -15,
    boardControl: 8,    // Value of controlling a strategic board
    boardSynergy: 5     // Value of having pieces in synergistic positions
  }
};

/**
 * Create a virtual board representation from real board
 * @param {number} boardIndex - Index of the board
 * @returns {Array} - Array representation of the board
 */
export function createVirtualBoard(boardIndex) {
  if (boardIndex === undefined || !window.boards[boardIndex]) {
    return Array(9).fill('');
  }
  return window.boards[boardIndex].cells.map(cell => cell.textContent);
}

/**
 * Check if a virtual board is won
 * @param {Array} board - Board representation
 * @param {string} player - Player symbol ('X' or 'O')
 * @returns {boolean} - True if the board is won
 */
export function checkVirtualBoardWin(board, player) {
  return WIN_PATTERNS.some(line => line.every(i => board[i] === player));
}

/**
 * Evaluate a board for win/block opportunities
 * @param {Array} board - Board representation
 * @param {string} player - Player symbol ('X' or 'O')
 * @returns {Object|null} - { moveIndex, type } or null if no opportunities
 */
export function evaluateWinBlock(board, player) {
  const opponent = player === 'X' ? 'O' : 'X';
  
  // Check for winning move
  for (let line of WIN_PATTERNS) {
    const [a, b, c] = line;
    const cells = [board[a], board[b], board[c]];
    
    if (cells.filter(cell => cell === player).length === 2 && 
        cells.filter(cell => cell === '').length === 1) {
      const emptyIndex = cells.indexOf('');
      return { moveIndex: line[emptyIndex], type: 'win' };
    }
  }
  
  // Check for blocking move
  for (let line of WIN_PATTERNS) {
    const [a, b, c] = line;
    const cells = [board[a], board[b], board[c]];
    
    if (cells.filter(cell => cell === opponent).length === 2 && 
        cells.filter(cell => cell === '').length === 1) {
      const emptyIndex = cells.indexOf('');
      return { moveIndex: line[emptyIndex], type: 'block' };
    }
  }
  
  return null;
}

/**
 * Get positional preference score
 * @param {number} cellIndex - Index of the cell
 * @param {string} botType - Bot type for weights
 * @returns {number} - Positional score
 */
export function getPositionalScore(cellIndex, botType) {
  const weights = BotWeights[botType] || BotWeights.adamSmasher;
  
  // Center
  if (cellIndex === 4) {
    return weights.center;
  }
  
  // Corners
  if ([0, 2, 6, 8].includes(cellIndex)) {
    return weights.corner;
  }
  
  // Sides
  return 1;
}

/**
 * Static position evaluation for minimax
 * @param {Array} board - Board representation
 * @param {number} boardIndex - Board index 
 * @param {number} cellIndex - Cell index
 * @param {string} player - Player symbol ('X' or 'O')
 * @param {string} botType - Bot type for weights
 * @returns {number} - Evaluation score
 */
export function evaluatePosition(board, boardIndex, cellIndex, player, botType) {
  const weights = BotWeights[botType] || BotWeights.adamSmasher;
  let score = 0;
  const opponent = player === 'O' ? 'X' : 'O';
  
  // Check each win line
  for (let line of WIN_PATTERNS) {
    const [a, b, c] = line;
    
    // Count pieces in this line
    const playerCount = line.filter(i => board[i] === player).length;
    const opponentCount = line.filter(i => board[i] === opponent).length;
    const emptyCount = line.filter(i => board[i] === '').length;
    
    // Evaluate line
    if (playerCount === 2 && emptyCount === 1) score += weights.nearWin;
    if (playerCount === 1 && emptyCount === 2) score += weights.potential;
    if (opponentCount === 2 && emptyCount === 1) score -= weights.blockingMove;
  }
  
  // Positional bonus
  score += getPositionalScore(cellIndex, botType);
  
  // Strategic board considerations
  if (window.boardWinners[cellIndex]) {
    score += weights.sendToWonBoard;
  }
  
  // Check if sending to a board with winning opportunity for opponent
  const nextBoard = createVirtualBoard(cellIndex);
  for (let line of WIN_PATTERNS) {
    if (line.filter(i => nextBoard[i] === opponent).length === 2 && 
        line.filter(i => nextBoard[i] === '').length === 1) {
      score += weights.sendToWinningOpp;
    }
  }
  
  // Advanced considerations for extreme difficulty
  if (botType === 'aayushAcharya') {
    // Board control strategy - value controlling strategic boards
    const strategicBoards = [0, 2, 4, 6, 8]; // Center and corners of the main board
    if (strategicBoards.includes(boardIndex)) {
      score += weights.boardControl;
    }
    
    // Board synergy - value having pieces that work together
    const boardsWonByPlayer = window.boardWinners.filter(w => w === player).length;
    if (boardsWonByPlayer > 0) {
      // More sophisticated strategic evaluation
      for (let line of WIN_PATTERNS) {
        const [a, b, c] = line;
        // Count boards won in this potential winning line
        const wonInLine = [a, b, c].filter(i => window.boardWinners[i] === player).length;
        
        if (wonInLine > 0) {
          score += weights.boardSynergy * wonInLine;
        }
      }
    }
  }
  
  return score;
} 