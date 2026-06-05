import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useI18n } from '../context/I18nContext';
import { useLocalize } from '../i18n/localizeDisplay';
import { store } from '../lib/store';
import type { Worker } from '../lib/types';
import { EmployerView } from './EmployerView';
import { WorkerView } from './WorkerView';

type Mode = 'worker' | 'employer' | null;

export function MatchPage() {
  const { db, storageMode, loading, refresh } = useData();
  const { user, authEnabled } = useAuth();
  const { t } = useI18n();
  const loc = useLocalize();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>(null);
  const [activeWorker, setActiveWorker] = useState<Worker | null>(null);
  const [msg, setMsg] = useState('');

  const toast = useCallback((text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 2800);
  }, []);

  useEffect(() => {
    if (!db || !user) return;
    const linked = db.workers.find((w) => w.userId === user.id);
    if (linked) setActiveWorker(linked);
  }, [db, user]);

  const ensureWorkerProfile = async () => {
    if (!user) return null;
    let w: Worker | undefined = (await store.load()).workers.find((x) => x.userId === user.id);
    if (!w) {
      const name =
        (user.user_metadata?.display_name as string) || user.email?.split('@')[0] || 'Gig worker';
      const { workerId } = await store.createWorker(name, user.id);
      const data = await refresh();
      w = data.workers.find((x) => x.id === workerId);
      toast(t('match.toastProfile'));
    }
    return w;
  };

  const startWorker = async () => {
    if (authEnabled && storageMode === 'cloud' && !user) {
      toast(t('match.toastCloudLogin'));
      navigate('/login');
      return;
    }
    if (user) {
      const w = await ensureWorkerProfile();
      if (w) setActiveWorker(w);
    } else if (db?.workers[0]) {
      setActiveWorker(db.workers[0]);
    }
    setMode('worker');
  };

  const startEmployer = () => {
    if (authEnabled && storageMode === 'cloud' && !user) {
      toast(t('match.toastCloudEmployer'));
      navigate('/login');
      return;
    }
    setMode('employer');
  };

  const addLocalWorker = async () => {
    const name = prompt(t('match.promptWorkerName'));
    if (!name) return;
    const { workerId } = await store.createWorker(name);
    const data = await refresh();
    const w = data.workers.find((x) => x.id === workerId);
    if (w) setActiveWorker(w);
    toast(`${name} ${t('match.toastAdded')}`);
    setMode('worker');
  };

  if (loading) return <div className="loading">{t('common.loading')}</div>;
  if (!db) return null;

  if (!mode) {
    return (
      <div className="wrap home">
        <h1>{t('match.roleTitle')}</h1>
        <p className="muted">{t('match.roleSub')}</p>
        <button type="button" className="btn btn-p block" onClick={() => void startWorker()}>
          {t('match.worker')}
        </button>
        <button type="button" className="btn btn-s block" onClick={startEmployer}>
          {t('match.employer')}
        </button>
        {storageMode === 'local' && (
          <button type="button" className="btn btn-s block" onClick={() => void addLocalWorker()}>
            {t('match.addLocalWorker')}
          </button>
        )}
        {db.workers.length > 1 && storageMode === 'local' && (
          <div className="worker-pick">
            <p className="muted label">{t('match.pickProfile')}</p>
            {db.workers.map((w) => (
              <button
                key={w.id}
                type="button"
                className={'pill' + (activeWorker?.id === w.id ? ' on' : '')}
                onClick={() => {
                  setActiveWorker(w);
                  setMode('worker');
                }}
              >
                {loc.name(w.name)}
              </button>
            ))}
          </div>
        )}
        {msg && <div className="toast">{msg}</div>}
      </div>
    );
  }

  const worker =
    activeWorker || db.workers.find((w) => w.userId === user?.id) || db.workers[0];

  return (
    <>
      <div className="sub-top">
        <button type="button" className="pill" onClick={() => setMode(null)}>
          {t('match.backRole')}
        </button>
        {mode === 'worker' && storageMode === 'local' && (
          <>
            {db.workers.map((w) => (
              <button
                key={w.id}
                type="button"
                className={'pill' + (worker?.id === w.id ? ' on' : '')}
                onClick={() => setActiveWorker(w)}
              >
                {loc.name(w.name)}
              </button>
            ))}
          </>
        )}
        <button type="button" className="pill" onClick={() => void refresh()}>
          {t('match.refresh')}
        </button>
      </div>
      {mode === 'worker' && worker ? (
        <WorkerView
          db={db}
          storageMode={storageMode}
          worker={worker}
          refresh={refresh}
          toast={toast}
        />
      ) : (
        <EmployerView
          db={db}
          storageMode={storageMode}
          refresh={refresh}
          toast={toast}
          userId={user?.id}
        />
      )}
      {msg && <div className="toast">{msg}</div>}
    </>
  );
}
