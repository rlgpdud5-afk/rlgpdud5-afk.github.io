import { Link, useLocation } from 'react-router-dom';
import { BackButton } from './BackButton';
import { useI18n } from '../context/I18nContext';

export function AppToolbar() {
  const { pathname } = useLocation();
  const { t } = useI18n();

  if (pathname === '/') return null;

  const title =
    pathname === '/match'
      ? t('match.toolbar')
      : pathname === '/login'
        ? t('auth.login')
        : pathname === '/signup'
          ? t('auth.signup')
          : 'D-GIG';

  return (
    <div className="app-toolbar">
      <BackButton fallback="/" />
      <span className="app-toolbar-title">{title}</span>
      <Link to="/" className="app-toolbar-home">
        {t('common.home')}
      </Link>
    </div>
  );
}
