# Ultimate Tic Tac Toe - Night City Edition

![Game Screenshot](assets/images/cyberpunklogo1.png)

A cyberpunk-themed Ultimate Tic Tac Toe game inspired by the dystopian future of Night City. This advanced version of Tic Tac Toe features a meta-game with 9 small boards where your move determines your opponent's playing area.

## Features

- 🎮 **Ultimate Tic Tac Toe** gameplay with strategic depth
- 🤖 **Multiple AI opponents** with varying difficulty levels
- 👤 **Character selection** with iconic cyberpunk personalities
- 🎵 **Dynamic soundtrack** with cyberpunk-themed music
- 🔊 **Immersive sound effects** for all game actions
- 💻 **Cyberpunk UI** with glitch effects and neon styling
- 📊 **AI Move Analysis** system for tracking and exporting decision data

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, etc.)
- Node.js (optional, for local development server)

### Installation

1. Clone this repository or download the ZIP file:
   ```
   git clone https://github.com/acharya-aayush/ultimate-tictactoe-nightcity.git
   ```

2. Navigate to the project directory:
   ```
   cd ultimate-tictactoe-nightcity
   ```

3. Start a local development server (optional but recommended):
   ```
   npx http-server -c-1
   ```
   
   Or simply open `index.html` in your browser (note: some browsers may block module loading when running directly from the filesystem).

## How to Play

### Game Rules

1. The game consists of a 3x3 grid of smaller 3x3 Tic Tac Toe boards.
2. Win a small board by getting three in a row (horizontally, vertically, or diagonally).
3. Win the game by winning three small boards in a row.
4. Your move determines which small board your opponent must play in next.
5. If your opponent is sent to a board that's already won or full, they can play in any available board.

### Controls

- 🖱️ **Click** on a cell in an active board to place your marker
- 🔊 Toggle game music and sound effects with the controls in the bottom right
- 📊 Export AI move data (when playing against Aayush AI)
- 🔄 Use the emergency reset button if needed

### Game Modes

- **2 Players**: Play against a friend locally
- **VS AI**: Challenge one of the four AI opponents:
  - **Royce** (Easy): Makes mostly random moves
  - **Goro** (Medium): Basic strategic capability
  - **Adam Smasher** (Hard): Advanced gameplay with tactical awareness
  - **Aayush Acharya** (Extreme): Expert-level play with advanced prioritization strategy:
      - Prioritizes winning moves in the current board
      - Blocks opponent's winning moves
      - Forces opponent to disadvantageous boards
      - Uses sophisticated strategic heuristics

### AI Move Logging

When playing against the Aayush AI, detailed move analytics are recorded:

- **Decision Classification**: Each move is categorized by type (Win, Block, Force Bad Board, etc.)
- **Strategic Reasoning**: The AI's reasoning for each move is documented
- **Data Export**: Export game data in JSON or CSV format for analysis
- **Access**: Click the 📊 button in the controls to view and export move data

## Developer Notes

For detailed documentation of the codebase, game mechanics, and architecture, see [documentation.md](documentation.md).

### Project Structure

```
tictac/
├── assets/          # Game assets (images, audio)
├── css/             # Additional stylesheets
├── js/              # JavaScript modules
│   ├── ai/          # AI opponent logic
│   ├── components/  # Game components
│   └── utils/       # Utility functions
├── index.html       # Main HTML file
├── audio.js         # Audio system
├── script.js        # Main script
└── style.css        # Main stylesheet
```

### Local Development

To start a development server that automatically reloads when files are changed:

```
npx http-server -c-1 -o
```

### Known Issues

- Audio may not play on first interaction in some browsers
- Safari may require additional configuration for module support
- ES6 modules won't work when opening the file directly - use a web server

## Credits

- Cyberpunk theming inspired by CD Projekt Red's Cyberpunk 2077
- Original Ultimate Tic Tac Toe concept by Mathew Sisson
- Game implementation by [Your Name]

## License

This project is licensed under the MIT License - see the LICENSE file for details. 