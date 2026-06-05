import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { localizeUser, useLocalize } from '../../i18n/localizeDisplay';
import { CrewTopBar } from '../../components/CrewTopBar';
import { CREW_USERS } from '../../lib/crew/seed';
import { crewStore } from '../../lib/crew/store';
import { PORT_TEMPLATES, type PortTemplateKey } from '../../lib/crew/portfolioSeed';
import { PortPreview } from './PortfolioDocs';
import '../../portfolio.css';
import '../../crew.css';

/** Read-only portfolio view from shared link (?tpl=resume&creds=c1,c2) */
export function PortfolioSharePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const tpl = (params.get('tpl') as PortTemplateKey) || 'project';
  const credIds = (params.get('creds') || '').split(',').filter(Boolean);

  const loc = useLocalize();
  const user = useMemo(() => localizeUser(CREW_USERS.maker, loc.locale), [loc.locale]);
  const all = crewStore.getCredentials(99);
  const creds = useMemo(() => {
    if (!credIds.length) return all;
    return all.filter((c) => credIds.includes(c.id));
  }, [all, credIds]);

  const tplName = PORT_TEMPLATES.find((t) => t.k === tpl)?.name || tpl;

  return (
    <div className="crew-root" style={{ padding: 24 }}>
      <CrewTopBar title={`공유 · ${tplName}`} onBack={() => navigate('/crew')} />
      <h1 style={{ fontSize: 20, margin: '16px 0 8px' }}>공유 포트폴리오 · {tplName}</h1>
      <p style={{ fontSize: 13, color: 'var(--crew-muted)', marginBottom: 20 }}>
        {user.name} · LER {creds.length}건
      </p>
      <PortPreview tpl={tpl} user={user} creds={creds.length ? creds : all} />
    </div>
  );
}
