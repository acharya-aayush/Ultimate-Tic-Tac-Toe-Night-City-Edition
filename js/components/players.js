/**
 * Player management and UI updates
 */

// Update all scoreboard elements - Now only updates side avatars, not top scoreboard
export function updateScoreboard() {
  // Update player 1 record
  updatePlayerSidePanel(1, window.player1Name, window.player1Character, window.player1Record);
  
  // Update player 2 record
  updatePlayerSidePanel(2, window.player2Name, window.player2Character, window.player2Record);
}

// Helper function to update player side panels
function updatePlayerSidePanel(playerNum, playerName, playerCharacter, playerRecord) {
  const sideNameElement = document.getElementById(`sideName${playerNum}`);
  const sideAvatar = document.getElementById(`sideAvatar${playerNum}`);
  
  if (sideNameElement) {
    // Show name and record
    sideNameElement.innerHTML = `${playerName}<br><span class="player-record">${playerRecord[0]}-${playerRecord[1]}-${playerRecord[2]}</span>`;
  }
  
  if (sideAvatar) {
    // Check if this is an AI opponent
    if (playerNum === 2 && window.gameMode === 'ai') {
      // AI opponent - use images from assets/ai directory
      const aiImagePath = `assets/ai/${window.player2Avatar}.png`;
      sideAvatar.src = aiImagePath;
      // Add fallback in case the image doesn't exist
      sideAvatar.onerror = function() {
        this.src = 'assets/images/adamsmasherpfp.png';
      };
    } else {
      // Regular player - use the avatar paths from window object
      sideAvatar.src = window.avatarPaths[playerCharacter] || 
                      (playerNum === 1 ? 'assets/images/jspfp1.png' : 'assets/images/adamsmasherpfp.png');
    }
  }
}

// Update player UI indicators
export function updatePlayerUI() {
  // Update the active player indicator
  const player1Avatar = document.querySelector('.player-side.left .side-avatar');
  const player2Avatar = document.querySelector('.player-side.right .side-avatar');
  
  // Reset active classes
  if (player1Avatar) player1Avatar.classList.remove('active');
  if (player2Avatar) player2Avatar.classList.remove('active');
  
  // Add active class to current player
  if (window.currentPlayer === 'X') {
    if (player1Avatar) player1Avatar.classList.add('active');
  } else {
    if (player2Avatar) player2Avatar.classList.add('active');
  }
  
  // Update player names and records in side panels
  updateScoreboard();
  
  // Update side avatar images
  const player1Image = document.querySelector('#sideAvatar1');
  const player2Image = document.querySelector('#sideAvatar2');
  
  if (player1Image) {
    player1Image.src = window.avatarPaths[window.player1Character] || 'assets/images/jspfp1.png';
    player1Image.onerror = function() {
      this.src = 'assets/images/jspfp1.png';
    };
  }
  
  if (player2Image) {
    // Check if this is an AI opponent
    if (window.gameMode === 'ai') {
      // AI opponent - use images from assets/ai directory
      const aiImagePath = `assets/ai/${window.player2Avatar}.png`;
      player2Image.src = aiImagePath;
      // Add fallback in case the image doesn't exist
      player2Image.onerror = function() {
        this.src = 'assets/images/adamsmasherpfp.png';
      };
    } else {
      // Regular player - use the avatar paths from window object
      player2Image.src = window.avatarPaths[window.player2Character] || 'assets/images/adamsmasherpfp.png';
      player2Image.onerror = function() {
        this.src = 'assets/images/adamsmasherpfp.png';
      };
    }
  }
}

// Add a function to initialize players - DO NOT allow changing characters during gameplay
export function initializePlayers() {
  // No character swapping during gameplay - we'll only show visual indicators
  const player1SideAvatar = document.querySelector('.player-side.left .side-avatar');
  const player2SideAvatar = document.querySelector('.player-side.right .side-avatar');
  
  // Remove any existing click event listeners using cloneNode
  if (player1SideAvatar) {
    const newPlayer1Avatar = player1SideAvatar.cloneNode(true);
    player1SideAvatar.parentNode.replaceChild(newPlayer1Avatar, player1SideAvatar);
  }
  
  if (player2SideAvatar) {
    const newPlayer2Avatar = player2SideAvatar.cloneNode(true);
    player2SideAvatar.parentNode.replaceChild(newPlayer2Avatar, player2SideAvatar);
  }
} 