import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './app-motion.css';
import './home-framer.css';

import { resolveScrollSurface, scrollSurfaceClass } from './lib/scrollMode';

(function initScrollMode() {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  const q = new URLSearchParams(window.location.search);
  let embed = q.get('embed') === '1';
  try {
    if (!embed) embed = window.self !== window.top;
  } catch {
    embed = true;
  }
  const panel = hash.startsWith('/crew') || hash.startsWith('/workspace');
  const html = document.documentElement;
  html.classList.remove('dgig-page', 'dgig-frame', 'dgig-panel');
  html.classList.add(scrollSurfaceClass(resolveScrollSurface(embed, panel)));
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
