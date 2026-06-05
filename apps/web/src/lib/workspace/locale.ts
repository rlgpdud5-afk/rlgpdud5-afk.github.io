import type { Locale } from '../../context/I18nContext';

export function getWorkspaceLocale(): Locale {
  if (typeof window === 'undefined') return 'ko';
  const urlLang = new URLSearchParams(window.location.search).get('lang');
  if (urlLang === 'en' || urlLang === 'ko' || urlLang === 'zh' || urlLang === 'es') return urlLang;
  const saved = localStorage.getItem('dgig-locale');
  return saved === 'en' || saved === 'ko' || saved === 'zh' || saved === 'es' ? saved : 'ko';
}
