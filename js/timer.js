/**
 * Timed Mode — per-move countdown timer
 * When time expires, the current player forfeits their active board (or loses their turn on free move).
 * Exports: timedModeActive, setTimedMode, startMoveTimer, stopTimer
 */

let _interval  = null;
let _remaining = 0;
let _maxSec    = 10;
let _onExpire  = null;

export let timedModeActive = false;

/**
 * Enable or disable timed mode globally.
 * @param {boolean} active
 */
export function setTimedMode(active) {
  timedModeActive = active;
  const el = document.getElementById('move-timer');
  if (el) el.classList.toggle('hidden', !active);
  if (!active) stopTimer();
  // Reflect state on the toggle button
  const btn = document.getElementById('timedModeToggle');
  if (btn) {
    btn.textContent = active ? 'ON' : 'OFF';
    btn.classList.toggle('active', active);
  }
}

/**
 * Start the countdown. No-op if timed mode is off.
 * @param {number}   seconds  - total seconds for this turn
 * @param {Function} onExpire - called when clock hits 0
 */
export function startMoveTimer(seconds = 10, onExpire) {
  if (!timedModeActive) return;
  stopTimer();
  _maxSec    = seconds;
  _remaining = seconds;
  _onExpire  = onExpire;
  _render();
  _interval = setInterval(() => {
    _remaining--;
    _render();
    if (_remaining <= 0) {
      stopTimer();
      if (_onExpire) _onExpire();
    }
  }, 1000);
}

/** Stop and clear the active countdown. */
export function stopTimer() {
  clearInterval(_interval);
  _interval = null;
  // Reset visual to full
  const el = document.getElementById('move-timer');
  if (el) {
    el.classList.remove('timer-urgent', 'timer-warn');
    el.style.setProperty('--timer-deg', '360deg');
    const cnt = el.querySelector('.timer-count');
    if (cnt) cnt.textContent = _maxSec || 10;
  }
}

function _render() {
  const el = document.getElementById('move-timer');
  if (!el) return;

  const cnt = el.querySelector('.timer-count');
  if (cnt) cnt.textContent = _remaining;

  el.classList.remove('timer-urgent', 'timer-warn');
  if (_remaining <= 3)      el.classList.add('timer-urgent');
  else if (_remaining <= 5) el.classList.add('timer-warn');

  // Conic-gradient progress ring via CSS custom property
  const deg = Math.max(0, (_remaining / _maxSec)) * 360;
  el.style.setProperty('--timer-deg', `${deg}deg`);
}
