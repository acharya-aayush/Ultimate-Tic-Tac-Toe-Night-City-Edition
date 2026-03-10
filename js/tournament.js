/**
 * Tournament Mode — Best of 3 or 5 series tracker
 * Manages series state, between-match bracket display, and the bounty-poster win ceremony.
 * Exports: initTournament, isTournamentActive, getTournamentState,
 *          recordTournamentGame, showTournamentBracket, hideTournamentBracket,
 *          showBountyPoster, closeBountyPoster
 */

let _state = null;

/**
 * Start a new tournament series.
 * @param {number} bestOf - 3 or 5
 */
export function initTournament(bestOf = 3) {
  _state = {
    active:      true,
    bestOf,
    winsNeeded:  Math.ceil(bestOf / 2),
    p1Wins:      0,
    p2Wins:      0,
    gamesPlayed: 0,
    draws:       0,
  };
  window._tournamentActive = true;
}

export function isTournamentActive() {
  return !!(_state && _state.active);
}

export function getTournamentState() { return _state; }

/**
 * Record one completed game in the current series.
 * @param {string|null} winnerSymbol - 'X', 'O', or null for draw
 * @returns {boolean} true when the series is over
 */
export function recordTournamentGame(winnerSymbol) {
  if (!_state || !_state.active) return false;

  _state.gamesPlayed++;
  if      (winnerSymbol === 'X') _state.p1Wins++;
  else if (winnerSymbol === 'O') _state.p2Wins++;
  else                           _state.draws++;

  const seriesOver = _state.p1Wins >= _state.winsNeeded ||
                     _state.p2Wins >= _state.winsNeeded;

  if (seriesOver) {
    _state.active         = false;
    window._tournamentActive = false;
    const winner = _state.p1Wins >= _state.winsNeeded
      ? window.player1Name
      : window.player2Name;
    // Bounty-poster after winner display fades in
    setTimeout(() => showBountyPoster(winner), 2200);
    return true;
  }

  // Series continues — show bracket overlay after a short delay so game controls appear first
  setTimeout(() => showTournamentBracket(), 900);
  return false;
}

/** Show the mid-series bracket overlay. */
export function showTournamentBracket() {
  if (!_state) return;
  const overlay = document.getElementById('tournament-overlay');
  if (!overlay) return;

  const p1 = window.player1Name || 'PLAYER 1';
  const p2 = window.player2Name || 'PLAYER 2';

  _set(overlay, '#tourn-p1-name',  p1);
  _set(overlay, '#tourn-p2-name',  p2);
  _set(overlay, '#tourn-p1-score', _state.p1Wins);
  _set(overlay, '#tourn-p2-score', _state.p2Wins);
  _set(overlay, '#tourn-best-of',  `BEST OF ${_state.bestOf}`);
  _set(overlay, '#tourn-game-count',
    _state.active ? `GAME ${_state.gamesPlayed + 1}` : 'SERIES OVER');

  const pipsHtml = (wins, needed) =>
    Array.from({ length: needed }, (_, i) =>
      `<span class="tourn-pip${i < wins ? ' filled' : ''}"></span>`
    ).join('');

  overlay.querySelector('#tourn-p1-pips').innerHTML = pipsHtml(_state.p1Wins, _state.winsNeeded);
  overlay.querySelector('#tourn-p2-pips').innerHTML = pipsHtml(_state.p2Wins, _state.winsNeeded);

  overlay.classList.remove('hidden');
}

export function hideTournamentBracket() {
  const el = document.getElementById('tournament-overlay');
  if (el) el.classList.add('hidden');
}

/**
 * Show the full-screen cyberpunk bounty-poster for the tournament winner.
 * @param {string} winner - display name
 */
export function showBountyPoster(winner) {
  const poster = document.getElementById('bounty-poster');
  if (!poster || !_state) return;

  const isP1     = (winner === window.player1Name);
  const avatarKey = isP1 ? window.player1Avatar : window.player2Avatar;
  const avatarSrc = (window.avatarPaths && avatarKey && window.avatarPaths[avatarKey])
    || (isP1 ? 'assets/images/jspfp1.png' : 'assets/images/lucypfp2.png');

  _img(poster, '#bounty-avatar', avatarSrc);
  _set(poster, '#bounty-winner-name',  winner.toUpperCase());
  _set(poster, '#bounty-series',       `${_state.p1Wins} — ${_state.p2Wins}`);
  _set(poster, '#bounty-series-info',  `BEST OF ${_state.bestOf}`);

  poster.classList.remove('hidden');
}

export function closeBountyPoster() {
  const poster = document.getElementById('bounty-poster');
  if (poster) poster.classList.add('hidden');
  _state = null;
  window._tournamentActive = false;
  if (typeof window.backToSetup === 'function') window.backToSetup();
}

// ── helpers ──────────────────────────────────────────────────────────────────
function _set(root, sel, val) {
  const el = root.querySelector(sel);
  if (el) el.textContent = val;
}
function _img(root, sel, src) {
  const el = root.querySelector(sel);
  if (el) el.src = src;
}
