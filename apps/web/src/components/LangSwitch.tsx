import { useI18n, type Locale } from '../context/I18nContext';

export function LangSwitch() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="lang-switch" role="group" aria-label="Language">
      {(['ko', 'en', 'zh', 'es'] as Locale[]).map((l) => (
        <button
          key={l}
          type="button"
          className={'lang-switch-btn' + (locale === l ? ' on' : '')}
          onClick={() => setLocale(l)}
        >
          {l === 'ko' ? 'KO' : l === 'en' ? 'EN' : l === 'zh' ? '中文' : 'ES'}
        </button>
      ))}
    </div>
  );
}
