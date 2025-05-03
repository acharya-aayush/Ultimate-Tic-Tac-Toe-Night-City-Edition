# Ultimate Tic Tac Toe - Night City Edition Documentation

## Overview
Ultimate Tic Tac Toe (Night City Edition) is an advanced version of the classic Tic Tac Toe game with a cyberpunk theme inspired by the world of Night City. The game features a 3x3 grid of smaller 3x3 Tic Tac Toe boards, creating a meta-game where winning three small boards in a line secures overall victory.

## Game Mechanics

### Basic Rules
1. **Board Structure**: The game consists of a 3x3 grid of smaller 3x3 Tic Tac Toe boards (9 small boards in total).
2. **Player Turn**: Players alternate turns placing their marker (X or O) on one of the small boards.
3. **Board Selection**: After a player makes a move, the next player must play in the small board corresponding to the cell position of the previous move.
4. **Free Move**: If a player is directed to a board that is already won or full, they may play in any available board.
5. **Winning Small Boards**: Win a small board by getting three of your markers in a row (horizontally, vertically, or diagonally).
6. **Winning the Game**: Win the overall game by winning three small boards in a row.
7. **Draw**: The game ends in a draw if all small boards are either won or drawn and no player has three in a row.

### Game Modes
- **Player vs Player**: Local 2-player mode
- **Player vs AI**: Play against AI opponents of varying difficulty:
  - Royce (Easy)
  - Goro (Medium)
  - Adam Smasher (Hard)
  - Aayush Acharya (Extreme)

## Project Structure

### Directory Layout
```
tictac/
├── assets/
│   ├── ai/                  # AI opponent images
│   ├── audio/               # Game sound effects and music
│   └── images/              # Character avatars and UI elements
├── css/                     # Additional CSS files (if any)
├── js/
│   ├── ai/                  # AI opponent logic
│   │   ├── bots/            # Individual AI implementations
│   │   ├── ai.js            # AI system wrapper
│   │   ├── engine.js        # AI decision engine
│   │   └── moveSelector.js  # AI move selection logic
│   ├── components/          # Core game components
│   │   ├── game.js          # Main game logic
│   │   └── players.js       # Player management
│   ├── utils/               # Utility functions
│   │   ├── constants.js     # Game constants and initial state
│   │   ├── glitchEffects.js # Visual effects for cyberpunk theme
│   │   └── ui.js            # UI manipulation functions
│   └── main.js              # Main application entry point
├── index.html               # Main HTML file
├── audio.js                 # Audio system
├── script.js                # Main script file (module loader)
└── style.css                # Main CSS file
```

## Key Components

### HTML Structure (index.html)
- **Game Header**: Logo and title with cyberpunk styling
- **Player Setup**: Character selection cards for both players
- **Game Mode Selection**: 2-player or AI opponent modes
- **AI Selection**: Visual selector for AI opponents
- **Game Board**: Main board with 9 mini-boards
- **Side Panels**: Player avatars and scores
- **Sound Controls**: Music and sound effect toggles

### CSS (style.css)
- Cyberpunk-themed styling with neon colors
- Responsive design for different screen sizes
- Visual effects like glitches and animations
- Board and cell styling with hover and active states
- AI selector UI component styling

### Game Logic (js/components/game.js)
- **startGame()**: Initializes the game with selected mode
- **resetGame()**: Resets the board for a new game
- **handleMove()**: Processes player moves
- **checkMiniWin()**: Checks if a mini-board is won
- **checkGameWin()**: Checks if the overall game is won
- **handleBoardWin()**: Processes a won mini-board
- **updateHighlight()**: Highlights active boards
- **checkForDraw()**: Checks for game draw
- **continueGame()**: Continues after game ends
- **backToSetup()**: Returns to the setup screen

### Player Management (js/components/players.js)
- **updateScoreboard()**: Updates player scores and records
- **updatePlayerUI()**: Updates active player indicators
- **updatePlayerSidePanel()**: Updates side panels with player info
- **initializePlayers()**: Initializes player data

### AI System (js/ai/engine.js)
- **initAI()**: Initializes the AI system
- **selectAIDifficulty()**: Selects AI difficulty
- **aiMove()**: Dispatches AI move to appropriate bot
- **getValidBoards()**: Gets all valid boards for moves
- **executeMove()**: Executes a move on the game board
- **updateAISelector()**: Updates the AI selector UI

### AI Implementation Details

#### Aayush Acharya AI (Extreme Difficulty)
The Aayush Acharya AI uses an advanced strategic approach with a multi-tier decision-making process:

1. **Strategic Prioritization**:
   - **Priority 1**: Win the current board if possible
   - **Priority 2**: Block opponent's winning moves
   - **Priority 3**: Force opponent to disadvantageous boards
   - **Priority 4**: Apply sophisticated heuristic evaluation

2. **Technical Implementation**:
   - **findPriorityMove()**: Instantly identifies winning and blocking opportunities
   - **evaluateSendToBadBoard()**: Evaluates whether a move sends opponent to a disadvantageous board
   - **makeStrategicMove()**: Provides fast decision-making for complex positions
   - **evaluateBoardQuality()**: Assesses the strategic value of sending opponent to a specific board
   - **getStrategicBoardBonus()**: Assigns value to strategically important boards (center, corners)
   - **getStrategicCellBonus()**: Evaluates cells that create winning opportunities at the meta-board level

3. **Search Algorithm**:
   - Enhanced minimax with alpha-beta pruning
   - Dynamic search depth adjustment based on position complexity
   - Cell move ordering optimization to improve pruning efficiency
   - Time-limited search to ensure responsive gameplay

4. **Heuristic Evaluation**:
   - Board control assessment
   - Meta-game strategic evaluation
   - Win pattern detection on both small boards and the meta-board
   - Progressive board analysis that considers forcing moves

5. **Performance Optimizations**:
   - Smart fallback for complex positions with many options
   - Prioritized evaluation of critical moves
   - Time-limited computation to ensure responsive gameplay

### AI Move Logging System

The Aayush AI includes a comprehensive move logging system designed to record, analyze, and export detailed information about the AI's decision-making process. This system aids in AI development and could support future machine learning improvements.

1. **Logging Functionality**:
   - **Move Action Classification**: Each move is classified by type (WIN, BLOCK, FORCE_BAD_BOARD, META_WIN_SETUP, HEURISTIC, FALLBACK)
   - **Detailed Reasoning**: Records specific reasoning for each move (e.g., "Blocking opponent's horizontal pattern on board 4")
   - **Numerical Scoring**: Assigns a normalized score (0-10 scale) to reflect move quality
   - **Board and Cell Tracking**: Records source board, target cell, and where the opponent is sent
   - **Sequential Numbering**: Tracks move sequence for reconstructing game flow

2. **Data Formats**:
   - **Console Output**: Real-time move details are logged to the console for debugging
   - **JSON Export**: Structured data format for machine learning and advanced analysis
   - **CSV Export**: Tabular format for spreadsheet analysis and data visualization
   
3. **Sample Move Log Entry**:
   ```json
   {
     "moveNumber": 23,
     "action": "BLOCK",
     "boardFrom": 7,
     "cellChosen": 2,
     "sentOpponentTo": 2,
     "reason": "Blocking opponent's horizontal pattern on board 7",
     "score": 9.8,
     "timestamp": 1623456789000
   }
   ```

4. **Export Interface**:
   - **UI Button**: Accessible via the 📊 button in the game controls
   - **Format Options**: Choose between JSON or CSV output
   - **Preview Feature**: View recent moves before exporting
   - **Download Function**: Generates downloadable file for offline analysis

5. **Future Applications**:
   - Training supervised machine learning models
   - Feeding game data to reinforcement learning algorithms
   - Analyzing strategic patterns and move tendencies
   - Benchmarking AI performance against human players

6. **Implementation Details**:
   - **logAndExportMove()**: Core function that processes and formats move data
   - **identifyWinPattern()**: Determines specific patterns in winning or blocking moves
   - **evaluateMetaWinSetup()**: Identifies moves that set up winning patterns on the meta-board
   - **Global Access**: Data available via window.aayushMoveLog and window.aayushMoveCSV
   - **Export API**: Functions like window.downloadAayushMoveLog() for programmatic access

### Constants (js/utils/constants.js)
- **INITIAL_STATE**: Initial game state
- **AVATAR_PATHS**: Paths to player and AI avatars
- **CHARACTER_NAMES**: Names for all characters
- **WIN_PATTERNS**: Winning patterns for boards
- **initGlobalState()**: Initializes global state

### Audio System (audio.js)
- Music tracks for gameplay
- Sound effects for moves, wins, and UI interactions
- Background audio management

## Recent Bug Fixes

### Game Freezing After Second Board Win
- **Issue**: Game would freeze after a player won 2 small boards
- **Root Cause**: 
  - Improper handling of next board targeting
  - Race conditions in updateHighlight function
  - Lack of proper board state validation
- **Fixes**:
  1. Added detailed debugging logs to trace game state
  2. Improved board state validation in handleMove
  3. Updated logic in updateHighlight to properly handle all scenarios
  4. Fixed race conditions by removing setTimeout for UI updates
  5. Added proper handling when next board is already won
  6. Improved win detection in checkGameWin
  7. Added guards to prevent multiple updates to gameInProgress

### AI Selector UI Implementation
- **Feature**: Added visual selector for AI opponents
- **Changes**:
  1. Added HTML markup for AI selector with images
  2. Added CSS styling for selector components
  3. Implemented JavaScript to handle AI selection
  4. Updated AI avatar display in game
  5. Added mapping between difficulty levels and AI characters

### Aayush AI Enhancement
- **Feature**: Improved the extreme difficulty AI with advanced strategic planning
- **Changes**:
  1. Implemented prioritized decision-making hierarchy
  2. Added immediate win and block detection
  3. Enhanced board quality evaluation for forcing opponent to bad positions
  4. Implemented strategic meta-board analysis
  5. Added performance optimizations for complex positions
  6. Improved minimax search with better move ordering
  7. Added comprehensive move logging and export system for analysis

## Game Flow

1. **Initialization**:
   - Load assets and initialize audio
   - Set up initial game state

2. **Character Selection**:
   - Players select their characters
   - Character data is stored in game state

3. **Game Mode Selection**:
   - Player selects 2-player or AI mode
   - If AI mode, player selects AI opponent

4. **Game Start**:
   - Board is created with 9 mini-boards
   - Player 1 (X) starts with a free move

5. **Turn Flow**:
   - Current player makes a move
   - Move is validated and processed
   - Mini-board win is checked
   - Game win is checked
   - Next player's turn is prepared
   - AI makes a move if in AI mode

6. **Game End Conditions**:
   - One player wins three mini-boards in a line
   - All mini-boards are either won or drawn

7. **Post-Game**:
   - Winner is displayed
   - Scores are updated
   - Player can continue or return to setup
   - Option to export AI move data (if playing against Aayush)

## Development Notes

### Browser Compatibility
- The game uses modern JavaScript features and ES modules
- Requires a modern browser with ES6 support
- Audio system requires user interaction to initialize due to browser policies
- Game must be served via HTTP server due to ES6 module security restrictions

### Performance Considerations
- Animations are disabled for certain character names (e.g., "Aayush")
- Audio preloading to prevent lag during gameplay
- Debounced event handlers to prevent performance issues
- AI computation time limits to ensure responsive gameplay

### Future Enhancements
- Online multiplayer support
- Additional AI opponents
- More character customization options
- Save/load game functionality
- Additional visual themes
- Machine learning integration using collected move data

## Credits
- Character art and theming inspired by Cyberpunk 2077
- Sound effects and music from royalty-free sources
- Game logic implemented with vanilla JavaScript 