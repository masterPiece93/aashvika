/**
 * sensors.js — Device Orientation, Motion & Touch Sensors
 * Enhances the experience for mobile users.
 */

(function () {
  'use strict';

  /* ── Parallax on Device Orientation (tilt) ─────────────── */
  const heroContent = document.querySelector('.hero-content');
  const floaties    = document.querySelectorAll('.floaty');

  let orientationGranted = false;

  function applyTilt(beta, gamma) {
    // beta  = front-to-back tilt in degrees (-180 to 180)
    // gamma = left-to-right tilt (-90 to 90)
    const tiltX = Math.max(-20, Math.min(20, gamma));
    const tiltY = Math.max(-20, Math.min(20, beta));

    if (heroContent) {
      heroContent.style.transform =
        `perspective(800px) rotateX(${-tiltY * 0.15}deg) rotateY(${tiltX * 0.15}deg)`;
    }

    // Parallax depth on floating elements
    floaties.forEach((el, i) => {
      const factor = (i % 3 + 1) * 0.4;
      el.style.transform =
        `translate(${tiltX * factor}px, ${tiltY * factor}px) ` +
        `rotate(${tiltX * 0.5}deg)`;
    });
  }

  function onOrientation(e) {
    applyTilt(e.beta || 0, e.gamma || 0);
  }

  function requestOrientationPermission() {
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      // iOS 13+
      DeviceOrientationEvent.requestPermission()
        .then(state => {
          if (state === 'granted') {
            window.addEventListener('deviceorientation', onOrientation, { passive: true });
            orientationGranted = true;
          }
        })
        .catch(() => {});
    } else if (typeof DeviceOrientationEvent !== 'undefined') {
      // Android / others
      window.addEventListener('deviceorientation', onOrientation, { passive: true });
      orientationGranted = true;
    }
  }

  // Request on first user touch (avoids browser blocking)
  document.addEventListener('touchstart', function initOrientation() {
    if (!orientationGranted) {
      requestOrientationPermission();
    }
    document.removeEventListener('touchstart', initOrientation);
  }, { once: true, passive: true });

  /* ── Shake Detection → Confetti Burst ──────────────────── */
  let lastAccel = { x: 0, y: 0, z: 0 };
  let shakeCooldown = false;
  const SHAKE_THRESHOLD = 18;

  function onMotion(e) {
    const acc = e.accelerationIncludingGravity;
    if (!acc) return;

    const delta =
      Math.abs(acc.x - lastAccel.x) +
      Math.abs(acc.y - lastAccel.y) +
      Math.abs(acc.z - lastAccel.z);

    if (delta > SHAKE_THRESHOLD && !shakeCooldown) {
      shakeCooldown = true;
      if (typeof window.spawnConfetti === 'function') {
        window.spawnConfetti(document.body);
      }
      setTimeout(() => { shakeCooldown = false; }, 2000);
    }

    lastAccel = { x: acc.x || 0, y: acc.y || 0, z: acc.z || 0 };
  }

  function requestMotionPermission() {
    if (typeof DeviceMotionEvent !== 'undefined' &&
        typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission()
        .then(state => {
          if (state === 'granted') {
            window.addEventListener('devicemotion', onMotion, { passive: true });
          }
        })
        .catch(() => {});
    } else if (typeof DeviceMotionEvent !== 'undefined') {
      window.addEventListener('devicemotion', onMotion, { passive: true });
    }
  }

  document.addEventListener('touchstart', function initMotion() {
    requestMotionPermission();
    document.removeEventListener('touchstart', initMotion);
  }, { once: true, passive: true });

  /* ── Touch Swipe Detection for Gallery ─────────────────── */
  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;

    // Only register horizontal swipes that are dominant
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      const lightbox = document.getElementById('lightbox');
      if (lightbox && lightbox.classList.contains('open')) {
        if (dx < 0) {
          // Swipe left → next
          document.getElementById('lb-next') && document.getElementById('lb-next').click();
        } else {
          // Swipe right → prev
          document.getElementById('lb-prev') && document.getElementById('lb-prev').click();
        }
      }
    }
  }, { passive: true });

  /* ── Mouse Parallax Fallback (desktop) ─────────────────── */
  const isTouch = 'ontouchstart' in window;
  if (!isTouch && heroContent) {
    document.addEventListener('mousemove', e => {
      const cx = window.innerWidth  / 2;
      const cy = window.innerHeight / 2;
      const rx = (e.clientX - cx) / cx; // -1 to 1
      const ry = (e.clientY - cy) / cy;

      heroContent.style.transform =
        `perspective(1000px) rotateX(${ry * -3}deg) rotateY(${rx * 3}deg)`;

      floaties.forEach((el, i) => {
        const f = (i % 3 + 1) * 6;
        el.style.transform = `translate(${rx * f}px, ${ry * f}px)`;
      });
    }, { passive: true });
  }
})();
