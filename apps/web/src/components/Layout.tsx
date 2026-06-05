import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppToolbar } from './AppToolbar';
import { LangSwitch } from './LangSwitch';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { useEmbedMode } from '../hooks/useEmbedMode';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, authEnabled, signOut } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const loc = useLocation();
  const embed = useEmbedMode();

  const navClass = (path: string) => (loc.pathname === path ? 'active' : '');

  return (
    <div className={'layout-shell' + (embed ? ' layout-shell--embed' : '')}>
      {!embed && (
      <header className="site-nav">
        <Link to="/" className="logo">
          <span className="logo-mark" aria-hidden />
          D-GIG
        </Link>
        <ul className="nav-links">
          <li>
            <Link to="/" className={navClass('/')}>
              {t('nav.home')}
            </Link>
          </li>
          <li>
            <Link to="/match" className={navClass('/match')}>
              {t('nav.match')}
            </Link>
          </li>
          <li>
            <Link to="/crew" className={navClass('/crew')}>
              {t('nav.crew')}
            </Link>
          </li>
          <li>
            <Link to="/workspace" className={navClass('/workspace')}>
              {t('nav.workspace')}
            </Link>
          </li>
        </ul>
        <div className="nav-end">
          <LangSwitch />
          {authEnabled && !user && (
            <>
              <Link to="/login" className="link-btn">
                {t('auth.login')}
              </Link>
              <Link to="/signup" className="nav-cta">
                {t('auth.signup')}
              </Link>
            </>
          )}
          {authEnabled && user && (
            <>
              <span className="user-email">{user.email}</span>
              <button
                type="button"
                className="link-btn"
                onClick={async () => {
                  await signOut();
                  navigate('/');
                }}
              >
                {t('auth.logout')}
              </button>
            </>
          )}
        </div>
      </header>
      )}
      {embed && (
        <div className="embed-demo-bar" role="note">
          D-GIG Web Demo · Match · LER · Workspace (browser)
        </div>
      )}
      <AppToolbar />
      <main className="layout-main">{children}</main>
    </div>
  );
}
