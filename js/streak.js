/**
 * Streak / Bounty System — consecutive win tracking with cosmetic board-skin unlocks.
 * Streaks are tracked per-player for the current browser session.
 * Unlocked skins persist across games until the tab/session is closed.
 * Exports: recordStreakWin, recordStreakLoss, getStreak, applySkin, showStreakBanner
 */

const S_KEY   = 'nct_streak';
const SKN_KEY = 'nct_skins';

const THRESHOLDS = [
  { wins: 3, skin: 'neon-grid',   label: 'NEON GRID UNLOCKED',   glitch: false },
  { wins: 5, skin: 'blood-red',   label: 'BLOOD RED UNLOCKED',   glitch: true  },
  { wins: 7, skin: 'gold-chrome', label: 'GOLD CHROME UNLOCKED', glitch: true  },
];

// ── helpers ──────────────────────────────────────────────────────────────────
function load(key, def) {
  try { return JSON.parse(sessionStorage.getItem(key)) ?? def; } catch { return def; }
}
function save(key, val) { sessionStorage.setItem(key, JSON.stringify(val)); }

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Call after a player wins a game.
 * Increments their streak, checks for skin unlocks, shows banner.
 */
export function recordStreakWin(playerName) {
  const s = load(S_KEY, { count: 0, player: null });

  if (s.player === playerName) {
    s.count++;
  } else {
    s.count  = 1;
    s.player = playerName;
  }
  save(S_KEY, s);

  // Check for threshold unlocks (only exactly at the milestone)
  for (const t of THRESHOLDS) {
    if (s.count === t.wins) _unlock(t);
  }

  showStreakBanner(s.count, playerName);
  applySkin();
}

/**
 * Call when the streak-holder loses.
 * Resets their streak (draws do NOT break streaks).
 */
export function recordStreakLoss(playerName) {
  const s = load(S_KEY, { count: 0, player: null });
  if (s.player === playerName && s.count > 0) {
    s.count  = 0;
    s.player = null;
    save(S_KEY, s);
  }
}

export function getStreak() {
  return load(S_KEY, { count: 0, player: null });
}

/** Apply the highest unlocked board skin to #mainBoard. */
export function applySkin() {
  const skins = load(SKN_KEY, []);
  const board = document.getElementById('mainBoard');
  if (!board) return;

  board.classList.remove('skin-neon-grid', 'skin-blood-red', 'skin-gold-chrome');
  const order = ['gold-chrome', 'blood-red', 'neon-grid'];
  for (const s of order) {
    if (skins.includes(s)) {
      board.classList.add(`skin-${s}`);
      break;
    }
  }
}

/**
 * Show the floating streak / unlock banner.
 * @param {number|null} count     - streak count (null when showing custom message)
 * @param {string|null} player    - player name
 * @param {string|null} customMsg - override message
 * @param {boolean}     isUnlock  - style as skin-unlock notification
 */
export function showStreakBanner(count, player, customMsg = null, isUnlock = false) {
  const banner = document.getElementById('streak-banner');
  if (!banner) return;

  banner.className = 'streak-banner' + (isUnlock ? ' unlock-banner' : '');
  banner.textContent = customMsg ?? `🔥 ${player} — ${count} WIN STREAK`;
  banner.classList.remove('hidden');

  clearTimeout(banner._tid);
  banner._tid = setTimeout(() => banner.classList.add('hidden'), 3500);
}

// ── Internal ──────────────────────────────────────────────────────────────────
function _unlock(threshold) {
  const skins = load(SKN_KEY, []);
  if (!skins.includes(threshold.skin)) {
    skins.push(threshold.skin);
    save(SKN_KEY, skins);
  }
  showStreakBanner(null, null, `⚡ ${threshold.label}`, true);
  if (threshold.glitch && typeof window.applyMajorGlitch === 'function') {
    window.applyMajorGlitch();
  }
}
