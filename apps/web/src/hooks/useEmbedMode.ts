import { useMemo } from 'react';

/** gigcareer.kr iframe embed — hide duplicate chrome */
export function useEmbedMode(): boolean {
  return useMemo(() => {
    if (typeof window === 'undefined') return false;
    const q = new URLSearchParams(window.location.search);
    if (q.get('embed') === '1') return true;
    try {
      return window.self !== window.top;
    } catch {
      return false;
    }
  }, []);
}
