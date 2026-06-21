/**
 * main.js — Core Application Logic
 * Aashvika's 1st Birthday Invitation
 *
 * Handles:
 *  - Loader
 *  - Screenshot / capture protection
 *  - Custom cursor
 *  - Navbar scroll effects
 *  - Scroll-reveal animations
 *  - Hero particle system
 *  - Magnetic buttons
 *  - RSVP form (WhatsApp submission)
 *  - Confetti system
 *  - Ripple effects
 */

(function () {
  'use strict';

  /* ── Constants ──────────────────────────────────────────── */
  const HOST_WHATSAPP = '91XXXXXXXXXX'; // ← replace with host's number (no +)

  /* ── DOM Refs ────────────────────────────────────────────── */
  const loader     = document.getElementById('loader');
  const navbar     = document.getElementById('navbar');
  const navToggle  = document.getElementById('nav-toggle');
  const navMenu    = document.getElementById('nav-menu');
  const navLinks   = document.querySelectorAll('.nav-link');
  const spOverlay  = document.getElementById('sp-overlay');
  const spReturn   = document.getElementById('sp-return');
  const cursor     = document.getElementById('cursor');
  const cursorDot  = document.getElementById('cursor-dot');
  const revealEls  = document.querySelectorAll('.reveal');
  const magnetBtns = document.querySelectorAll('.magnetic');
  const sections   = document.querySelectorAll('.section');

  /* ═══════════════════════════════════════════════════════════
     LOADER
  ═══════════════════════════════════════════════════════════ */
  function initLoader() {
    if (!loader) return;
    const minDuration = 2200;
    const startTime   = Date.now();

    window.addEventListener('load', () => {
      const elapsed = Date.now() - startTime;
      const wait    = Math.max(0, minDuration - elapsed);
      setTimeout(() => {
        loader.classList.add('done');
        loader.setAttribute('aria-hidden', 'true');
        initParticles();
      }, wait);
    });
  }

  /* ═══════════════════════════════════════════════════════════
     SCREENSHOT / CAPTURE PROTECTION
  ═══════════════════════════════════════════════════════════ */
  function initScreenshotProtection() {
    /* 1. Blur when page is hidden (app-switch, screenshot on mobile) */
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        showProtectionOverlay();
      } else {
        // Small delay to allow rendering before removing blur
        setTimeout(hideProtectionOverlay, 600);
      }
    });

    /* 2. Blur when window loses focus */
    window.addEventListener('blur', showProtectionOverlay);
    window.addEventListener('focus', () => {
      setTimeout(hideProtectionOverlay, 400);
    });

    /* 3. Block keyboard screenshot shortcuts */
    document.addEventListener('keydown', e => {
      const key = e.key || '';
      const ctrl = e.ctrlKey || e.metaKey;

      // PrintScreen
      if (key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        showProtectionOverlay();
        return;
      }
      // Ctrl/Cmd + P (print)
      if (ctrl && key.toLowerCase() === 'p') {
        e.preventDefault();
        return;
      }
      // Ctrl/Cmd + Shift + S (save as)
      if (ctrl && e.shiftKey && key.toLowerCase() === 's') {
        e.preventDefault();
        return;
      }
      // F12 / DevTools open shortcuts
      if (key === 'F12') { e.preventDefault(); return; }
      if (ctrl && e.shiftKey && ['i', 'j', 'c'].includes(key.toLowerCase())) {
        e.preventDefault();
      }
    });

    /* 4. Disable right-click context menu */
    document.addEventListener('contextmenu', e => e.preventDefault());

    /* 5. Disable long-press save on mobile (iOS) */
    document.addEventListener('touchstart', () => {}, { passive: true });

    /* 6. Dismiss overlay on button click */
    spReturn && spReturn.addEventListener('click', hideProtectionOverlay);
  }

  function showProtectionOverlay() {
    document.body.classList.add('sp-hidden');
    spOverlay && spOverlay.classList.add('active');
  }

  function hideProtectionOverlay() {
    document.body.classList.remove('sp-hidden');
    spOverlay && spOverlay.classList.remove('active');
  }

  /* ═══════════════════════════════════════════════════════════
     CUSTOM CURSOR (desktop only)
  ═══════════════════════════════════════════════════════════ */
  function initCursor() {
    if (!cursor || !cursorDot) return;
    if (window.matchMedia('(hover: none)').matches) return; // touch device

    let cx = -100, cy = -100;
    let fx = -100, fy = -100;

    document.addEventListener('mousemove', e => {
      cx = e.clientX; cy = e.clientY;
      cursorDot.style.left = cx + 'px';
      cursorDot.style.top  = cy + 'px';
    }, { passive: true });

    // Smooth follower
    function followCursor() {
      fx += (cx - fx) * 0.12;
      fy += (cy - fy) * 0.12;
      cursor.style.left = fx + 'px';
      cursor.style.top  = fy + 'px';
      requestAnimationFrame(followCursor);
    }
    requestAnimationFrame(followCursor);

    // Hover effect on interactive elements
    const hoverTargets = document.querySelectorAll(
      'a, button, .name-card, .detail-card, .contact-card, .milestone'
    );
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
    });

    document.addEventListener('mouseleave', () => {
      cursor.style.opacity    = '0';
      cursorDot.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursor.style.opacity    = '1';
      cursorDot.style.opacity = '1';
    });
  }

  /* ═══════════════════════════════════════════════════════════
     NAVBAR
  ═══════════════════════════════════════════════════════════ */
  function initNavbar() {
    if (!navbar) return;

    // Scroll → add scrolled class
    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
      updateActiveNavLink();
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Mobile toggle
    navToggle && navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      navToggle.classList.toggle('open');
      navMenu && navMenu.classList.toggle('open');
    });

    // Close menu on link click
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navToggle && navToggle.setAttribute('aria-expanded', 'false');
        navToggle && navToggle.classList.remove('open');
        navMenu  && navMenu.classList.remove('open');
      });
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (navMenu && navMenu.classList.contains('open')) {
        if (!navbar.contains(e.target)) {
          navToggle && navToggle.setAttribute('aria-expanded', 'false');
          navToggle && navToggle.classList.remove('open');
          navMenu.classList.remove('open');
        }
      }
    });
  }

  function updateActiveNavLink() {
    const scrollY = window.scrollY + 100;
    sections.forEach(section => {
      const top    = section.offsetTop;
      const height = section.offsetHeight;
      const id     = section.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          link.classList.toggle('active', href === `#${id}`);
        });
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════
     SCROLL REVEAL
  ═══════════════════════════════════════════════════════════ */
  function initScrollReveal() {
    if (!revealEls.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(el => observer.observe(el));
  }

  /* ═══════════════════════════════════════════════════════════
     HERO PARTICLES
  ═══════════════════════════════════════════════════════════ */
  function initParticles() {
    const container = document.getElementById('hero-particles');
    if (!container) return;

    const symbols = ['✦', '✧', '⋆', '·', '∘', '✸'];
    const count   = window.innerWidth < 600 ? 20 : 40;

    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'particle';
      p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      p.style.cssText = [
        `left:${Math.random() * 100}%`,
        `top:${Math.random() * 100}%`,
        `font-size:${6 + Math.random() * 10}px`,
        `color:${randomParticleColor()}`,
        `animation-duration:${4 + Math.random() * 8}s`,
        `animation-delay:${Math.random() * 5}s`,
        `opacity:0`,
      ].join(';');
      container.appendChild(p);
    }
  }

  function randomParticleColor() {
    const colors = [
      'rgba(255,107,157,0.7)',
      'rgba(199,125,255,0.7)',
      'rgba(255,215,0,0.6)',
      'rgba(255,183,197,0.5)',
      'rgba(255,255,255,0.4)',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /* ═══════════════════════════════════════════════════════════
     MAGNETIC BUTTONS
  ═══════════════════════════════════════════════════════════ */
  function initMagneticButtons() {
    if (window.matchMedia('(hover: none)').matches) return; // skip on touch

    magnetBtns.forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const mx = e.clientX - rect.left - rect.width  / 2;
        const my = e.clientY - rect.top  - rect.height / 2;
        btn.style.transform = `translate(${mx * 0.25}px, ${my * 0.25}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════
     RIPPLE EFFECT ON BUTTONS
  ═══════════════════════════════════════════════════════════ */
  function initRipple() {
    document.querySelectorAll('.btn').forEach(btn => {
      btn.classList.add('ripple-host');
      btn.addEventListener('click', e => {
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        const x    = e.clientX - rect.left - size / 2;
        const y    = e.clientY - rect.top  - size / 2;

        const ripple = document.createElement('span');
        ripple.className = 'ripple-circle';
        ripple.style.width  = size + 'px';
        ripple.style.height = size + 'px';
        ripple.style.left   = x + 'px';
        ripple.style.top    = y + 'px';
        btn.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════
     CONFETTI SYSTEM (global, callable from countdown.js)
  ═══════════════════════════════════════════════════════════ */
  window.spawnConfetti = function (container) {
    if (!container) container = document.body;
    const colors = ['#FF6B9D','#C77DFF','#FFD700','#FF4D6D','#B8F2E6','#FF9BE2'];
    const count  = 60;

    for (let i = 0; i < count; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.style.cssText = [
        `left:${10 + Math.random() * 80}%`,
        `top:0`,
        `background:${colors[Math.floor(Math.random() * colors.length)]}`,
        `transform:rotate(${Math.random() * 360}deg)`,
        `animation-duration:${1.2 + Math.random() * 1.5}s`,
        `animation-delay:${Math.random() * 0.5}s`,
        `width:${8 + Math.random() * 10}px`,
        `height:${12 + Math.random() * 10}px`,
        `border-radius:${Math.random() > 0.5 ? '50%' : '3px'}`,
      ].join(';');

      const rel = window.getComputedStyle(container).position;
      if (rel === 'static') container.style.position = 'relative';
      container.style.overflow = 'hidden';
      container.appendChild(piece);
      piece.addEventListener('animationend', () => piece.remove());
    }
  };

  /* ═══════════════════════════════════════════════════════════
     SMOOTH SCROLL FOR ANCHOR LINKS
  ═══════════════════════════════════════════════════════════ */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', e => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          e.preventDefault();
          const navHeight = navbar ? navbar.offsetHeight : 0;
          const top       = target.getBoundingClientRect().top + window.scrollY - navHeight;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════
     SCROLL PROGRESS BAR
  ═══════════════════════════════════════════════════════════ */
  function initScrollProgress() {
    const bar = document.createElement('div');
    bar.id = 'scroll-progress';
    bar.style.cssText =
      'position:fixed;top:0;left:0;height:3px;width:0%;z-index:99999;' +
      'background:linear-gradient(90deg,#FF6B9D,#C77DFF,#FFD700);' +
      'transition:width 0.1s linear;pointer-events:none;';
    document.body.appendChild(bar);

    window.addEventListener('scroll', () => {
      const docH   = document.documentElement.scrollHeight - window.innerHeight;
      const pct    = docH > 0 ? (window.scrollY / docH) * 100 : 0;
      bar.style.width = Math.min(100, pct) + '%';
    }, { passive: true });
  }

  /* ═══════════════════════════════════════════════════════════
     GSAP ScrollTrigger (enhanced animations, if GSAP loaded)
  ═══════════════════════════════════════════════════════════ */
  function initGsapAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // Hero title big name
    gsap.from('.hero-title-big', {
      duration: 1.4,
      opacity: 0,
      y: 60,
      ease: 'power4.out',
      delay: 2.4,
    });

    // Name section big reveal
    gsap.from('.name-en', {
      scrollTrigger: { trigger: '.name-en', start: 'top 80%' },
      duration: 1.2,
      scale: 0.7,
      opacity: 0,
      ease: 'back.out(1.4)',
    });
  }

  /* ═══════════════════════════════════════════════════════════
     INIT
  ═══════════════════════════════════════════════════════════ */
  function init() {
    initLoader();
    initScreenshotProtection();
    initScrollProgress();
    initCursor();
    initNavbar();
    initScrollReveal();
    initMagneticButtons();
    initRipple();
    initSmoothScroll();

    // Run GSAP animations after GSAP is available
    window.addEventListener('load', initGsapAnimations);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
