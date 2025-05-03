/**
 * Game constants and initial values
 */

// Game state variables
export const INITIAL_STATE = {
  gameMode: 'ai',
  currentPlayer: 'X',
  nextBoard: -1,
  boardWinners: Array(9).fill(''),
  score: { X: 0, O: 0, draw: 0 },
  player1Name: 'Johnny Silverhand',
  player2Name: 'Adam Smasher',
  player1Avatar: 'johnny1',
  player2Avatar: 'adam',
  gameInProgress: false,
  disableWinAnimation: false,
  johnnySilverlandChance: 0.1, // Chance for Johnny to appear (10%)
  aiDifficulty: 'hard', // AI difficulty: 'easy', 'medium', or 'hard'
  player1Character: 'johnny1',
  player2Character: 'adam',
  player1Record: [0, 0, 0], // wins, losses, draws
  player2Record: [0, 0, 0],  // wins, losses, draws
  selectedAIBot: 'adamSmasher' // Default AI bot
};

// Avatar image paths
export const AVATAR_PATHS = {
  // Player characters
  johnny1: 'assets/images/jspfp1.png',
  johnny2: 'assets/images/jspfp2.png',
  judy1: 'assets/images/judypfp1.png',
  judy2: 'assets/images/judypfp2.png',
  lucy1: 'assets/images/lucypfp1.png',
  lucy2: 'assets/images/lucypfp2.png',
  david1: 'assets/images/davidpfp1.png',
  david2: 'assets/images/davidpfp2.png',
  panam1: 'assets/images/panampfp1.png',
  panam2: 'assets/images/panampfp2.png',
  rebecca1: 'assets/images/rebeccapfp1.png',
  rebecca2: 'assets/images/rebeccapfp2.png',
  
  // AI opponents
  adam: 'assets/ai/adamSmasher.png',
  adamSmasher: 'assets/ai/adamSmasher.png',
  royce: 'assets/ai/royce.png',
  goro: 'assets/ai/goro.png',
  aayush: 'assets/ai/aayush.png'
};

// Character names
export const CHARACTER_NAMES = {
  // Player characters
  'johnny1': 'Johnny Silverhand',
  'johnny2': 'Johnny Silverhand',
  'judy1': 'Judy Alvarez',
  'judy2': 'Judy Alvarez',
  'lucy1': 'Lucy',
  'lucy2': 'Lucy',
  'david1': 'David Martinez',
  'david2': 'David Martinez',
  'rebecca1': 'Rebecca',
  'rebecca2': 'Rebecca',
  'panam1': 'Panam Palmer',
  'panam2': 'Panam Palmer',
  
  // AI opponents
  'adam': 'Adam Smasher',
  'adamSmasher': 'Adam Smasher',
  'royce': 'Royce',
  'goro': 'Goro',
  'aayush': 'Aayush Acharya'
};

// Winning patterns for mini-boards and main board
export const WIN_PATTERNS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

// Initialize global state
export function initGlobalState() {
  // Expose constants to window for compatibility with existing code
  window.avatarPaths = AVATAR_PATHS;
  window.characterNames = CHARACTER_NAMES;
  
  // Initialize game state variables
  window.gameMode = INITIAL_STATE.gameMode;
  window.currentPlayer = INITIAL_STATE.currentPlayer;
  window.nextBoard = INITIAL_STATE.nextBoard;
  window.boards = [];
  window.boardWinners = [...INITIAL_STATE.boardWinners];
  window.score = {...INITIAL_STATE.score};
  window.player1Name = INITIAL_STATE.player1Name;
  window.player2Name = INITIAL_STATE.player2Name;
  window.player1Avatar = INITIAL_STATE.player1Avatar;
  window.player2Avatar = INITIAL_STATE.player2Avatar;
  window.gameInProgress = INITIAL_STATE.gameInProgress;
  window.disableWinAnimation = INITIAL_STATE.disableWinAnimation;
  window.johnnySilverlandChance = INITIAL_STATE.johnnySilverlandChance;
  window.aiDifficulty = INITIAL_STATE.aiDifficulty;
  window.player1Character = INITIAL_STATE.player1Character;
  window.player2Character = INITIAL_STATE.player2Character;
  window.player1Record = [...INITIAL_STATE.player1Record];
  window.player2Record = [...INITIAL_STATE.player2Record];
  window.selectedAIBot = INITIAL_STATE.selectedAIBot;
} 