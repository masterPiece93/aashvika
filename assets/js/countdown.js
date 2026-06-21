/**
 * countdown.js — Aashvika's 1st Birthday Countdown Timer
 * Party Date: Sunday, 19 July 2026, 12:00 PM
 */

(function () {
  'use strict';

  const PARTY_DATE = new Date('2026-06-27T12:00:00');

  const elDays    = document.getElementById('cd-days');
  const elHours   = document.getElementById('cd-hours');
  const elMinutes = document.getElementById('cd-minutes');
  const elSeconds = document.getElementById('cd-seconds');
  const elWrap    = document.getElementById('countdown-wrap');
  const elCelebrate = document.getElementById('cd-celebrate');

  if (!elDays || !elHours || !elMinutes || !elSeconds) return;

  /**
   * Pads a number to 2 digits.
   * @param {number} n
   * @returns {string}
   */
  function pad(n) {
    return String(Math.max(0, Math.floor(n))).padStart(2, '0');
  }

  /**
   * Animate digit flip when value changes.
   * @param {HTMLElement} el
   * @param {string} val
   */
  function updateDigit(el, val) {
    if (el.textContent !== val) {
      el.classList.remove('flip');
      // Force reflow to restart animation
      void el.offsetWidth;
      el.classList.add('flip');
      el.textContent = val;
    }
  }

  function tick() {
    const now  = Date.now();
    const diff = PARTY_DATE.getTime() - now;

    if (diff <= 0) {
      // Party has started
      elWrap.classList.add('hidden');
      elCelebrate && elCelebrate.classList.remove('hidden');
      triggerCelebration();
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const d = Math.floor(totalSeconds / 86400);
    const h = Math.floor((totalSeconds % 86400) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    updateDigit(elDays,    pad(d));
    updateDigit(elHours,   pad(h));
    updateDigit(elMinutes, pad(m));
    updateDigit(elSeconds, pad(s));
  }

  function triggerCelebration() {
    if (typeof window.spawnConfetti === 'function') {
      window.spawnConfetti(document.querySelector('.s-countdown'));
    }
  }

  // Initial tick + interval
  tick();
  setInterval(tick, 1000);
})();
