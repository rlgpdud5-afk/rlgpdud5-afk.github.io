(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var root = document.documentElement;
  root.classList.add('gc-motion-on');

  var nav = document.querySelector('nav.site-nav, nav.gnav, nav:not(.demo-tabs)');
  var chrome = document.querySelector('header.demo-chrome');
  var hero = document.getElementById('hero');
  var ticking = false;

  function syncNavHeight() {
    var bar = nav || chrome;
    if (!bar) return;
    var h = Math.ceil(bar.getBoundingClientRect().height);
    root.style.setProperty('--gc-nav-h', h + 'px');
    root.classList.add('gc-nav-sync');
  }

  syncNavHeight();
  window.addEventListener('resize', syncNavHeight);
  if (typeof ResizeObserver !== 'undefined') {
    var roTarget = nav || chrome;
    if (roTarget) new ResizeObserver(syncNavHeight).observe(roTarget);
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (nav) nav.classList.toggle('gc-nav--scrolled', y > 20);

      if (hero) {
        var h = hero.offsetHeight || 1;
        var p = Math.min(y / h, 1);
        hero.style.setProperty('--gc-hero-y', (p * 16).toFixed(2) + 'px');
        hero.style.setProperty('--gc-grid-y', (p * -22).toFixed(2) + 'px');

        var chips = hero.querySelectorAll('.gc-chip');
        chips.forEach(function (chip, i) {
          var drift = (p * (8 + i * 4)).toFixed(2);
          chip.style.setProperty('--gc-chip-y', drift + 'px');
        });
      }

      document.querySelectorAll('[data-visual-scene]').forEach(function (scene) {
        var rect = scene.getBoundingClientRect();
        var vh = window.innerHeight || 1;
        var progress = 1 - Math.max(-vh, Math.min(vh, rect.top)) / vh;
        progress = Math.max(0, Math.min(1, progress));
        scene.style.setProperty('--scene-p', progress.toFixed(3));
      });

      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function injectHeroLayers() {
    if (!hero || hero.querySelector('.gc-hero-ambient')) return;

    hero.classList.add('gc-hero-motion');

    var ambient = document.createElement('div');
    ambient.className = 'gc-hero-ambient';
    ambient.setAttribute('aria-hidden', 'true');
    ambient.innerHTML =
      '<div class="gc-orb gc-orb--1"></div>' +
      '<div class="gc-orb gc-orb--2"></div>' +
      '<div class="gc-orb gc-orb--3"></div>';
    hero.insertBefore(ambient, hero.firstChild);

    var isDark = !!hero.querySelector('.hero-h');
    if (!isDark) {
      var chips = document.createElement('div');
      chips.className = 'gc-float-chips';
      chips.setAttribute('aria-hidden', 'true');
      chips.innerHTML =
        '<div class="gc-chip gc-chip--a"><strong>LER</strong><span>Verified work record</span></div>' +
        '<div class="gc-chip gc-chip--b"><strong>Local → Global</strong><span>3-step career path</span></div>' +
        '<div class="gc-chip gc-chip--c"><strong>D-GIG</strong><span>Regional talent platform</span></div>';
      hero.appendChild(chips);
    }

    var title = hero.querySelector('h1, .hero-h');
    if (title && !title.querySelector('.gc-line')) {
      var html = title.innerHTML;
      var parts = html.split(/<br\s*\/?>/i);
      title.innerHTML = parts
        .map(function (line) {
          return (
            '<span class="gc-line"><span class="gc-line-inner">' +
            line.trim() +
            '</span></span>'
          );
        })
        .join('');
    }

    var demo = hero.querySelector('.demo-entry');
    if (demo) demo.classList.add('gc-glass-panel');

    var stats = hero.querySelector('.hero-stats');
    if (stats && !hero.querySelector('.gc-marquee')) {
      var items = Array.from(stats.querySelectorAll('.hs')).map(function (hs) {
        var val = hs.querySelector('.hs-val');
        var lbl = hs.querySelector('.hs-lbl');
        return (
          '<div class="gc-marquee-item">' +
          '<span class="gc-marquee-val">' +
          (val ? val.textContent.trim() : '') +
          '</span>' +
          '<span class="gc-marquee-lbl">' +
          (lbl ? lbl.textContent.trim() : '') +
          '</span>' +
          '</div>'
        );
      });

      if (items.length) {
        var marquee = document.createElement('div');
        marquee.className = 'gc-marquee';
        marquee.setAttribute('aria-hidden', 'true');
        var track = document.createElement('div');
        track.className = 'gc-marquee-track';
        var joined = items.concat(items).join('');
        track.innerHTML = joined;
        marquee.appendChild(track);
        stats.insertAdjacentElement('afterend', marquee);
      }
    }
  }

  function upgradeReveal() {
    var pending = document.querySelectorAll('.rv');
    var toWatch = [];

    pending.forEach(function (el) {
      el.classList.add('gc-rv-pending');
      if (el.classList.contains('on')) {
        el.classList.add('gc-rv-on');
      } else {
        toWatch.push(el);
      }
    });

    if (!toWatch.length) return;

    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var target = entry.target;
          var siblings = Array.from(
            target.parentElement.querySelectorAll('.rv.gc-rv-pending:not(.gc-rv-on)')
          );
          var i = siblings.indexOf(target);
          setTimeout(function () {
            target.classList.add('on', 'gc-rv-on');
          }, i * 90);
          obs.unobserve(target);

          var sec = target.closest('.sec');
          if (sec) sec.classList.add('gc-sec-lit');
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );

    toWatch.forEach(function (el) {
      obs.observe(el);
    });
  }

  function initGsapScrollMotion() {
    if (!window.gsap || !window.ScrollTrigger) return;

    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);

    if (hero && hero.classList.contains('hero-section')) {
      var heroGrid = hero.querySelector('.hero-grid');
      if (heroGrid) {
        gsap.to(heroGrid, {
          backgroundPosition: '50% 100%',
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: 'bottom top',
            scrub: true
          }
        });
      }
    }

    gsap.utils.toArray('.sec-h, .visual-title').forEach(function (title) {
      gsap.from(title, {
        scrollTrigger: { trigger: title, start: 'top 82%' },
        y: 60,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out'
      });
    });

    gsap.utils.toArray('.paradox-grid, .shift-facts, .sol-steps, .val-split').forEach(function (group) {
      gsap.from(group.children, {
        scrollTrigger: { trigger: group, start: 'top 74%' },
        y: 42,
        opacity: 0,
        stagger: 0.15,
        duration: 0.65,
        ease: 'power2.out'
      });
    });

    gsap.utils.toArray('.visual-image').forEach(function (img) {
      var scene = img.closest('[data-visual-scene]');
      if (!scene) return;
      gsap.fromTo(img,
        { y: 80, scale: 0.94, opacity: 0.8 },
        {
          y: -48,
          scale: 1.04,
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: scene,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
          }
        }
      );
    });
  }

  injectHeroLayers();
  upgradeReveal();
  window.addEventListener('load', initGsapScrollMotion);
})();
