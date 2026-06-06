import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useEmbedMode } from '../hooks/useEmbedMode';
import { resolveScrollSurface, scrollSurfaceClass } from '../lib/scrollMode';

const SURFACES = ['dgig-page', 'dgig-frame', 'dgig-panel'] as const;

/** Single scroll: layout-main (Electron + iframe) | document (browser) | panel internal */
export function ScrollMode() {
  const embed = useEmbedMode();
  const { pathname } = useLocation();
  const panel = pathname.startsWith('/crew') || pathname.startsWith('/workspace');

  useEffect(() => {
    const html = document.documentElement;
    const cls = scrollSurfaceClass(resolveScrollSurface(embed, panel));
    html.classList.remove(...SURFACES);
    html.classList.add(cls);
    return () => html.classList.remove(cls);
  }, [embed, panel]);

  return null;
}
