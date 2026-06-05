(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

  var root = document.documentElement;
  root.classList.add('gc-cursor-on');

  var cx = 0.5, cy = 0.35, cx2 = 0.5, cy2 = 0.35;
  var tx = 0.5, ty = 0.35;
  var px = 0, py = 0;
  var swayT = 0;
  var grids = document.querySelectorAll('.hero-grid, .hero-grid-bg');

  var tiltRules = [
    { sel: '.hero-grid, .hero-grid-bg', cls: 'gc-tilt-back' },
    { sel: '.paradox-grid, .shift-facts, .val-split, .mv-grid, .values-grid, .story-side, .loc-layout, .sol-steps', cls: 'gc-tilt-back' },
    { sel: '.pdata, .sf, .sol-step, .vc, .mv-card, .val, .story-stat, .loc-card, .paradox-full, .terminal', cls: 'gc-tilt-mid' },
    { sel: '#hero .hero-inner, .hero-inner, .demo-entry, .hero-stats, .cta-box, .cta-strip', cls: 'gc-tilt-front' },
    { sel: '.sec-h, .hero-eyebrow, h1', cls: 'gc-tilt-float' },
  ];

  tiltRules.forEach(function (rule) {
    document.querySelectorAll(rule.sel).forEach(function (el) {
      if (!el.classList.contains(rule.cls)) el.classList.add(rule.cls);
    });
  });

  document.querySelectorAll('#hero').forEach(function (hero) {
    if (hero.querySelector('.gc-hero-spotlight')) return;
    var spot = document.createElement('div');
    spot.className = 'gc-hero-spotlight';
    spot.setAttribute('aria-hidden', 'true');
    hero.insertBefore(spot, hero.firstChild);
  });

  if (!document.querySelector('.gc-cursor-orb')) {
    var orb = document.createElement('div');
    orb.className = 'gc-cursor-orb';
    orb.setAttribute('aria-hidden', 'true');
    document.body.appendChild(orb);
  }

  function onMove(e) {
    tx = e.clientX / window.innerWidth;
    ty = e.clientY / window.innerHeight;
    var ox = (tx - 0.5) * 52;
    var oy = (ty - 0.5) * 38;
    grids.forEach(function (g) {
      g.style.transform = 'translate(' + ox + 'px, ' + oy + 'px) scale(1.02)';
    });
  }

  function tick() {
    swayT += 0.014;
    var swayX = Math.sin(swayT) * 10;
    var swayY = Math.cos(swayT * 0.85) * 7;

    cx += (tx - cx) * 0.14;
    cy += (ty - cy) * 0.14;
    cx2 += (tx - cx2) * 0.06;
    cy2 += (ty - cy2) * 0.06;
    px += ((tx - 0.5) * 2 - px) * 0.12;
    py += ((ty - 0.5) * 2 - py) * 0.12;

    root.style.setProperty('--gc-cx', (cx * 100).toFixed(2) + '%');
    root.style.setProperty('--gc-cy', (cy * 100).toFixed(2) + '%');
    root.style.setProperty('--gc-cx2', (cx2 * 100).toFixed(2) + '%');
    root.style.setProperty('--gc-cy2', (cy2 * 100).toFixed(2) + '%');
    root.style.setProperty('--gc-px', px.toFixed(4));
    root.style.setProperty('--gc-py', py.toFixed(4));
    root.style.setProperty('--gc-sway-x', swayX.toFixed(2) + 'px');
    root.style.setProperty('--gc-sway-y', swayY.toFixed(2) + 'px');

    requestAnimationFrame(tick);
  }

  window.addEventListener('mousemove', onMove, { passive: true });
  requestAnimationFrame(tick);
})();
