(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

  var root = document.documentElement;
  root.classList.add('gc-cursor-on');

  var cx = 0.5;
  var cy = 0.35;
  var tx = 0.5;
  var ty = 0.35;
  var grids = document.querySelectorAll('.hero-grid, .hero-grid-bg');

  document.querySelectorAll('#hero').forEach(function (hero) {
    if (hero.querySelector('.gc-hero-spotlight')) return;
    var spot = document.createElement('div');
    spot.className = 'gc-hero-spotlight';
    spot.setAttribute('aria-hidden', 'true');
    hero.insertBefore(spot, hero.firstChild);
  });

  function onMove(e) {
    tx = e.clientX / window.innerWidth;
    ty = e.clientY / window.innerHeight;
    var ox = (tx - 0.5) * 28;
    var oy = (ty - 0.5) * 20;
    grids.forEach(function (g) {
      g.style.transform = 'translate(' + ox + 'px, ' + oy + 'px)';
    });
  }

  function tick() {
    cx += (tx - cx) * 0.1;
    cy += (ty - cy) * 0.1;
    root.style.setProperty('--gc-cx', (cx * 100).toFixed(2) + '%');
    root.style.setProperty('--gc-cy', (cy * 100).toFixed(2) + '%');
    requestAnimationFrame(tick);
  }

  window.addEventListener('mousemove', onMove, { passive: true });
  requestAnimationFrame(tick);
})();
