/**
 * Aayush Acharya AI (Extreme Difficulty)
 * 
 * Character: Mythic AI with supernatural calculation abilities
 * Strategy: Advanced strategic planning with prioritized goals:
 *  1. Win the current board if possible
 *  2. Block opponent's winning moves
 *  3. Force opponent to bad boards
 *  4. Use sophisticated heuristic scoring for optimal moves
 */

import { createVirtualBoard, evaluatePosition, checkVirtualBoardWin, evaluateWinBlock } from '../evaluation.js';
import { executeMove } from '../engine.js';
import { makeAdamSmasherMove } from './adamSmasher.js';
import { WIN_PATTERNS } from '../../utils/constants.js';

// ---- AI LOGGER CONSTANTS ----
const MOVE_ACTIONS = {
  WIN: 'WIN',
  BLOCK: 'BLOCK',
  FORCE_BAD_BOARD: 'FORCE_BAD_BOARD',
  META_WIN_SETUP: 'META_WIN_SETUP',
  HEURISTIC: 'HEURISTIC',
  FALLBACK: 'FALLBACK'
};

/**
 * Game move log to track AI decision-making
 * Used for analysis and training
 */
const moveLog = [];
let moveCounter = 0;

/**
 * Export functions for the move log data
 * These are attached to the window object for external access
 */
export function setupMoveLogExport() {
  // Create global functions for data export
  window.exportAayushMoveLog = function() {
    return JSON.stringify(window.aayushMoveLog || moveLog, null, 2);
  };
  
  window.exportAayushMoveCSV = function() {
    return window.aayushMoveCSV || '';
  };
  
  window.downloadAayushMoveLog = function(format = 'json') {
    let content, filename, type;
    
    if (format === 'csv') {
      content = window.exportAayushMoveCSV();
      filename = 'aayush_move_log.csv';
      type = 'text/csv';
    } else {
      content = window.exportAayushMoveLog();
      filename = 'aayush_move_log.json';
      type = 'application/json';
    }
    
    // Create download link
    const element = document.createElement('a');
    const file = new Blob([content], {type: type});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    
    // Add to document, click and remove
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    console.log(`Move log exported as ${filename}`);
    return true;
  };
  
  console.log(`%c[AAYUSH ACHARYA] Move logging system initialized. Use window.downloadAayushMoveLog() to export data.`,
             "color: #FF00FF; font-weight: bold;");
}

/**
 * Make a move as Aayush Acharya (Extreme difficulty)
 * @param {Array} validBoards - Array of valid board indices
 */
export function makeAayushAcharyaMove(validBoards) {
  console.log(`%c[AAYUSH ACHARYA] Analyzing game state with enhanced strategic algorithms...`, 
              "color: #FF00FF; font-style: italic;");
  
  // Increment move counter for logging
  moveCounter++;
  
  // Create a move log entry
  const logEntry = {
    moveNumber: moveCounter,
    action: null,
    boardFrom: null, 
    cellChosen: null,
    sentOpponentTo: null,
    reason: null,
    score: 0,
    timestamp: Date.now()
  };
  
  // Performance optimization - on complex positions with many options, use a faster approach
  if (validBoards.length > 3) {
    console.log(`%c[AAYUSH ACHARYA] Multiple board options detected. Using optimized analysis.`, 
                "color: #FF00FF; font-style: italic;");
    return makeStrategicMove(validBoards, logEntry);
  }
  
  // Track best move
  let bestScore = -Infinity;
  let bestMoveBoard = null;
  let bestMoveCell = null;
  let bestMoveReason = null;
  let bestMoveAction = MOVE_ACTIONS.HEURISTIC;
  
  // Deep search depth for extreme difficulty
  const searchDepth = 6;
  
  // Set a time limit for calculation
  const startTime = Date.now();
  const timeLimit = 2500; // 2.5 seconds max
  
  // PRIORITY 1 & 2: Check if we can win any board immediately or block opponent from winning
  const priorityMove = findPriorityMove(validBoards);
  if (priorityMove) {
    console.log(`%c[AAYUSH ACHARYA] Priority move detected. Executing optimal strategy.`, 
                "color: #FF00FF; font-style: italic;");
    
    // Update log entry with priority move details
    logEntry.action = priorityMove.type;
    logEntry.boardFrom = priorityMove.board;
    logEntry.cellChosen = priorityMove.cell;
    logEntry.sentOpponentTo = priorityMove.cell;
    logEntry.reason = priorityMove.reason;
    logEntry.score = priorityMove.type === MOVE_ACTIONS.WIN ? 10.0 : 9.8;
    
    // Log the move details
    logAndExportMove(logEntry);
    
    // Execute the priority move
    return executeMove(priorityMove.board, priorityMove.cell);
  }
  
  // PRIORITY 3 & 4: Advanced move evaluation with deep search
  for (let boardIndex of validBoards) {
    // Skip boards that are already won
    if (window.boardWinners[boardIndex]) continue;
    
    const emptyIndices = [];
    for (let i = 0; i < 9; i++) {
      if (window.boards[boardIndex].cells[i].textContent === '') {
        emptyIndices.push(i);
      }
    }
    
    // Skip boards with no empty cells
    if (emptyIndices.length === 0) continue;
    
    // Move ordering for better pruning - prioritize center and corners
    const orderedCells = getOrderedCellIndices(emptyIndices);
    
    // Try each empty cell with move ordering
    for (let cellIndex of orderedCells) {
      // Check if we've exceeded our time limit
      if (Date.now() - startTime > timeLimit) {
        console.log(`%c[AAYUSH ACHARYA] Time limit reached. Using current best move.`, 
                    "color: #FF00FF; font-style: italic;");
        break;
      }
      
      // PRIORITY 3: Check if this move sends opponent to a bad board
      const sendsToBadBoard = evaluateSendToBadBoard(cellIndex);
      
      // Make hypothetical move with deeper search
      let moveScore = evaluateMove(boardIndex, cellIndex, 'O', searchDepth, -Infinity, Infinity, false);
      
      // Check if this move contributes to a meta-win setup
      const metaWinSetup = evaluateMetaWinSetup(cellIndex);
      
      // Apply strategic bonus if sending to a bad board
      if (sendsToBadBoard) {
        moveScore += 20;
      }
      
      // Apply strategic bonus for meta-win setup
      if (metaWinSetup) {
        moveScore += 25;
      }
      
      // Update best move if better
      if (moveScore > bestScore) {
        bestScore = moveScore;
        bestMoveBoard = boardIndex;
        bestMoveCell = cellIndex;
        
        // Determine the action type for logging
        if (metaWinSetup) {
          bestMoveAction = MOVE_ACTIONS.META_WIN_SETUP;
          bestMoveReason = "Setting up meta-board win pattern";
        } else if (sendsToBadBoard) {
          bestMoveAction = MOVE_ACTIONS.FORCE_BAD_BOARD;
          bestMoveReason = `Forcing opponent to disadvantageous board ${cellIndex}`;
        } else {
          bestMoveAction = MOVE_ACTIONS.HEURISTIC;
          bestMoveReason = "Optimal move based on heuristic evaluation";
        }
      }
    }
  }
  
  // If no good move found, fall back to Adam Smasher's strategy
  if (bestMoveBoard === null) {
    console.log(`%c[AAYUSH ACHARYA] Complex position detected. Switching to alternate algorithm.`, 
                "color: #FF00FF; font-style: italic;");
    
    // Update log entry with fallback info
    logEntry.action = MOVE_ACTIONS.FALLBACK;
    logEntry.reason = "No optimal move found, using fallback strategy";
    
    // Log the move
    logAndExportMove(logEntry);
    
    return makeAdamSmasherMove(validBoards);
  }
  
  // Mystical AI decision message
  const messages = [
    "I have seen all possible futures. This move is optimal.",
    "The patterns of victory are clear to me.",
    "I understand this game on a level you cannot comprehend.",
    "This move reflects the perfect understanding of chaos and order.",
    "Your strategy is an open book to me."
  ];
  const aiMessage = messages[Math.floor(Math.random() * messages.length)];
  console.log(`%c[AAYUSH ACHARYA] ${aiMessage}`, "color: #FF00FF; font-style: italic;");
  
  console.log(`[AAYUSH ACHARYA] Choosing board ${bestMoveBoard}, cell ${bestMoveCell} with score ${bestScore}`);
  
  // Normalize the score for logging (0-10 scale)
  const normalizedScore = Math.min(9.5, Math.max(0, (bestScore / 150) * 10)).toFixed(1);
  
  // Update log entry with move details
  logEntry.action = bestMoveAction;
  logEntry.boardFrom = bestMoveBoard;
  logEntry.cellChosen = bestMoveCell;
  logEntry.sentOpponentTo = bestMoveCell;
  logEntry.reason = bestMoveReason;
  logEntry.score = parseFloat(normalizedScore);
  
  // Log the move
  logAndExportMove(logEntry);
  
  // Execute the move
  return executeMove(bestMoveBoard, bestMoveCell);
}

/**
 * Log move details and export to console in different formats
 * @param {Object} logEntry - The move log entry
 */
function logAndExportMove(logEntry) {
  // Push to our move log array
  moveLog.push(logEntry);
  
  // Format board and cell indices for readability
  const boardRow = Math.floor(logEntry.boardFrom / 3);
  const boardCol = logEntry.boardFrom % 3;
  const cellRow = logEntry.cellChosen ? Math.floor(logEntry.cellChosen / 3) : null;
  const cellCol = logEntry.cellChosen ? logEntry.cellChosen % 3 : null;
  const sentToRow = logEntry.sentOpponentTo ? Math.floor(logEntry.sentOpponentTo / 3) : null;
  const sentToCol = logEntry.sentOpponentTo ? logEntry.sentOpponentTo % 3 : null;
  
  // Create console display format
  console.log(`%c[Move ${logEntry.moveNumber}]
- Action: ${logEntry.action}
- From: Board (${boardRow},${boardCol}) Cell (${cellRow},${cellCol})
- Sent Opponent to: Board (${sentToRow},${sentToCol})
- Reason: ${logEntry.reason}
- Score: ${logEntry.score} / 10`, "color: #FF00FF;");

  // Log JSON format for training and analysis
  console.log("Move JSON:", JSON.stringify(logEntry, null, 2));
  
  // Make CSV row available in global scope for export
  const csvRow = `${logEntry.moveNumber},${logEntry.action},${boardRow},${boardCol},${cellRow},${cellCol},${sentToRow},${sentToCol},"${logEntry.reason}",${logEntry.score}`;
  
  // Store in window for external access
  if (!window.aayushMoveLog) {
    window.aayushMoveLog = [];
    window.aayushMoveCSV = "moveNumber,action,boardFromX,boardFromY,cellX,cellY,sentToX,sentToY,reason,score\n";
  }
  
  window.aayushMoveLog.push(logEntry);
  window.aayushMoveCSV += csvRow + "\n";
}

/**
 * Check if a move contributes to a meta-win setup
 * @param {number} cellIndex - The cell index (which becomes next board)
 * @returns {boolean} - True if the move sets up a meta win opportunity
 */
function evaluateMetaWinSetup(cellIndex) {
  // Look for opportunities on the meta board
  for (let pattern of WIN_PATTERNS) {
    // If this cell is part of this pattern
    if (pattern.includes(cellIndex)) {
      // Count how many boards in this pattern are already won by us
      const wonByAI = pattern.filter(i => window.boardWinners[i] === 'O').length;
      
      // If we already have one board in this pattern and opponent hasn't blocked it
      if (wonByAI === 1 && !pattern.some(i => window.boardWinners[i] === 'X')) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Find immediate winning or blocking moves (highest priority)
 * @param {Array} validBoards - Array of valid board indices
 * @returns {Object|null} - { board, cell, type, reason } or null if no priority move found
 */
function findPriorityMove(validBoards) {
  // First priority: Check if any board can be won immediately
  for (let boardIndex of validBoards) {
    if (window.boardWinners[boardIndex]) continue;
    
    const board = createVirtualBoard(boardIndex);
    const winMove = evaluateWinBlock(board, 'O');
    
    if (winMove && winMove.type === 'win') {
      console.log(`%c[AAYUSH ACHARYA] Win opportunity detected on board ${boardIndex}, cell ${winMove.moveIndex}`, 
                 "color: #FF00FF; font-style: italic;");
      
      // Identify the pattern for more detailed logging
      const winPattern = identifyWinPattern(board, winMove.moveIndex, 'O');
      const reason = winPattern ? 
        `Winning move completing ${winPattern} pattern on board ${boardIndex}` : 
        `Winning move on board ${boardIndex}`;
      
      return { 
        board: boardIndex, 
        cell: winMove.moveIndex,
        type: MOVE_ACTIONS.WIN,
        reason: reason
      };
    }
  }
  
  // Second priority: Block opponent's winning moves
  for (let boardIndex of validBoards) {
    if (window.boardWinners[boardIndex]) continue;
    
    const board = createVirtualBoard(boardIndex);
    const blockMove = evaluateWinBlock(board, 'X');
    
    if (blockMove && blockMove.type === 'block') {
      console.log(`%c[AAYUSH ACHARYA] Block opportunity detected on board ${boardIndex}, cell ${blockMove.moveIndex}`, 
                 "color: #FF00FF; font-style: italic;");
      
      // Identify the pattern for more detailed logging
      const blockPattern = identifyWinPattern(board, blockMove.moveIndex, 'X');
      const reason = blockPattern ? 
        `Blocking opponent's ${blockPattern} pattern on board ${boardIndex}` : 
        `Blocking opponent's win on board ${boardIndex}`;
      
      return { 
        board: boardIndex, 
        cell: blockMove.moveIndex,
        type: MOVE_ACTIONS.BLOCK,
        reason: reason
      };
    }
  }
  
  return null;
}

/**
 * Identify which win pattern a move completes or blocks
 * @param {Array} board - Board representation
 * @param {number} moveIndex - Move index
 * @param {string} player - Player symbol ('X' or 'O')
 * @returns {string|null} - Pattern description or null
 */
function identifyWinPattern(board, moveIndex, player) {
  // Make a temporary copy of the board and apply the move
  const tempBoard = [...board];
  tempBoard[moveIndex] = player;
  
  // Check which pattern this move completes
  for (let pattern of WIN_PATTERNS) {
    if (!pattern.includes(moveIndex)) continue;
    
    // If this pattern is completed by this move
    if (pattern.every(i => tempBoard[i] === player)) {
      // Determine pattern type
      if ((pattern[0] === 0 && pattern[1] === 1 && pattern[2] === 2) ||
          (pattern[0] === 3 && pattern[1] === 4 && pattern[2] === 5) ||
          (pattern[0] === 6 && pattern[1] === 7 && pattern[2] === 8)) {
        return "horizontal";
      } else if ((pattern[0] === 0 && pattern[1] === 3 && pattern[2] === 6) ||
                 (pattern[0] === 1 && pattern[1] === 4 && pattern[2] === 7) ||
                 (pattern[0] === 2 && pattern[1] === 5 && pattern[2] === 8)) {
        return "vertical";
      } else if ((pattern[0] === 0 && pattern[1] === 4 && pattern[2] === 8) ||
                 (pattern[0] === 2 && pattern[1] === 4 && pattern[2] === 6)) {
        return "diagonal";
      }
    }
  }
  
  return null;
}

/**
 * Make a strategic move without full depth search (for complex positions)
 * @param {Array} validBoards - Array of valid board indices
 * @param {Object} logEntry - The move log entry to update
 */
function makeStrategicMove(validBoards, logEntry) {
  let bestScore = -Infinity;
  let bestMoveBoard = null;
  let bestMoveCell = null;
  let bestMoveReason = null;
  let bestMoveAction = MOVE_ACTIONS.HEURISTIC;
  
  // Find immediate winning or blocking moves
  const priorityMove = findPriorityMove(validBoards);
  if (priorityMove) {
    // Update log entry with priority move details
    if (logEntry) {
      logEntry.action = priorityMove.type;
      logEntry.boardFrom = priorityMove.board;
      logEntry.cellChosen = priorityMove.cell;
      logEntry.sentOpponentTo = priorityMove.cell;
      logEntry.reason = priorityMove.reason;
      logEntry.score = priorityMove.type === MOVE_ACTIONS.WIN ? 10.0 : 9.8;
      
      // Log the move
      logAndExportMove(logEntry);
    }
    
    return executeMove(priorityMove.board, priorityMove.cell);
  }
  
  // Evaluate each possible move with a simplified heuristic
  for (let boardIndex of validBoards) {
    if (window.boardWinners[boardIndex]) continue;
    
    const board = createVirtualBoard(boardIndex);
    const emptyCells = [];
    
    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        emptyCells.push(i);
      }
    }
    
    if (emptyCells.length === 0) continue;
    
    // Order cells (center, corners, edges)
    const orderedCells = getOrderedCellIndices(emptyCells);
    
    for (let cellIndex of orderedCells) {
      // Create a copy of the board and make the move
      const virtualBoard = [...board];
      virtualBoard[cellIndex] = 'O';
      
      // Base score on position evaluation
      let score = evaluatePosition(virtualBoard, boardIndex, cellIndex, 'O', 'aayushAcharya');
      
      // Check if this sends opponent to a bad board
      const nextBoardQuality = evaluateBoardQuality(cellIndex);
      score += nextBoardQuality;
      let sendsToBadBoard = nextBoardQuality > 0;
      
      // Check for meta-win setup
      const metaWinSetup = evaluateMetaWinSetup(cellIndex);
      if (metaWinSetup) {
        score += 25;
      }
      
      // Bonus for strategic board positioning on the main game board
      const strategicBoardBonus = getStrategicBoardBonus(boardIndex);
      score += strategicBoardBonus;
      
      // Bonus for strategic cell positioning
      const strategicCellBonus = getStrategicCellBonus(cellIndex);
      score += strategicCellBonus;
      
      // Update best move if better
      if (score > bestScore) {
        bestScore = score;
        bestMoveBoard = boardIndex;
        bestMoveCell = cellIndex;
        
        // Determine reason and action type
        if (metaWinSetup) {
          bestMoveAction = MOVE_ACTIONS.META_WIN_SETUP;
          bestMoveReason = "Setting up meta-board win pattern";
        } else if (sendsToBadBoard) {
          bestMoveAction = MOVE_ACTIONS.FORCE_BAD_BOARD;
          if (nextBoardQuality >= 15) {
            bestMoveReason = `Forcing opponent to nearly full board ${cellIndex}`;
          } else if (nextBoardQuality >= 10) {
            bestMoveReason = `Forcing opponent to board ${cellIndex} where we have a winning threat`;
          } else {
            bestMoveReason = `Forcing opponent to disadvantageous board ${cellIndex}`;
          }
        } else {
          bestMoveAction = MOVE_ACTIONS.HEURISTIC;
          
          if (strategicCellBonus > 0) {
            bestMoveReason = `Strategic move targeting meta-board pattern`;
          } else if (strategicBoardBonus >= 8) {
            bestMoveReason = `Taking control of the center board`;
          } else if (strategicBoardBonus >= 5) {
            bestMoveReason = `Taking control of a corner board`;
          } else {
            bestMoveReason = "Optimal move based on heuristic evaluation";
          }
        }
      }
    }
  }
  
  if (bestMoveBoard === null) {
    // Update log entry with fallback info
    if (logEntry) {
      logEntry.action = MOVE_ACTIONS.FALLBACK;
      logEntry.reason = "No optimal move found, using fallback strategy";
      logAndExportMove(logEntry);
    }
    
    return makeAdamSmasherMove(validBoards);
  }
  
  console.log(`[AAYUSH ACHARYA] Strategic move: board ${bestMoveBoard}, cell ${bestMoveCell} with score ${bestScore}`);
  
  // Normalize the score for logging (0-10 scale)
  const normalizedScore = Math.min(9.5, Math.max(0, (bestScore / 100) * 10)).toFixed(1);
  
  // Update log entry with move details
  if (logEntry) {
    logEntry.action = bestMoveAction;
    logEntry.boardFrom = bestMoveBoard;
    logEntry.cellChosen = bestMoveCell;
    logEntry.sentOpponentTo = bestMoveCell;
    logEntry.reason = bestMoveReason;
    logEntry.score = parseFloat(normalizedScore);
    
    // Log the move
    logAndExportMove(logEntry);
  }
  
  return executeMove(bestMoveBoard, bestMoveCell);
}

/**
 * Order cell indices by strategic importance (center, corners, edges)
 * @param {Array} emptyCells - Array of empty cell indices
 * @returns {Array} - Ordered array of cell indices
 */
function getOrderedCellIndices(emptyCells) {
  const orderedCells = [];
  
  // Center first (index 4)
  if (emptyCells.includes(4)) orderedCells.push(4);
  
  // Then corners (indices 0, 2, 6, 8)
  [0, 2, 6, 8].forEach(corner => {
    if (emptyCells.includes(corner)) orderedCells.push(corner);
  });
  
  // Then edges (indices 1, 3, 5, 7)
  [1, 3, 5, 7].forEach(edge => {
    if (emptyCells.includes(edge)) orderedCells.push(edge);
  });
  
  return orderedCells;
}

/**
 * Evaluate if sending opponent to a particular board is advantageous
 * @param {number} cellIndex - Cell index (which becomes the next board)
 * @returns {number} - Negative score for bad boards (good for us)
 */
function evaluateSendToBadBoard(cellIndex) {
  // If the board is already won, it's a free move for opponent (bad for us)
  if (window.boardWinners[cellIndex]) {
    return false;
  }
  
  // Check if board is almost full (good for us)
  const board = createVirtualBoard(cellIndex);
  const emptyCount = board.filter(cell => cell === '').length;
  
  if (emptyCount <= 2) {
    return true;
  }
  
  // Check if we have a winning threat on this board (good for us)
  for (let pattern of WIN_PATTERNS) {
    const line = pattern.map(i => board[i]);
    
    // If we have two of three cells and the third is empty, opponent must block
    if (line.filter(cell => cell === 'O').length === 2 && 
        line.filter(cell => cell === '').length === 1) {
      return true;
    }
  }
  
  return false;
}

/**
 * Evaluate the quality of a board from the opponent's perspective
 * @param {number} boardIndex - Board index
 * @returns {number} - Negative score for bad boards (good for us) from -30 to +10
 */
function evaluateBoardQuality(boardIndex) {
  // If the board is already won, it's a free move for opponent (bad for us)
  if (window.boardWinners[boardIndex]) {
    return -30;
  }
  
  const board = createVirtualBoard(boardIndex);
  
  // Check if board is almost full (good for us, bad for opponent)
  const emptyCount = board.filter(cell => cell === '').length;
  if (emptyCount <= 1) return 15;
  if (emptyCount <= 2) return 10;
  
  // Check if we have a winning threat on this board (good for us)
  for (let pattern of WIN_PATTERNS) {
    const line = pattern.map(i => board[i]);
    
    // If we have two of three cells and the third is empty, opponent must block
    if (line.filter(cell => cell === 'O').length === 2 && 
        line.filter(cell => cell === '').length === 1) {
      return 20;
    }
  }
  
  // Check if opponent has a winning threat (bad for us to send them there)
  for (let pattern of WIN_PATTERNS) {
    const line = pattern.map(i => board[i]);
    
    // If opponent has two of three cells and the third is empty, bad to send them there
    if (line.filter(cell => cell === 'X').length === 2 && 
        line.filter(cell => cell === '').length === 1) {
      return -20;
    }
  }
  
  // Otherwise neutral
  return 0;
}

/**
 * Get bonus for strategically important boards on the meta game board
 * @param {number} boardIndex - Board index 
 * @returns {number} - Strategic importance bonus
 */
function getStrategicBoardBonus(boardIndex) {
  // Center board is most valuable
  if (boardIndex === 4) return 8;
  
  // Corner boards are next valuable
  if ([0, 2, 6, 8].includes(boardIndex)) return 5;
  
  // Edge boards are least valuable
  return 2;
}

/**
 * Get bonus for strategically important cells within a board
 * @param {number} cellIndex - Cell index
 * @returns {number} - Strategic importance bonus
 */
function getStrategicCellBonus(cellIndex) {
  // Count boards won by each player to assess main board state
  const aiWins = window.boardWinners.filter(w => w === 'O').length;
  const playerWins = window.boardWinners.filter(w => w === 'X').length;
  
  // Look for opportunities to create win threats on the main board
  for (let pattern of WIN_PATTERNS) {
    // If this cell is part of this pattern
    if (pattern.includes(cellIndex)) {
      // Count how many boards in this pattern are already won by us
      const wonByAI = pattern.filter(i => window.boardWinners[i] === 'O').length;
      
      // If we already have one board in this pattern, prioritize moves in the same line
      if (wonByAI === 1 && !pattern.some(i => window.boardWinners[i] === 'X')) {
        return 12; // High priority - potential winning line
      }
      // If we already have two boards in this pattern, extremely high priority
      else if (wonByAI === 2) {
        return 25; // Critical priority - one move from winning game
      }
    }
  }
  
  // If opponent has a winning threat, block it
  for (let pattern of WIN_PATTERNS) {
    if (pattern.includes(cellIndex)) {
      const wonByPlayer = pattern.filter(i => window.boardWinners[i] === 'X').length;
      if (wonByPlayer === 2) {
        return 22; // Critical defensive priority
      }
    }
  }
  
  return 0;
}

/**
 * Enhanced minimax with alpha-beta pruning and sophisticated evaluation
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
    // Enhanced position evaluation
    let score = evaluatePosition(virtualBoard, boardIndex, cellIndex, player, 'aayushAcharya');
    
    // Add strategic considerations for next board
    if (player === 'O') {
      // Evaluate if we're sending opponent to a bad board
      score += evaluateBoardQuality(cellIndex) * 0.5;
    }
    
    return score;
  }
  
  const nextPlayer = player === 'O' ? 'X' : 'O';
  
  // Determine if next move targets a specific board
  let nextValidBoard = window.boardWinners[cellIndex] ? -1 : cellIndex;
  let nextBoardCandidates = nextValidBoard === -1 ? 
    window.boardWinners.map((w, i) => w ? null : i).filter(i => i !== null) : 
    [nextValidBoard];
  
  // Remove boards that are already won or full
  nextBoardCandidates = nextBoardCandidates.filter(i => {
    // Skip already won boards
    if (window.boardWinners[i]) return false;
    
    // Skip full boards
    const board = createVirtualBoard(i);
    return board.some(cell => cell === '');
  });
  
  // Progressive deepening - reduce depth for complex branching
  let adjustedDepth = depth;
  if (nextBoardCandidates.length > 2 && depth > 3) {
    adjustedDepth = 3; // Cap depth for complex positions
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
      
      // Order cells for better pruning
      const orderedCells = getOrderedCellIndices(emptyCells);
      
      // Try each empty cell in this board (with move ordering)
      for (let nextCell of orderedCells) {
        const score = evaluateMove(nextBoard, nextCell, nextPlayer, adjustedDepth - 1, alpha, beta, false);
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
      
      // Order cells for better pruning
      const orderedCells = getOrderedCellIndices(emptyCells);
      
      // Try each empty cell in this board (with move ordering)
      for (let nextCell of orderedCells) {
        const score = evaluateMove(nextBoard, nextCell, nextPlayer, adjustedDepth - 1, alpha, beta, true);
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