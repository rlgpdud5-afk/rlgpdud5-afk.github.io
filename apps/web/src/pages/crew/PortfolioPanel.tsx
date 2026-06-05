import { useMemo, useRef, useState } from 'react';
import { useI18n } from '../../context/I18nContext';
import { localizeUser, useLocalize } from '../../i18n/localizeDisplay';
import { copyShareText, exportElementToPdf } from '../../lib/crew/exportPdf';
import { MOCK_APPLY_JOBS, PORT_TEMPLATES, type PortTemplateKey } from '../../lib/crew/portfolioSeed';
import type { CrewUser, Credential } from '../../lib/crew/types';
import { PortPreview } from './PortfolioDocs';
import '../../portfolio.css';

interface PortfolioPanelProps {
  user: CrewUser;
  allCredentials: Credential[];
}

export function PortfolioPanel({ user, allCredentials }: PortfolioPanelProps) {
  const { t } = useI18n();
  const loc = useLocalize();
  const displayUser = useMemo(() => localizeUser(user, loc.locale), [user, loc.locale]);
  const templates = useMemo(
    () =>
      PORT_TEMPLATES.map((tpl) => ({
        ...tpl,
        name: t(`crew.portfolio.tpl.${tpl.k}.name`),
        desc: t(`crew.portfolio.tpl.${tpl.k}.desc`),
      })),
    [t],
  );
  const jobs = useMemo(
    () =>
      MOCK_APPLY_JOBS.map((j) => ({
        ...j,
        company: loc.company(j.company),
        title: t(`crew.portfolio.jobs.${j.id}.title`),
        summary: t(`crew.portfolio.jobs.${j.id}.summary`),
        emphasis: t(`crew.portfolio.jobs.${j.id}.emphasis`),
      })),
    [t, loc],
  );

  const [tab, setTab] = useState<'builder' | 'ai'>('builder');
  const [tpl, setTpl] = useState<PortTemplateKey>('project');
  const [selected, setSelected] = useState<string[]>(() => allCredentials.map((c) => c.id));
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);
  const [aiJobId, setAiJobId] = useState(MOCK_APPLY_JOBS[0].id);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const [toast, setToast] = useState('');

  const previewRef = useRef<HTMLDivElement>(null);
  const aiPreviewRef = useRef<HTMLDivElement>(null);

  const creds = allCredentials.filter((c) => selected.includes(c.id));
  const job = jobs.find((j) => j.id === aiJobId) || jobs[0];
  const activeTpl = templates.find((x) => x.k === tpl);

  const aiCreds = useMemo(() => {
    const order = job.reorder;
    return [...creds].sort((a, b) => {
      const ia = order.indexOf(a.id);
      const ib = order.indexOf(b.id);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
  }, [creds, job.reorder]);

  const displayCreds = creds.length ? creds : allCredentials;

  const toggleCred = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setDone(false);
    setAiDone(false);
  };

  const generate = () => {
    if (!selected.length) return;
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setDone(true);
    }, 1200);
  };

  const generateAi = () => {
    setAiGenerating(true);
    setTimeout(() => {
      setAiGenerating(false);
      setAiDone(true);
    }, 1400);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const downloadPdf = (ref: React.RefObject<HTMLDivElement | null>, name: string) => {
    const el = ref.current?.querySelector('.port-doc') as HTMLElement | null;
    if (!el) {
      showToast(t('crew.portfolio.toastPreview'));
      return;
    }
    exportElementToPdf(el, name);
  };

  const shareLink = async () => {
    const params = new URLSearchParams({ tpl, creds: selected.join(','), tab });
    const url = `${window.location.origin}/crew/portfolio?${params.toString()}`;
    const ok = await copyShareText(url);
    showToast(ok ? t('crew.portfolio.toastCopied') : t('crew.portfolio.toastCopyFail'));
  };

  return (
    <div>
      <div className="crew-ph">
        <h1>{t('crew.portfolio.title')}</h1>
        <p>{t('crew.portfolio.sub')}</p>
      </div>
      <div className="crew-content">
        <div className="port-tabs">
          <button type="button" className={tab === 'builder' ? 'on' : ''} onClick={() => setTab('builder')}>
            {t('crew.portfolio.tabBuilder')}
          </button>
          <button type="button" className={tab === 'ai' ? 'on' : ''} onClick={() => setTab('ai')}>
            {t('crew.portfolio.tabAi')}
          </button>
        </div>

        {tab === 'builder' && (
          <div className="port-layout">
            <div className="port-side">
              <div className="crew-glass" style={{ padding: 18, marginBottom: 12 }}>
                <div className="port-ct">{t('crew.portfolio.templates')}</div>
                <div className="port-tpl-grid">
                  {templates.map((item) => (
                    <button
                      key={item.k}
                      type="button"
                      className={'port-tpl-card' + (tpl === item.k ? ' on' : '')}
                      onClick={() => {
                        setTpl(item.k);
                        setDone(false);
                      }}
                    >
                      <div className={'port-tpl-mini port-tpl-mini--' + item.k} />
                      <div className="pt-name">{item.name}</div>
                      <div className="pt-desc">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="crew-glass" style={{ padding: 18, marginBottom: 12 }}>
                <div className="port-ct">{t('crew.portfolio.includeLer')}</div>
                {allCredentials.map((c) => (
                  <label key={c.id} className="port-cred-row">
                    <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggleCred(c.id)} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 550 }}>{loc.text(c.project)}</div>
                      <div style={{ fontSize: 11, color: 'var(--crew-muted)' }}>{loc.text(c.task)}</div>
                    </div>
                    <span style={{ color: '#f59e0b', fontSize: 12 }}>★{c.rating}</span>
                  </label>
                ))}
              </div>
              <button
                type="button"
                className="crew-btn crew-btn-p"
                style={{ width: '100%', marginBottom: 8 }}
                disabled={generating || !selected.length}
                onClick={generate}
              >
                {generating ? t('crew.portfolio.mapping') : t('crew.portfolio.generate')}
              </button>
              {done && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="crew-btn crew-btn-s crew-btn-sm"
                    onClick={() => downloadPdf(previewRef, `GigCareer_${displayUser.name}_${tpl}`)}
                  >
                    {t('crew.portfolio.pdf')}
                  </button>
                  <button type="button" className="crew-btn crew-btn-s crew-btn-sm" onClick={() => void shareLink()}>
                    {t('crew.portfolio.copyLink')}
                  </button>
                </div>
              )}
            </div>
            <div className="port-preview-wrap" ref={previewRef}>
              <div className="port-preview-label">
                <span>{activeTpl?.name}</span>
                {!done && <span className="hint">{t('crew.portfolio.renderHint')}</span>}
              </div>
              {generating && (
                <div className="crew-glass" style={{ padding: 40, textAlign: 'center' }}>
                  {t('crew.portfolio.mappingBox')}
                </div>
              )}
              {!generating && done && <PortPreview tpl={tpl} user={displayUser} creds={displayCreds} />}
              {!generating && !done && (
                <div className="crew-glass port-placeholder">{t('crew.portfolio.placeholder')}</div>
              )}
            </div>
          </div>
        )}

        {tab === 'ai' && (
          <div className="port-layout">
            <div className="port-side">
              <div className="crew-glass" style={{ padding: 18, marginBottom: 12 }}>
                <div className="port-ct">{t('crew.portfolio.aiStep1')}</div>
                <p style={{ fontSize: 12, color: 'var(--crew-muted)', marginBottom: 12, lineHeight: 1.6 }}>
                  {t('crew.portfolio.aiStep1Hint')}
                </p>
                {jobs.map((j) => (
                  <button
                    key={j.id}
                    type="button"
                    className={'port-ai-job' + (aiJobId === j.id ? ' on' : '')}
                    onClick={() => {
                      setAiJobId(j.id);
                      setAiDone(false);
                    }}
                  >
                    <div className="aj-co">{j.company}</div>
                    <div className="aj-ti">{j.title}</div>
                  </button>
                ))}
              </div>
              <div className="crew-glass" style={{ padding: 18, marginBottom: 12 }}>
                <div className="port-ct">{t('crew.portfolio.aiStep2')}</div>
                <select className="crew-input" value={tpl} onChange={(e) => setTpl(e.target.value as PortTemplateKey)}>
                  {templates.map((item) => (
                    <option key={item.k} value={item.k}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="crew-btn crew-btn-p"
                style={{ width: '100%', background: 'linear-gradient(135deg,#7c3aed,#a78bfa)' }}
                disabled={aiGenerating}
                onClick={generateAi}
              >
                {aiGenerating ? t('crew.portfolio.aiGenerating') : t('crew.portfolio.aiGenerate')}
              </button>
              {aiDone && (
                <button
                  type="button"
                  className="crew-btn crew-btn-s crew-btn-sm"
                  style={{ marginTop: 8, width: '100%' }}
                  onClick={() => downloadPdf(aiPreviewRef, `GigCareer_AI_${job.company}_${displayUser.name}`)}
                >
                  {t('crew.portfolio.pdf')}
                </button>
              )}
            </div>
            <div ref={aiPreviewRef}>
              {aiDone ? (
                <>
                  <div
                    className="crew-glass"
                    style={{ padding: 16, marginBottom: 16, border: '1px solid rgba(139,92,246,.35)' }}
                  >
                    <div style={{ fontSize: 12, color: '#c4b5fd', fontWeight: 600, marginBottom: 6 }}>
                      {t('crew.portfolio.aiSummary', { emphasis: job.emphasis })}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--crew-muted)', margin: 0, lineHeight: 1.65 }}>{job.summary}</p>
                    <div className="port-ai-kw">
                      {job.keywords.map((k) => (
                        <span key={k}>{loc.text(k)}</span>
                      ))}
                    </div>
                  </div>
                  <div className="port-ai-diff">
                    <div className="port-ai-col">
                      <h5>{t('crew.portfolio.aiDefault')}</h5>
                      <PortPreview tpl={tpl} user={displayUser} creds={displayCreds} />
                    </div>
                    <div className="port-ai-col tailored">
                      <h5>{t('crew.portfolio.aiTailored', { company: job.company })}</h5>
                      <PortPreview tpl={tpl} user={displayUser} creds={aiCreds.length ? aiCreds : displayCreds} />
                    </div>
                  </div>
                </>
              ) : (
                <div className="crew-glass port-placeholder">{t('crew.portfolio.aiPlaceholder')}</div>
              )}
            </div>
          </div>
        )}
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
