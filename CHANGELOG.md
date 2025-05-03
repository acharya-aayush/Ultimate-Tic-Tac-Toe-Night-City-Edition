# Changelog

All notable changes to the Ultimate Tic Tac Toe - Night City Edition project will be documented in this file.

## [1.2.2] - 2025-04-25

### Changed
- Modified Aayush AI unlock mechanism to use sessionStorage instead of localStorage
- Aayush AI now resets to hidden state every time the page is refreshed
- Added explicit initialization to ensure Aayush always starts locked

### Fixed
- Issue where Aayush AI would remain permanently unlocked across sessions
- Force Aayush option to be hidden on every page load, regardless of previous unlock status

## [1.2.1] - 2025-04-25

### Fixed
- Properly hidden Aayush AI option that's now only revealed after unlocking
- Fixed styling issue with Aayush profile picture in the AI selection menu
- Improved unlock mechanism when defeating Adam Smasher or clicking the developer credit
- Enhanced visual feedback during the unlock animation

### Note for Implementation
If the Aayush AI unlock mechanism is still not working properly, verify the following:
1. The sessionStorage implementation is working correctly (check browser session storage)
2. The click event listener on the developer credit is properly counting clicks (see script.js)
3. The recordAdamSmasherDefeat function is being called when a player defeats Adam Smasher (see js/components/game.js)
4. The visibility toggle of the Aayush AI option is working as expected (check element display property)

## [1.2.0] - 2025-04-24

### Added
- Visual AI selector UI with character thumbnails
- Additional AI opponent images in assets/ai directory
- Enhanced logging system for better debugging
- Improved board state validation

### Fixed
- Critical bug that caused game to freeze after winning second small board
- Race conditions in updateHighlight function
- Improved handling when next board is already won or full
- Fixed UI not updating correctly when redirecting to won/full boards

### Changed
- Removed setTimeout for highlight updates to prevent race conditions
- Enhanced win detection with detailed logging
- Updated AI avatar display in game
- Improved win detection in checkGameWin function

## [1.1.0] - 2025-04-22

### Added
- Cyberpunk themed UI with neon styling
- Character selection with Cyberpunk 2077 inspired characters
- Sound effects and background music
- Four AI difficulty levels with distinct personalities

### Fixed
- Cell click event handlers properly handling game state
- Scoreboard not updating correctly after a win
- Mini-board highlight logic on draw conditions

### Changed
- Redesigned game UI with side avatars
- Enhanced visual effects for wins and moves
- Improved AI opponent decision making

## [1.0.0] - 2025-04-15

### Initial Release
- Basic Ultimate Tic Tac Toe gameplay
- Player vs Player mode
- Player vs AI mode with simple AI
- Win detection for small and large boards
- Basic UI with minimal styling 