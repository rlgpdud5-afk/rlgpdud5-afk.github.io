import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CrewTopBar } from '../../components/CrewTopBar';
import { useI18n } from '../../context/I18nContext';
import { formatTemplate, nameMatchesQuery, useLocalize } from '../../i18n/localizeDisplay';
import '../../crew.css';
import { crewStore, taskStatusForDemo } from '../../lib/crew/store';
import {
  CREW_USERS,
  DEMO_NEW_CRED,
  FLOW_TASK_ID,
  MOCK_TALENTS,
} from '../../lib/crew/seed';
import type { CrewDb, CrewRole, CrewUser, Credential, Project, ProjectForm } from '../../lib/crew/types';
import { PortfolioPanel } from './PortfolioPanel';

type PageId =
  | 'dashboard'
  | 'projects'
  | 'tasks'
  | 'credentials'
  | 'portfolio'
  | 'review'
  | 'talent'
  | 'users';

const STATUS_CLASS: Record<string, string> = {
  진행중: 'bl',
  검수중: 'or',
  배정중: 'pu',
  완료: 'gr',
  배정됨: 'pu',
  제출완료: 'or',
  승인완료: 'gr',
  진행중_task: 'bl',
};

function StatusBadge({ s }: { s: string }) {
  const { t } = useI18n();
  const key =
    s === '진행중' ? 'bl' : ['검수중', '제출완료'].includes(s) ? 'or' : ['승인완료', '완료'].includes(s) ? 'gr' : 'gy';
  const label = t(`crew.status.${s}`) !== `crew.status.${s}` ? t(`crew.status.${s}`) : s;
  return <span className={`crew-badge ${STATUS_CLASS[s] || key}`}>{label}</span>;
}

function PBar({ v, color = 'var(--crew-warm)' }: { v: number; color?: string }) {
  return (
    <div className="crew-pbar">
      <div className="crew-pfill" style={{ width: `${v}%`, background: color }} />
    </div>
  );
}

function ProjectModal({
  open,
  onClose,
  onSubmit,
  clientLabel,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (f: ProjectForm) => void;
  clientLabel: string;
}) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    name: '',
    deadline: '',
    budget: '',
    security: '일반',
    description: '',
  });
  const [err, setErr] = useState('');
  if (!open) return null;
  return (
    <div className="crew-modal-bg" onClick={onClose} role="presentation">
      <div className="crew-modal" onClick={(e) => e.stopPropagation()} role="dialog">
        <h3 style={{ marginBottom: 12 }}>{t('crew.projectModal.title')}</h3>
        {err && <p style={{ color: '#f87171', fontSize: 12 }}>{err}</p>}
        <input
          className="crew-input"
          placeholder={t('crew.projectModal.namePh')}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="crew-input"
          placeholder={t('crew.projectModal.deadlinePh')}
          value={form.deadline}
          onChange={(e) => setForm({ ...form, deadline: e.target.value })}
        />
        <input
          className="crew-input"
          placeholder={t('crew.projectModal.budgetPh')}
          value={form.budget}
          onChange={(e) => setForm({ ...form, budget: e.target.value })}
        />
        <select
          className="crew-input"
          value={form.security}
          onChange={(e) => setForm({ ...form, security: e.target.value })}
        >
          <option value="일반">{t('crew.projectModal.securityStd')}</option>
          <option value="높음">{t('crew.projectModal.securityHigh')}</option>
        </select>
        <textarea
          className="crew-input"
          rows={3}
          placeholder={t('crew.projectModal.descPh')}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="crew-btn crew-btn-p"
            onClick={() => {
              if (!form.name.trim()) {
                setErr(t('crew.projectModal.nameRequired'));
                return;
              }
              const budgetRaw = form.budget.trim();
              const budget = budgetRaw
                ? budgetRaw.includes('원')
                  ? budgetRaw
                  : `${budgetRaw}원`
                : t('crew.projectModal.budgetTbd');
              onSubmit({
                ...form,
                name: form.name.trim(),
                deadline: form.deadline || '2026-06-30',
                budget,
                client: clientLabel,
              });
              setForm({ name: '', deadline: '', budget: '', security: '일반', description: '' });
              setErr('');
              onClose();
            }}
          >
            {t('crew.projectModal.submit')}
          </button>
          <button type="button" className="crew-btn crew-btn-s" onClick={onClose}>
            {t('crew.projectModal.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}

function MakerTasks({
  user,
  flow,
  db,
  onSubmit,
}: {
  user: CrewUser;
  flow: number;
  db: CrewDb;
  onSubmit: () => void;
}) {
  const { t } = useI18n();
  const loc = useLocalize();
  const mine = db.tasks.filter((task) => task.assignee === user.name);
  const projName = (id: string) => {
    const name = db.projects.find((p) => p.id === id)?.name;
    return name ? loc.text(name) : '—';
  };

  return (
    <div>
      <div className="crew-ph">
        <h1>{t('crew.tasks.title')}</h1>
        <p>{t('crew.tasks.sub')}</p>
      </div>
      <div className="crew-content">
        {mine.map((task) => {
          const status = taskStatusForDemo(task, flow);
          const isDemo = task.id === FLOW_TASK_ID;
          return (
            <div key={task.id} className="crew-glass" style={{ padding: 18, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{loc.text(task.name)}</div>
                  <div style={{ fontSize: 12, color: 'var(--crew-muted)' }}>{projName(task.projectId)}</div>
                </div>
                <StatusBadge s={status} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--crew-muted)', marginTop: 8 }}>
                {t('crew.tasks.deadline')} {task.deadline} · {task.skills.join(', ')}
              </div>
              {isDemo && flow === 0 && status === '진행중' && (
                <button
                  type="button"
                  className="crew-btn crew-btn-p"
                  style={{ marginTop: 12 }}
                  onClick={onSubmit}
                >
                  {t('crew.tasks.submitDemo')}
                </button>
              )}
              {isDemo && flow >= 1 && (
                <p style={{ marginTop: 10, fontSize: 12, color: 'var(--crew-success)' }}>
                  {t('crew.tasks.submittedHint')}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReviewPanel({ flow, onApprove }: { flow: number; onApprove: () => void }) {
  const { t } = useI18n();
  const loc = useLocalize();
  const pending = flow >= 1;
  const assignee = '김서연';
  const project = '로컬푸드 쇼핑몰 리뉴얼';
  return (
    <div>
      <div className="crew-ph">
        <h1>{t('crew.review.title')}</h1>
        <p>{t('crew.review.sub')}</p>
      </div>
      <div className="crew-content">
        <div className="crew-glass" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 8 }}>{t('crew.review.taskTitle')}</h3>
          <p style={{ fontSize: 13, color: 'var(--crew-muted)', marginBottom: 12 }}>
            {formatTemplate(t('crew.reviewAssignee'), {
              name: loc.name(assignee),
              project: loc.text(project),
            })}
          </p>
          <StatusBadge s={pending ? '제출완료' : '대기'} />
          {pending && flow < 2 && (
            <button type="button" className="crew-btn crew-btn-p" style={{ marginTop: 16 }} onClick={onApprove}>
              {t('crew.review.approve')}
            </button>
          )}
          {flow >= 2 && (
            <p style={{ marginTop: 12, color: 'var(--crew-success)', fontSize: 13 }}>
              {t('crew.review.approved', { id: DEMO_NEW_CRED.verifyId })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function CredentialsPanel({ flow, credentials }: { flow: number; credentials: Credential[] }) {
  const { t } = useI18n();
  const loc = useLocalize();
  const highlight = flow >= 2 ? DEMO_NEW_CRED.verifyId : null;
  return (
    <div>
      <div className="crew-ph">
        <h1>{t('crew.credentials.title')}</h1>
        <p>{t('crew.credentials.sub')}</p>
      </div>
      <div className="crew-content">
        <div className="crew-glass" style={{ padding: 16, marginBottom: 16, fontSize: 13, lineHeight: 1.7 }}>
          {t('crew.credentials.intro')}
        </div>
        {credentials.map((c) => (
          <div
            key={c.id}
            id={c.verifyId}
            className={'crew-glass crew-cred' + (c.isNew || c.verifyId === highlight ? ' new' : '')}
          >
            <div style={{ fontWeight: 600 }}>{loc.text(c.project)}</div>
            <div style={{ fontSize: 13, margin: '6px 0' }}>{loc.text(c.task)}</div>
            <div style={{ fontSize: 12, color: 'var(--crew-muted)' }}>
              {c.period} · ★{c.rating} · {c.skills.join(', ')}
            </div>
            <div className="vid" style={{ marginTop: 8 }}>
              {c.verifyId}
              {c.qaPass && (
                <span style={{ marginLeft: 8, color: 'var(--crew-success)' }}>QA {t('crew.credentials.qaPass')}</span>
              )}
            </div>
            <Link to={`/crew/verify/${encodeURIComponent(c.verifyId)}`} style={{ fontSize: 12, marginTop: 8, display: 'inline-block' }}>
              {t('crew.credentials.verifyLink')}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectsList({
  projects,
  onCreate,
}: {
  projects: Project[];
  onCreate: () => void;
}) {
  const { t } = useI18n();
  const loc = useLocalize();
  return (
    <div>
      <div className="crew-ph" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>{t('crew.projects.title')}</h1>
          <p>{t('crew.projects.sub')}</p>
        </div>
        <button type="button" className="crew-btn crew-btn-p" onClick={onCreate}>
          {t('crew.projects.add')}
        </button>
      </div>
      <div className="crew-content">
        {projects.map((p) => (
          <div key={p.id} className="crew-glass" style={{ padding: 18, marginBottom: 10 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontWeight: 600 }}>{loc.text(p.name)}</span>
              <StatusBadge s={p.status} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--crew-muted)' }}>
              {loc.company(p.client)} · {p.budget} · {t('crew.projects.deadline')} {p.deadline}
            </div>
            <PBar v={p.progress} />
            <div style={{ fontSize: 11, color: 'var(--crew-muted)', marginTop: 4 }}>
              {p.modules.map((m) => loc.text(m)).join(' · ')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TalentSearch() {
  const { t } = useI18n();
  const loc = useLocalize();
  const [q, setQ] = useState('');
  const filtered = MOCK_TALENTS.filter(
    (talent) =>
      !q ||
      nameMatchesQuery(talent.name, q, loc.locale) ||
      talent.region.includes(q) ||
      loc.region(talent.region).toLowerCase().includes(q.toLowerCase()) ||
      talent.skills.some((s) => s.includes(q)),
  );
  return (
    <div>
      <div className="crew-ph">
        <h1>{t('crew.talent.title')}</h1>
        <p>{t('crew.talent.sub')}</p>
      </div>
      <div className="crew-content">
        <input
          className="crew-input"
          placeholder={t('crew.talent.searchPh')}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ maxWidth: 360 }}
        />
        <div className="crew-g3">
          {filtered.map((talent) => (
            <div key={talent.id} className="crew-glass crew-talent">
              <div style={{ fontWeight: 600 }}>{loc.name(talent.name)}</div>
              <div style={{ fontSize: 12, color: 'var(--crew-muted)' }}>
                {loc.region(talent.region)} · {t('crew.talent.trust')} {talent.trustScore}
              </div>
              <div style={{ marginTop: 8, fontSize: 11 }}>{talent.skills.join(' · ')}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Dashboard({ role, user, db }: { role: CrewRole; user: CrewUser; db: CrewDb }) {
  const { t } = useI18n();
  const loc = useLocalize();
  return (
    <div>
      <div className="crew-ph">
        <h1>
          {role === 'admin'
            ? t('crew.dashboard.admin')
            : role === 'client'
              ? t('crew.dashboard.client')
              : role === 'reviewer'
                ? t('crew.dashboard.reviewer')
                : t('crew.dashboard.maker')}{' '}
          {t('crew.dashboard.title')}
        </h1>
        <p>
          {t('crew.hello')} {loc.name(user.name)}
        </p>
      </div>
      <div className="crew-content">
        <div className="crew-stats">
          <div className="crew-glass crew-stat">
            <div className="l">{t('crew.dashboard.statProjects')}</div>
            <div className="v">{db.projects.length}</div>
          </div>
          <div className="crew-glass crew-stat">
            <div className="l">{t('crew.dashboard.statTasks')}</div>
            <div className="v">{db.tasks.length}</div>
          </div>
          <div className="crew-glass crew-stat">
            <div className="l">{t('crew.dashboard.statLer')}</div>
            <div className="v" style={{ color: 'var(--crew-purple)' }}>
              {db.credentials.length}
            </div>
          </div>
          {user.trustScore != null && (
            <div className="crew-glass crew-stat">
              <div className="l">{t('crew.dashboard.statTrust')}</div>
              <div className="v" style={{ color: 'var(--crew-warm)' }}>
                {user.trustScore}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const NAV_IDS: Record<CrewRole, { id: PageId; labelKey: string }[]> = {
  maker: [
    { id: 'dashboard', labelKey: 'crew.nav.dashboard' },
    { id: 'tasks', labelKey: 'crew.nav.tasks' },
    { id: 'credentials', labelKey: 'crew.nav.credentials' },
    { id: 'portfolio', labelKey: 'crew.nav.portfolio' },
  ],
  reviewer: [
    { id: 'dashboard', labelKey: 'crew.nav.dashboard' },
    { id: 'review', labelKey: 'crew.nav.review' },
    { id: 'credentials', labelKey: 'crew.nav.credentials' },
  ],
  client: [
    { id: 'dashboard', labelKey: 'crew.nav.dashboard' },
    { id: 'projects', labelKey: 'crew.nav.projects' },
    { id: 'talent', labelKey: 'crew.nav.talent' },
  ],
  admin: [
    { id: 'dashboard', labelKey: 'crew.nav.ops' },
    { id: 'projects', labelKey: 'crew.nav.projects' },
    { id: 'review', labelKey: 'crew.nav.review' },
    { id: 'talent', labelKey: 'crew.nav.talent' },
    { id: 'users', labelKey: 'crew.nav.users' },
  ],
};

export function CrewPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const loc = useLocalize();
  const [role, setRole] = useState<CrewRole | null>(null);
  const [page, setPage] = useState<PageId>('dashboard');
  const [pageHistory, setPageHistory] = useState<PageId[]>([]);
  const [flow, setFlow] = useState(0);
  const [db, setDb] = useState<CrewDb>(() => crewStore.load());
  const [projModal, setProjModal] = useState(false);

  const refresh = useCallback(() => setDb(crewStore.load()), []);

  const goToPage = useCallback((next: PageId) => {
    setPageHistory((h) => (next === page ? h : [...h, page]));
    setPage(next);
  }, [page]);

  const handleCrewBack = useCallback(() => {
    if (pageHistory.length > 0) {
      const prev = pageHistory[pageHistory.length - 1];
      setPageHistory((h) => h.slice(0, -1));
      setPage(prev);
      return;
    }
    if (role) {
      setRole(null);
      setPage('dashboard');
      setFlow(0);
      return;
    }
    navigate('/');
  }, [pageHistory, role, navigate]);

  useEffect(() => {
    const unsub = crewStore.subscribe(refresh);
    return () => {
      unsub();
    };
  }, [refresh]);

  const user = role ? CREW_USERS[role] : null;
  const clientLabel = user?.name || (user?.company ? `(주)${user.company}` : '(주)로컬테크');
  const credentials = crewStore.getCredentials(flow);

  const submitFlow = () => {
    crewStore.submitDemoTask();
    setFlow(1);
    goToPage('review');
    if (role !== 'reviewer') {
      setPageHistory([]);
      setRole('reviewer');
    }
  };

  const approveFlow = () => {
    crewStore.approveDemoTask();
    setFlow(2);
    goToPage('credentials');
    refresh();
    setTimeout(() => {
      document.getElementById(DEMO_NEW_CRED.verifyId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  const roleCards = useMemo(
    () =>
      (['maker', 'reviewer', 'client', 'admin'] as const).map((k) => ({
        key: k,
        name: t(`crew.roles.${k}.name`),
        desc: t(`crew.roles.${k}.desc`),
      })),
    [t],
  );

  const navItems = useMemo(() => {
    if (!role) return [];
    return NAV_IDS[role].map((item) => ({ id: item.id, label: t(item.labelKey) }));
  }, [role, t]);

  if (!role || !user) {
    return (
      <div className="crew-root">
        <CrewTopBar title={t('crew.title')} onBack={() => navigate('/')} />
        <div className="crew-login">
          <div className="crew-glass crew-login-card">
            <h1 className="crew-login-title">
              {t('crew.title')} <span style={{ color: 'var(--crew-warm)' }}>{t('crew.mvp')}</span>
            </h1>
            <p style={{ fontSize: 13, color: 'var(--crew-muted)', lineHeight: 1.6 }}>{t('crew.loginSub')}</p>
            <div className="crew-roles">
              {roleCards.map(({ key: k, name: n, desc: d }) => (
                <button
                  key={k}
                  type="button"
                  className="crew-role"
                  onClick={() => {
                    setPageHistory([]);
                    setRole(k);
                    setFlow(0);
                    setPage(k === 'maker' ? 'tasks' : 'dashboard');
                  }}
                >
                  <div className="rn">{n}</div>
                  <div className="rd">{d}</div>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="crew-btn crew-btn-p"
              style={{ width: '100%' }}
              onClick={() => {
                setPageHistory([]);
                setRole('maker');
                setFlow(0);
                setPage('tasks');
              }}
            >
              {t('crew.demoStart')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (page) {
      case 'tasks':
        return role === 'maker' ? (
          <MakerTasks user={user} flow={flow} db={db} onSubmit={submitFlow} />
        ) : (
          <Dashboard role={role} user={user} db={db} />
        );
      case 'review':
        return <ReviewPanel flow={flow} onApprove={approveFlow} />;
      case 'credentials':
        return <CredentialsPanel flow={flow} credentials={credentials} />;
      case 'portfolio':
        return role === 'maker' ? (
          <PortfolioPanel user={user} allCredentials={credentials} />
        ) : (
          <Dashboard role={role} user={user} db={db} />
        );
      case 'projects':
        return <ProjectsList projects={db.projects} onCreate={() => setProjModal(true)} />;
      case 'talent':
        return <TalentSearch />;
      case 'users':
        return (
          <div>
            <div className="crew-ph">
              <h1>{t('crew.users.title')}</h1>
            </div>
            <div className="crew-content crew-glass" style={{ padding: 16 }}>
              <table className="crew-table">
                <thead>
                  <tr>
                    <th>{t('crew.users.colName')}</th>
                    <th>{t('crew.users.colGrade')}</th>
                    <th>{t('crew.users.colTrust')}</th>
                    <th>{t('crew.users.colRegion')}</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_TALENTS.map((talent) => (
                    <tr key={talent.id}>
                      <td>{loc.name(talent.name)}</td>
                      <td>{talent.grade}</td>
                      <td>{talent.trustScore}</td>
                      <td>{loc.region(talent.region)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return <Dashboard role={role} user={user} db={db} />;
    }
  };

  const lerRole = role === 'maker' || role === 'reviewer';
  const pageTitle = navItems.find((item) => item.id === page)?.label;

  return (
    <div className="crew-root">
      <div className="crew-app">
        <aside className="crew-side">
          <div className="crew-side-head">
            <div className="brand">
              Local<span>Crew</span>
            </div>
            <div className="crew-side-user">{loc.name(user.name)}</div>
          </div>
          <nav className="crew-side-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={page === item.id ? 'on' : ''}
                onClick={() => goToPage(item.id)}
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              className="crew-nav-exit"
              onClick={() => {
                setPageHistory([]);
                setRole(null);
                setPage('dashboard');
              }}
            >
              {t('crew.changeRole')}
            </button>
          </nav>
          <div className="crew-build-tag">D-GIG UI 1.1.1</div>
        </aside>
        <div className="crew-main">
          <CrewTopBar title={pageTitle} onBack={handleCrewBack} />
          {lerRole && (
            <div className="crew-demo-bar">
              <span className="crew-demo-label">
                {t('crew.demo')} · {role === 'maker' ? 'Maker' : 'Reviewer'}
              </span>
              <span className={'fp' + (flow >= 0 ? ' on' : '')}>{t('crew.stepSubmit')}</span>
              <span className={'fp' + (flow >= 1 ? ' on' : '')}>{t('crew.stepReview')}</span>
              <span className={'fp' + (flow >= 2 ? ' on' : '')}>{t('crew.stepLer')}</span>
              {flow === 0 && role === 'maker' && (
                <button type="button" className="crew-btn crew-btn-p crew-btn-sm" onClick={() => goToPage('tasks')}>
                  {t('crew.taskBtn')}
                </button>
              )}
              {flow >= 1 && role === 'reviewer' && (
                <button type="button" className="crew-btn crew-btn-p crew-btn-sm" onClick={() => goToPage('review')}>
                  {t('crew.approveBtn')}
                </button>
              )}
              {flow >= 2 && (
                <button type="button" className="crew-btn crew-btn-p crew-btn-sm" onClick={() => goToPage('credentials')}>
                  {t('crew.lerBtn')}
                </button>
              )}
            </div>
          )}
          {renderPage()}
          <div className="crew-mobile-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={page === item.id ? 'on' : ''}
                onClick={() => goToPage(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <ProjectModal
        open={projModal}
        onClose={() => setProjModal(false)}
        onSubmit={(f) => {
          crewStore.addProject(f);
          refresh();
        }}
        clientLabel={clientLabel}
      />
    </div>
  );
}

export function CrewVerifyPage({ verifyId }: { verifyId: string }) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const loc = useLocalize();
  const all = crewStore.getCredentials(99);
  const cred = all.find((c) => c.verifyId === decodeURIComponent(verifyId));

  return (
    <div className="crew-root" style={{ padding: 24 }}>
      <CrewTopBar title={t('crew.verify.toolbar')} onBack={() => navigate('/crew')} />
      <div className="crew-glass" style={{ padding: 24, maxWidth: 520, marginTop: 20 }}>
        <h1 style={{ fontSize: 20, marginBottom: 12 }}>{t('crew.verify.title')}</h1>
        {cred ? (
          <>
            <p className="vid" style={{ fontSize: 14, marginBottom: 16 }}>
              {cred.verifyId}
            </p>
            <p>
              <strong>{loc.text(cred.project)}</strong> — {loc.text(cred.task)}
            </p>
            <p style={{ fontSize: 13, color: 'var(--crew-muted)', marginTop: 8 }}>
              {cred.period} · ★{cred.rating} · QA {cred.qaPass ? t('crew.verify.qaPass') : '—'}
            </p>
            <p style={{ marginTop: 12, color: 'var(--crew-success)', fontSize: 13 }}>{t('crew.verify.verified')}</p>
          </>
        ) : (
          <p style={{ color: 'var(--crew-muted)' }}>{t('crew.verify.notFound')}</p>
        )}
      </div>
    </div>
  );
}
