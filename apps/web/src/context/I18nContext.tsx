import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { en } from '../i18n/en';
import { es } from '../i18n/es';
import { ko, type Messages } from '../i18n/ko';
import { zh } from '../i18n/zh';

export type Locale = 'ko' | 'en' | 'zh' | 'es';

const MESSAGES: Record<Locale, Messages> = { ko, en, zh, es };

const STORAGE_KEY = 'dgig-locale';

type I18nContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string>) => string;
  messages: Messages;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function getByPath(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split('.');
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === 'string' ? cur : undefined;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const urlLang = new URLSearchParams(window.location.search).get('lang');
    if (urlLang === 'en' || urlLang === 'ko' || urlLang === 'zh' || urlLang === 'es') return urlLang;
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'en' || saved === 'ko' || saved === 'zh' || saved === 'es' ? saved : 'ko';
  });

  const messages = MESSAGES[locale];

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }, []);

  useEffect(() => {
    document.documentElement.lang =
      locale === 'en' ? 'en' : locale === 'zh' ? 'zh-Hans' : locale === 'es' ? 'es' : 'ko';
  }, [locale]);

  const t = useCallback(
    (key: string, vars?: Record<string, string>) => {
      const raw = getByPath(messages as unknown as Record<string, unknown>, key) ?? key;
      if (!vars) return raw;
      return raw.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? `{${k}}`);
    },
    [messages],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, messages }),
    [locale, setLocale, t, messages],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
