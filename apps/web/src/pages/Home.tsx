import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';

export function Home() {
  const { authEnabled, user } = useAuth();
  const { t } = useI18n();

  const cards = [
    { to: '/workspace', key: 'workspace', cta: t('common.open'), accent: 'workspace' },
    { to: '/crew', key: 'crew', cta: t('common.go'), accent: 'crew' },
    { to: '/match', key: 'match', cta: t('common.open'), accent: 'match' },
  ] as const;

  const steps = [
    { num: '01', titleKey: 'flow1Title', descKey: 'flow1Desc' },
    { num: '02', titleKey: 'flow2Title', descKey: 'flow2Desc' },
    { num: '03', titleKey: 'flow3Title', descKey: 'flow3Desc' },
  ] as const;

  const stats = [
    { val: t('home.statOutflowVal'), label: t('home.statOutflowLabel') },
    { val: t('home.statJobsVal'), label: t('home.statJobsLabel') },
    { val: t('home.statLerLabel'), label: t('home.statLerSub') },
    { val: t('home.statStepLabel'), label: t('home.statStepSub') },
  ] as const;

  const lerLines = ['lerCmd', 'lerLine1', 'lerLine2', 'lerLine3', 'lerLine4'] as const;

  return (
    <div className="app-home app-home--fx app-home--framer app-home--gig">
      <div className="home-fx-orb home-fx-orb--a" aria-hidden />
      <div className="home-fx-orb home-fx-orb--b" aria-hidden />
      <div className="home-fx-grid" aria-hidden />

      <div className="app-home-inner app-home-gig">
        <header className="home-gig-hero">
          <div className="home-hero-pill">
            <span className="home-hero-pill-dot" />
            {t('home.platformTag')}
          </div>
          <h1 className="home-fit-title">
            <span className="home-fit-title-line">{t('home.heroLine1')}</span>
            {(t('home.heroEm') || t('home.heroLine2')) ? (
              <span className="home-fit-title-line">
                <em>{t('home.heroEm')}</em>
                {t('home.heroLine2')}
              </span>
            ) : null}
          </h1>
          <p className="home-fit-lead">
            <span className="home-fit-lead-line">{t('home.heroLeadLine1')}</span>
            <span className="home-fit-lead-line">{t('home.heroLeadLine2')}</span>
            <span className="home-fit-lead-line">{t('home.heroLeadLine3')}</span>
          </p>
          <div className="home-hero-actions home-hero-actions--glass">
            <Link to="/workspace" className="home-hero-btn home-hero-btn--glass home-hero-btn--gold">
              {t('home.heroCtaProgram')} →
            </Link>
            <Link to="/crew" className="home-hero-btn home-hero-btn--glass">
              {t('home.heroCtaLer')}
            </Link>
            <Link to="/match" className="home-hero-btn home-hero-btn--glass home-hero-btn--muted">
              {t('home.heroCtaMatch')}
            </Link>
          </div>
          {authEnabled && user && <p className="app-home-meta">{user.email}</p>}
        </header>

        <section className="home-gig-stats" aria-label="Regional metrics">
          {stats.map(({ val, label }) => (
            <div key={label} className="home-gig-stat">
              <div className="home-gig-stat-val">{val}</div>
              <div className="home-gig-stat-label">{label}</div>
            </div>
          ))}
        </section>

        <section className="home-fit-flow" aria-labelledby="home-flow-heading">
          <div className="home-fit-section-head">
            <h2 id="home-flow-heading">{t('home.flowTitle')}</h2>
            <p>{t('home.flowSub')}</p>
          </div>
          <div className="home-fit-steps">
            {steps.map(({ num, titleKey, descKey }, i) => (
              <div key={num} className="home-fit-step-wrap">
                {i > 0 && (
                  <span className="home-fit-step-arrow" aria-hidden>
                    →
                  </span>
                )}
                <div className="home-fit-step">
                  <div className="home-step-num">{num}</div>
                  <h3>{t(`home.${titleKey}`)}</h3>
                  <p>{t(`home.${descKey}`)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="home-gig-ler" aria-labelledby="home-ler-heading">
          <h2 id="home-ler-heading" className="home-gig-ler-title">
            {t('home.lerTitle')}
          </h2>
          <div className="home-gig-terminal" role="img" aria-label={t('home.lerTitle')}>
            {lerLines.map((key) => (
              <div
                key={key}
                className={'home-gig-terminal-line' + (key === 'lerCmd' ? ' cmd' : '')}
              >
                {t(`home.${key}`)}
              </div>
            ))}
          </div>
        </section>

        <section className="home-gig-value" aria-labelledby="home-value-heading">
          <h2 id="home-value-heading" className="visually-hidden">
            Value proposition
          </h2>
          <div className="home-gig-value-grid">
            <article className="home-gig-value-card">
              <span className="home-card-kicker">{t('home.valueYouthKicker')}</span>
              <h3>{t('home.valueYouthTitle')}</h3>
              <p>{t('home.valueYouthDesc')}</p>
            </article>
            <article className="home-gig-value-card">
              <span className="home-card-kicker">{t('home.valueBizKicker')}</span>
              <h3>{t('home.valueBizTitle')}</h3>
              <p>{t('home.valueBizDesc')}</p>
            </article>
          </div>
        </section>

        <section className="home-fit-modules" aria-labelledby="home-modules-heading">
          <div className="home-fit-section-head home-fit-section-head--center">
            <h2 id="home-modules-heading">{t('home.modulesTitle')}</h2>
            <p>{t('home.modulesSub')}</p>
          </div>
          <div className="home-fit-cards">
            {cards.map(({ to, key, cta, accent }) => (
              <Link key={key} to={to} className={`home-card home-card--compact home-card--${accent}`}>
                <span className="home-card-glow" aria-hidden />
                <span className="home-card-kicker">{t(`home.${key}Kicker`)}</span>
                <h3>{t(`home.${key}Title`)}</h3>
                <p>{t(`home.${key}Desc`)}</p>
                <span className="home-card-cta">
                  {cta} <span aria-hidden>→</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="home-gig-cta" aria-labelledby="home-cta-heading">
          <h2 id="home-cta-heading">{t('home.ctaTitle')}</h2>
          <p>{t('home.ctaSub')}</p>
          <div className="home-hero-actions home-gig-cta-actions">
            <a
              href="https://www.gigcareer.kr/ko/"
              target="_blank"
              rel="noreferrer"
              className="home-hero-btn home-hero-btn--primary"
            >
              gigcareer.kr →
            </a>
            <a
              href="https://www.gigcareer.kr/ko/"
              target="_blank"
              rel="noreferrer"
              className="home-hero-btn home-hero-btn--ghost"
            >
              {t('home.ctaReport')} →
            </a>
          </div>
        </section>

        <footer className="app-home-foot home-fit-foot">
          {authEnabled && !user && (
            <p>
              {t('home.cloudHint')}{' '}
              <Link to="/login">{t('home.login')}</Link> · <Link to="/signup">{t('home.signup')}</Link>
            </p>
          )}
          <a href="https://www.gigcareer.kr/ko/" target="_blank" rel="noreferrer" className="app-home-link">
            gigcareer.kr
          </a>
        </footer>
      </div>
    </div>
  );
}
