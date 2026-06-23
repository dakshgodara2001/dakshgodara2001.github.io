/* =========================================================
   Daksh Godara — portfolio interactions
   + "Killing two birds with one stone" slingshot mini-game
   ========================================================= */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer  = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------------------------------------------------------
     Theme toggle
     --------------------------------------------------------- */
  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const stored = localStorage.getItem('theme');
  if (stored) root.setAttribute('data-theme', stored);

  function themeMode() {
    const t = root.getAttribute('data-theme');
    if (t) return t;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function syncToggleIcon() {
    themeToggle && themeToggle.classList.toggle('is-dark', themeMode() === 'dark');
  }
  syncToggleIcon();

  themeToggle && themeToggle.addEventListener('click', () => {
    const next = themeMode() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    syncToggleIcon();
    refreshThemeColors();
  });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!root.getAttribute('data-theme')) { syncToggleIcon(); refreshThemeColors(); }
  });

  /* ---------------------------------------------------------
     Navbar: scrolled state, mobile menu, active link
     --------------------------------------------------------- */
  const navbar    = document.getElementById('navbar');
  const navToggle = document.getElementById('nav-toggle');
  const navMenu   = document.getElementById('nav-menu');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  navToggle && navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    navToggle.classList.toggle('open');
  });
  navMenu && navMenu.querySelectorAll('.nav-link').forEach(l =>
    l.addEventListener('click', () => {
      navMenu.classList.remove('open');
      navToggle.classList.remove('open');
    })
  );

  const navLinks = [...document.querySelectorAll('.nav-link')];
  const sections = navLinks
    .map(l => document.querySelector(l.getAttribute('href')))
    .filter(Boolean);
  const spy = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = '#' + e.target.id;
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));

  /* ---------------------------------------------------------
     Reveal on scroll
     --------------------------------------------------------- */
  const revealObs = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  /* ---------------------------------------------------------
     Game HUD
     --------------------------------------------------------- */
  const hud         = document.getElementById('game-hud');
  const hudClose    = document.getElementById('game-hud-close');
  const scoreBirds  = document.getElementById('score-birds');
  const scoreDouble = document.getElementById('score-doubles');
  const congrats    = document.getElementById('congrats');
  const song        = document.getElementById('celebration-song');
  const idiomNote   = document.getElementById('idiom-note');
  hudClose && hudClose.addEventListener('click', () => hud.classList.add('hidden'));

  // the "watch the comic" note only appears while a double's song plays
  let comicTimer = null;
  function showComic() {
    if (!idiomNote) return;
    idiomNote.classList.add('show');
    const ms = (song && isFinite(song.duration) && song.duration > 0) ? song.duration * 1000 + 400 : 13000;
    clearTimeout(comicTimer);
    comicTimer = setTimeout(() => idiomNote.classList.remove('show'), ms);
  }
  song && song.addEventListener('ended', () => idiomNote && idiomNote.classList.remove('show'));

  let birdsDown = 0, doubles = 0, speedMult = 1;
  function updateScore() {
    if (scoreBirds)  scoreBirds.textContent  = birdsDown;
    if (scoreDouble) scoreDouble.textContent = doubles;
  }

  let songStop = null;
  function playSong() {
    if (!song) return;
    try {
      song.pause(); song.currentTime = 0; song.volume = 0.6;
      const p = song.play(); if (p && p.catch) p.catch(() => {});
      clearTimeout(songStop);
      songStop = setTimeout(() => { try { song.pause(); } catch (e) {} }, 15000);
    } catch (e) {}
  }

  let congratsTimer = null;
  function celebrate(x, y) {
    doubles++;
    if (doubles % 2 === 0) speedMult = Math.min(speedMult + 0.1, 2.6);  // birds speed up a touch every 2 doubles
    playSong();
    showComic();
    burstConfetti(x, y);
    if (congrats) {
      const lines = ['Two birds, one stone!', 'One stone, two birds. 🎯', 'Clean double!', 'Proverbially efficient.'];
      congrats.querySelector('.congrats-text').textContent = lines[Math.min(doubles - 1, lines.length - 1)] || lines[0];
      congrats.classList.add('show');
      clearTimeout(congratsTimer);
      congratsTimer = setTimeout(() => congrats.classList.remove('show'), 1900);
    }
  }

  /* ---------------------------------------------------------
     Slingshot cursor
     --------------------------------------------------------- */
  const sling = document.getElementById('slingshot');
  const POUCH_X = 23, POUCH_Y = 25;     // pouch coords inside the 46×52 svg
  let pointerVX = 0, lastPX = null;

  if (finePointer) {
    document.body.classList.add('slingshot-ready');
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      sling.style.setProperty('--x', (e.clientX - POUCH_X) + 'px');
      sling.style.setProperty('--y', (e.clientY - POUCH_Y) + 'px');
      if (lastPX !== null) pointerVX = e.clientX - lastPX;
      lastPX = e.clientX;
    }, { passive: true });
  }

  function recoil() {
    if (!finePointer) return;
    sling.classList.remove('firing');
    void sling.offsetWidth;            // restart animation
    sling.classList.add('firing');
  }

  /* ---------------------------------------------------------
     Canvas: birds, stones, particles
     --------------------------------------------------------- */
  const canvas = document.getElementById('sky');
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  // theme-dependent colours
  let birdColor = '#2a2d33', confetti = [];
  const confettiPalette = ['#e2674a', '#3b82c4', '#f4b942', '#5bbf8a', '#d65d8a', '#7c6cf0'];
  function refreshThemeColors() {
    birdColor = themeMode() === 'dark'
      ? 'rgba(228, 224, 216, 0.55)'
      : 'rgba(40, 44, 52, 0.62)';
  }
  refreshThemeColors();

  const birds = [];
  const stones = [];
  const parts = [];                 // feathers + confetti
  const TARGET_BIRDS = reduceMotion ? 5 : (W < 640 ? 7 : 11);

  class Bird {
    constructor(forceSide) {
      const side = forceSide || (Math.random() < 0.5 ? 'L' : 'R');
      this.dir = side === 'L' ? 1 : -1;
      this.x = side === 'L' ? -50 : W + 50;
      this.baseY = rand(54, H * 0.6);
      this.y = this.baseY;
      this.baseSpeed = rand(0.5, 1.4) * (reduceMotion ? 0.6 : 1);
      this.size = rand(12, 22);
      this.flap = rand(0, Math.PI * 2);
      this.flapSpd = rand(0.12, 0.22);
      this.bobAmp = reduceMotion ? 0 : rand(4, 12);
      this.bobPhase = rand(0, Math.PI * 2);
      this.dead = false; this.vy = 0; this.rot = 0; this.alpha = 1;
    }
    update() {
      if (this.dead) {
        this.vy += 0.45; this.y += this.vy;
        this.x += this.dir * 0.4; this.rot += 0.22; this.alpha -= 0.012;
        return;
      }
      this.x += this.dir * this.baseSpeed * speedMult;
      this.flap += this.flapSpd;
      this.bobPhase += 0.02;
      this.y = this.baseY + Math.sin(this.bobPhase) * this.bobAmp;
    }
    draw() {
      const wing = Math.sin(this.flap) * 0.5 + 0.5;   // 0..1
      const s = this.size, lift = (1 - wing) * s * 0.55;
      ctx.save();
      ctx.translate(this.x, this.y);
      if (this.dead) ctx.rotate(this.rot);
      ctx.scale(this.dir, 1);
      ctx.globalAlpha = clamp(this.alpha, 0, 1) * (this.dead ? 1 : 0.9);
      ctx.strokeStyle = birdColor;
      ctx.lineWidth = Math.max(1.4, s * 0.12);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-s, lift);
      ctx.quadraticCurveTo(-s * 0.42, -s * 0.5 - lift, 0, 0);
      ctx.quadraticCurveTo(s * 0.42, -s * 0.5 - lift, s, lift);
      ctx.stroke();
      ctx.restore();
    }
    gone() {
      return this.dead ? (this.y > H + 70 || this.alpha <= 0) : (this.x < -90 || this.x > W + 90);
    }
    hit(px, py, r) {
      if (this.dead) return false;
      const dx = this.x - px, dy = this.y - py, rr = this.size * 0.9 + r + 6;
      return dx * dx + dy * dy < rr * rr;
    }
    kill() { this.dead = true; this.vy = rand(-1, 1.5); }
  }

  class Stone {
    constructor(x, y, vx) {
      this.x = x; this.y = y;
      this.vx = vx; this.vy = -13.5;
      this.r = 4; this.kills = 0; this.celebrated = false;
      this.trail = []; this.dead = false;
    }
    step() {
      this.vy += 0.2;
      const sub = 4, sx = this.vx / sub, sy = this.vy / sub;
      for (let i = 0; i < sub && !this.dead; i++) {
        this.x += sx; this.y += sy;
        for (const b of birds) {
          if (b.hit(this.x, this.y, this.r)) {
            b.kill();
            this.kills++; birdsDown++; updateScore();
            featherPuff(b.x, b.y);
            if (this.kills === 2 && !this.celebrated) { this.celebrated = true; celebrate(this.x, this.y); }
          }
        }
      }
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > 7) this.trail.shift();
      if (this.y > H + 70 || this.y < -120 || this.x < -70 || this.x > W + 70) this.dead = true;
    }
    draw() {
      for (let i = 0; i < this.trail.length; i++) {
        const t = this.trail[i], a = (i / this.trail.length) * 0.35;
        ctx.globalAlpha = a;
        ctx.fillStyle = birdColor;
        ctx.beginPath(); ctx.arc(t.x, t.y, this.r * (i / this.trail.length), 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = themeMode() === 'dark' ? '#efe9df' : '#26282d';
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, 7); ctx.fill();
    }
  }

  class Particle {
    constructor(x, y, opt) {
      this.x = x; this.y = y;
      this.vx = opt.vx; this.vy = opt.vy;
      this.g = opt.g; this.size = opt.size;
      this.color = opt.color; this.life = 1; this.decay = opt.decay;
      this.rot = rand(0, 7); this.vr = rand(-0.3, 0.3); this.shape = opt.shape;
    }
    update() { this.vy += this.g; this.x += this.vx; this.y += this.vy; this.vx *= 0.99; this.rot += this.vr; this.life -= this.decay; }
    draw() {
      ctx.globalAlpha = clamp(this.life, 0, 1);
      ctx.fillStyle = this.color;
      if (this.shape === 'rect') {
        ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.rot);
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.5);
        ctx.restore();
      } else {
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }

  function featherPuff(x, y) {
    if (reduceMotion) return;
    for (let i = 0; i < 6; i++) {
      parts.push(new Particle(x, y, {
        vx: rand(-1.4, 1.4), vy: rand(-1.5, 0.5), g: 0.05,
        size: rand(1.5, 3), color: birdColor, decay: 0.018, shape: 'dot'
      }));
    }
  }

  function burstConfetti(x, y) {
    if (reduceMotion) return;
    const n = 64;
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n + rand(-0.2, 0.2);
      const sp = rand(2, 8);
      parts.push(new Particle(x, y, {
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 2, g: 0.14,
        size: rand(4, 8), color: confettiPalette[(Math.random() * confettiPalette.length) | 0],
        decay: rand(0.01, 0.02), shape: 'rect'
      }));
    }
  }

  // seed birds + steady spawning
  for (let i = 0; i < TARGET_BIRDS; i++) {
    const b = new Bird(Math.random() < 0.5 ? 'L' : 'R');
    b.x = rand(0, W);
    birds.push(b);
  }
  let spawnAcc = 0;

  /* ---------------------------------------------------------
     Fire control
     --------------------------------------------------------- */
  const IGNORE = 'a, button, input, textarea, select, label, summary, [role="button"], [data-fire="off"], .nav-menu, .game-hud, .idiom-note, .btn';
  function fireAt(x, y, vxHint) {
    stones.push(new Stone(x, y, clamp(vxHint, -4.5, 4.5)));
    recoil();
  }
  // ---- Fire control ----
  // Desktop (mouse / pen): fire on press, with a little aim from pointer velocity.
  // Touch: handled via TOUCH events (reliable during scroll) + a scroll-position
  // check, so a scroll NEVER fires — only a clean, stationary tap does.
  const TAP_MOVE = 14, TAP_TIME = 650;
  let lastTouchAt = 0;
  const scrollTop = () => window.scrollY || window.pageYOffset || 0;

  document.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') return;                     // touch handled by touch events below
    if (performance.now() - lastTouchAt < 700) return;         // swallow synthetic mouse after a touch
    if (e.button !== undefined && e.button !== 0) return;
    if (e.target.closest && e.target.closest(IGNORE)) return;
    fireAt(e.clientX, e.clientY, clamp(pointerVX * 0.45, -4.5, 4.5));
  });

  let touchTap = null;
  document.addEventListener('touchstart', (e) => {
    lastTouchAt = performance.now();
    if (e.touches.length > 1) { touchTap = null; return; }     // pinch / multi-touch
    const t = e.changedTouches[0];
    if (t.target && t.target.closest && t.target.closest(IGNORE)) { touchTap = null; return; }
    touchTap = { x: t.clientX, y: t.clientY, t: performance.now(), sy: scrollTop() };
  }, { passive: true });
  document.addEventListener('touchmove', (e) => {
    if (!touchTap) return;
    const t = e.changedTouches[0];
    if (Math.hypot(t.clientX - touchTap.x, t.clientY - touchTap.y) > TAP_MOVE) touchTap = null;
  }, { passive: true });
  document.addEventListener('touchcancel', () => { touchTap = null; });
  document.addEventListener('touchend', (e) => {
    lastTouchAt = performance.now();
    if (!touchTap) return;
    const start = touchTap; touchTap = null;
    const t = e.changedTouches[0] || {};
    if (performance.now() - start.t > TAP_TIME) return;                                 // long press
    if (Math.hypot((t.clientX || start.x) - start.x, (t.clientY || start.y) - start.y) > TAP_MOVE) return; // moved = swipe
    if (Math.abs(scrollTop() - start.sy) > 4) return;                                   // page scrolled = not a tap
    if (t.target && t.target.closest && t.target.closest(IGNORE)) return;
    fireAt(t.clientX || start.x, t.clientY || start.y, 0);
  });

  /* ---------------------------------------------------------
     Main loop
     --------------------------------------------------------- */
  let raf = null, prev = performance.now();
  function loop(now) {
    const dt = Math.min(2, (now - prev) / 16.67); prev = now;
    ctx.clearRect(0, 0, W, H);

    // spawn to keep the flock alive
    spawnAcc += dt;
    if (spawnAcc > 36 && birds.filter(b => !b.dead).length < TARGET_BIRDS) {
      birds.push(new Bird()); spawnAcc = 0;
    }

    for (let i = birds.length - 1; i >= 0; i--) {
      const b = birds[i]; b.update(); b.draw();
      if (b.gone()) birds.splice(i, 1);
    }
    for (let i = stones.length - 1; i >= 0; i--) {
      const s = stones[i]; s.step(); s.draw();
      if (s.dead) stones.splice(i, 1);
    }
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]; p.update(); p.draw();
      if (p.life <= 0 || p.y > H + 40) parts.splice(i, 1);
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);

  // pause when tab hidden (saves cycles)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = null; }
    else if (!raf) { prev = performance.now(); raf = requestAnimationFrame(loop); }
  });

  updateScore();
})();
