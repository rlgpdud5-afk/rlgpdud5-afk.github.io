export function isElectronApp(): boolean {
  return typeof window !== 'undefined' && !!(window.dgigFs || window.dgigTerminal);
}

export type ScrollSurface = 'panel' | 'frame' | 'page';

/** iframe embed only — desktop Electron uses document scroll like the marketing site */
export function resolveScrollSurface(embed: boolean, panel: boolean): ScrollSurface {
  if (panel) return 'panel';
  if (embed) return 'frame';
  return 'page';
}

export function scrollSurfaceClass(surface: ScrollSurface): string {
  if (surface === 'panel') return 'dgig-panel';
  if (surface === 'frame') return 'dgig-frame';
  return 'dgig-page';
}
