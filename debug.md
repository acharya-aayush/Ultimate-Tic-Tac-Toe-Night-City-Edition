# Debugging Guide - Ultimate Tic Tac Toe

This guide provides troubleshooting steps and debugging strategies for common issues in the Ultimate Tic Tac Toe game.

## Setting Up for Debugging

### Local Development Server

Always use a local development server when debugging to avoid CORS issues with modules:

```bash
npx http-server -c-1
```

### Browser Dev Tools

1. Open your browser's Developer Tools (F12 or Ctrl+Shift+I)
2. Navigate to the Console tab to view logs
3. Use the Network tab to verify asset loading
4. Use the Elements tab to inspect the DOM

### Enabling Debug Mode

To enable extensive debugging logs, add the following to the URL:

```
?debug=true
```

Example: `http://localhost:8080/index.html?debug=true`

## Common Issues and Solutions

### Game Freezes After Specific Actions

If the game freezes after certain actions (like winning a mini-board):

1. Check the console logs for errors or warning messages
2. Verify the `gameInProgress` flag isn't being set incorrectly:
   ```javascript
   console.log(`[DEBUG] Game state: gameInProgress=${window.gameInProgress}`);
   ```
3. Check if `nextBoard` is being set to a valid value:
   ```javascript
   console.log(`[DEBUG] Next board set to: ${window.nextBoard}`);
   ```
4. Ensure any won/full boards are properly handled when redirecting the next move

### AI Not Making Moves

If the AI is not making moves when expected:

1. Check if the correct AI bot is selected:
   ```javascript
   console.log(`AI Bot Selected: ${window.selectedAIBot}`);
   ```
2. Verify the AI function is being called:
   ```javascript
   // Add to appropriate section
   console.log("Calling AI move function");
   ```
3. Check for errors in the AI move selection code
4. Ensure the `currentPlayer` is correctly set to 'O' for AI turn

### Board State Validation Issues

For problems with board state validation:

1. Log the board winners array:
   ```javascript
   console.log("Board Winners:", window.boardWinners);
   ```
2. Log valid move targets:
   ```javascript
   console.log(`Valid Targets: ${validBoards.join(", ")}`);
   ```
3. Check the `updateHighlight` function for correct board highlighting
4. Verify win detection logic in `checkMiniWin` and `checkGameWin`

### Event Handler Issues

For click event problems:

1. Check if event handlers are properly attached to cells
2. Verify cell click events aren't being blocked
3. Test if the game state is allowing moves
4. Check for CSS issues that might make elements unclickable

## Debugging Specific Game Components

### Game Board State

To debug the game board state:

```javascript
function debugBoardState() {
  console.log("------- BOARD STATE -------");
  console.log("Current Player:", window.currentPlayer);
  console.log("Next Board:", window.nextBoard);
  console.log("Game In Progress:", window.gameInProgress);
  console.log("Board Winners:", window.boardWinners);
  
  // Log state of each mini-board
  window.boards.forEach((board, i) => {
    const cells = board.cells.map(c => c.textContent || ' ').join('');
    console.log(`Board ${i}: ${cells} | Winner: ${window.boardWinners[i] || 'none'}`);
  });
  console.log("---------------------------");
}
```

Add this function and call it at strategic points.

### Move Validation

To debug move validation:

```javascript
function debugMoveValidation(boardIndex, cellIndex) {
  const valid = isValidMove(boardIndex, cellIndex);
  console.log(`Move Validation: board=${boardIndex}, cell=${cellIndex}, valid=${valid}`);
  if (!valid) {
    if (!window.gameInProgress) console.log("- Game not in progress");
    if (window.boardWinners[boardIndex]) console.log("- Board already won");
    if (window.boards[boardIndex].cells[cellIndex].textContent) console.log("- Cell occupied");
    if (window.nextBoard !== -1 && boardIndex !== window.nextBoard) console.log("- Wrong board");
  }
}
```

### Win Detection

To debug win detection:

```javascript
function debugWinCheck(player) {
  console.log(`Checking Win for ${player}`);
  console.log(`Board Winners: ${window.boardWinners}`);
  
  WIN_PATTERNS.forEach((pattern, i) => {
    const line = [
      window.boardWinners[pattern[0]],
      window.boardWinners[pattern[1]],
      window.boardWinners[pattern[2]]
    ];
    console.log(`Pattern ${i}: ${pattern.join(',')} = ${line.join(',')}`);
  });
}
```

## Adding Debug Logs

Here are strategic places to add logs:

1. **In handleMove():**
   ```javascript
   console.log(`[MOVE] Player ${window.currentPlayer}, board=${bi}, cell=${ci}`);
   ```

2. **Before/after updateHighlight():**
   ```javascript
   console.log(`Updating highlights, nextBoard=${window.nextBoard}`);
   ```

3. **In checkGameWin():**
   ```javascript
   console.log(`Checking if ${player} has won the game`);
   ```

4. **In handleBoardWin():**
   ```javascript
   console.log(`Board ${boardIndex} won by ${player}`);
   ```

## Audio Debugging

If audio issues occur:

1. Check if audio files are properly loaded:
   ```javascript
   console.log("Audio files loaded:", window.audioSystem.loadedFiles);
   ```

2. Verify user interaction has unlocked audio:
   ```javascript
   console.log("Audio context state:", window.audioSystem.audioContext.state);
   ```

3. Check if audio is muted:
   ```javascript
   console.log("Audio muted:", window.audioSystem.muted);
   ```

## Performance Issues

For performance problems:

1. Use the Performance tab in Developer Tools to profile execution
2. Check for excessive DOM updates
3. Look for memory leaks with frequent object creation
4. Optimize animation and audio triggers

## CSS/Layout Issues

For UI and display problems:

1. Use the Elements panel to inspect element classes
2. Verify correct CSS is being applied
3. Check responsive design breakpoints
4. Validate dynamic class addition/removal

## Common Error Messages

| Error Message | Likely Cause | Solution |
|---------------|--------------|----------|
| Cannot read property 'cells' of undefined | Invalid board reference | Check board creation and array indices |
| CORS policy | Loading modules via file:// | Use a local development server |
| Uncaught SyntaxError: Cannot use import statement outside a module | Script tag missing type="module" | Add type="module" to script tags |
| Failed to load audio | Missing audio files | Check file paths and audio loading code |
| Cannot read property 'textContent' of null | Invalid cell reference | Verify DOM elements exist before access |

## Useful Debug Snippets

### Print Game State
```javascript
console.log(JSON.stringify({
  currentPlayer: window.currentPlayer,
  nextBoard: window.nextBoard,
  gameInProgress: window.gameInProgress,
  boardWinners: window.boardWinners
}, null, 2));
```

### Test AI Move
```javascript
// Force AI to make a move
window.currentPlayer = 'O';
window.aiMove();
```

### Reset Game State
```javascript
// Reset game state manually
window.gameInProgress = true;
window.currentPlayer = 'X';
window.nextBoard = -1;
window.boardWinners = Array(9).fill('');
resetGame();
```

## Contact

If you encounter persistent issues after following this guide, please file an issue in the project repository with the following information:

1. Detailed description of the problem
2. Steps to reproduce
3. Console logs and errors
4. Browser and OS information
5. Screenshots if applicable 