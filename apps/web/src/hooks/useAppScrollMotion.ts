import { useEffect, useRef } from 'react';

function isFrameScroll() {
  return document.documentElement.classList.contains('dgig-frame');
}

export function useAppScrollMotion() {
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const frame = isFrameScroll();
    const scope: ParentNode = frame ? main : document;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.documentElement.classList.add('app-motion-on');

    const nav = document.querySelector('.site-nav');
    let ticking = false;

    const scrollY = () => (frame ? (main.scrollTop ?? 0) : window.scrollY);

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = scrollY();
        nav?.classList.toggle('app-nav--scrolled', y > 16);

        if (!reduceMotion) {
          const hero = scope.querySelector<HTMLElement>('.home-gig-hero');
          if (hero) {
            const p = Math.min(y / 420, 1);
            hero.style.setProperty('--app-hero-y', `${(p * 12).toFixed(2)}px`);
          }

          scope.querySelectorAll<HTMLElement>('.home-fx-orb').forEach((orb, i) => {
            orb.style.setProperty('--app-orb-y', `${(y * (0.035 + i * 0.018)).toFixed(2)}px`);
          });
        }

        ticking = false;
      });
    };

    const scrollTarget: EventTarget = frame ? main : window;
    scrollTarget.addEventListener('scroll', onScroll as EventListener, { passive: true });
    onScroll();

    let revealObs: IntersectionObserver | undefined;

    const markVisible = (el: Element, delay: number) => {
      window.setTimeout(() => {
        el.classList.add('app-rv--on');
        el.closest('.app-sec')?.classList.add('app-sec--lit');
      }, delay);
    };

    if (reduceMotion) {
      scope.querySelectorAll('.app-rv').forEach((el) => el.classList.add('app-rv--on'));
    } else {
      const pending = scope.querySelectorAll('.app-rv:not(.app-rv--on)');
      if (pending.length) {
        revealObs = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              const target = entry.target;
              const siblings = Array.from(
                target.parentElement?.querySelectorAll('.app-rv:not(.app-rv--on)') ?? [],
              );
              const i = siblings.indexOf(target);
              const delay = Number((target as HTMLElement).dataset.rvDelay ?? i * 85);
              markVisible(target, delay);
              revealObs?.unobserve(target);
            });
          },
          {
            root: frame ? main : null,
            threshold: 0.1,
            rootMargin: '0px 0px -5% 0px',
          },
        );
        pending.forEach((el) => revealObs!.observe(el));
      }
    }

    return () => {
      scrollTarget.removeEventListener('scroll', onScroll as EventListener);
      revealObs?.disconnect();
      document.documentElement.classList.remove('app-motion-on');
      nav?.classList.remove('app-nav--scrolled');
    };
  }, []);

  return mainRef;
}
