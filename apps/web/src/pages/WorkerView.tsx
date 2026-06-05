import { useMemo, useState } from 'react';

import { TagPicker } from '../components/TagPicker';

import { useI18n } from '../context/I18nContext';

import { useLocalize } from '../i18n/localizeDisplay';

import { DURATIONS, REGIONS, ROLE_TAGS } from '../lib/constants';

import { matchScore } from '../lib/matching';

import { store } from '../lib/store';

import type { Application, MatchDb, StorageMode, Worker } from '../lib/types';



interface WorkerViewProps {

  db: MatchDb;

  storageMode: StorageMode;

  worker: Worker;

  refresh: () => Promise<MatchDb>;

  toast: (msg: string) => void;

}



export function WorkerView({ db, storageMode, worker, refresh, toast }: WorkerViewProps) {

  const { t } = useI18n();

  const loc = useLocalize();

  const [tab, setTab] = useState<'gigs' | 'profile' | 'apps'>('gigs');

  const [filter, setFilter] = useState('');

  const [busy, setBusy] = useState(false);



  const rankedGigs = useMemo(() => {

    let list = db.gigs.filter((g) => g.status === 'open');

    if (filter) {

      list = list.filter(

        (g) =>

          g.region.includes(filter) ||

          loc.region(g.region).toLowerCase().includes(filter.toLowerCase()) ||

          g.title.includes(filter) ||

          loc.text(g.title).toLowerCase().includes(filter.toLowerCase()) ||

          (g.tags || []).some((tag) => tag.includes(filter) || loc.text(tag).includes(filter)),

      );

    }

    return list

      .map((g) => ({ ...g, score: matchScore(worker, g) }))

      .sort((a, b) => b.score - a.score);

  }, [db.gigs, worker, filter, loc]);



  const myApps = db.applications.filter((a) => a.workerId === worker.id);



  const run = async (fn: () => Promise<void>) => {

    setBusy(true);

    try {

      await fn();

      await refresh();

    } catch (e) {

      toast(t('matchView.toastError', { msg: e instanceof Error ? e.message : String(e) }));

    }

    setBusy(false);

  };



  const patchWorker = (patch: Partial<Worker>) =>

    run(async () => {

      await store.updateWorker({ ...worker, ...patch });

    });



  const toggleTag = (tag: string) =>

    patchWorker({

      tags: (worker.tags || []).includes(tag)

        ? worker.tags.filter((x) => x !== tag)

        : [...(worker.tags || []), tag],

    });



  const toggleRegion = (r: string) =>

    patchWorker({

      regions: (worker.regions || []).includes(r)

        ? worker.regions.filter((x) => x !== r)

        : [...(worker.regions || []), r],

    });



  const apply = (gigId: string, withAi: boolean) =>

    run(async () => {

      await store.apply(worker.id, gigId, withAi);

      toast(withAi ? t('matchView.toastApplyAi') : t('matchView.toastApply'));

    });



  const tabs = [

    ['gigs', t('matchView.tabGigs')],

    ['profile', t('matchView.tabProfile')],

    ['apps', t('matchView.tabApps')],

  ] as const;



  return (

    <div className="wrap">

      <div className={'notice' + (storageMode === 'cloud' ? ' ok' : '')}>

        <b>{storageMode === 'cloud' ? t('matchView.storageCloud') : t('matchView.storageLocal')}</b> —{' '}

        {t('matchView.storageSub')}

      </div>

      <div className="row head-row">

        <div>

          <h1>

            {t('matchView.workerTitle')} · {loc.name(worker.name)}

          </h1>

          <p className="muted">

            {t('matchView.ratingLine', { rating: String(worker.rating), count: String(worker.completed) })}

          </p>

        </div>

        <div className="tabs">

          {tabs.map(([id, label]) => (

            <button

              key={id}

              type="button"

              className={'pill' + (tab === id ? ' on' : '')}

              onClick={() => setTab(id)}

            >

              {label}

            </button>

          ))}

        </div>

      </div>



      {tab === 'profile' && (

        <div className="card">

          <h2>{t('matchView.profileTitle')}</h2>

          <TagPicker pool={ROLE_TAGS} selected={worker.tags || []} onToggle={toggleTag} label={t('matchView.tagLabel')} />

          <TagPicker pool={REGIONS} selected={worker.regions || []} onToggle={toggleRegion} label={t('matchView.regionLabel')} />

          <div className="muted label">{t('matchView.durationLabel')}</div>

          <div className="tags">

            {DURATIONS.map((d) => (

              <span

                key={d}

                className={'tag' + (worker.duration === d ? ' on' : '')}

                onClick={() => patchWorker({ duration: d })}

                role="button"

                tabIndex={0}

              >

                {loc.text(d)}

              </span>

            ))}

          </div>

        </div>

      )}



      {tab === 'gigs' && (

        <>

          <input

            className="input"

            placeholder={t('matchView.filterPh')}

            value={filter}

            onChange={(e) => setFilter(e.target.value)}

          />

          <div className="card">

            <h2>{t('matchView.gigsTitle')}</h2>

            {rankedGigs.map((g) => {

              const applied = myApps.find((a) => a.gigId === g.id && a.status !== 'rejected');

              return (

                <div key={g.id} className="gig-item">

                  <div className="row">

                    <div className="flex1">

                      <div className="title">{loc.text(g.title)}</div>

                      <div className="muted">

                        {loc.company(g.employer)} · {loc.region(g.region)} · {loc.text(g.duration)} · {g.pay}

                      </div>

                      <div className="tags inline">

                        {(g.tags || []).map((tag) => (

                          <span key={tag} className="tag readonly">

                            {loc.text(tag)}

                          </span>

                        ))}

                      </div>

                      {g.jdText && <p className="muted jd">{loc.text(g.jdText)}</p>}

                    </div>

                    <div className="score-col">

                      <div className="score">{g.score}%</div>

                      {applied ? (

                        <span className="badge b-applied">{applied.status}</span>

                      ) : (

                        <>

                          <button

                            type="button"

                            className="btn btn-p btn-sm"

                            disabled={busy}

                            onClick={() => apply(g.id, false)}

                          >

                            {t('matchView.apply')}

                          </button>

                          <button

                            type="button"

                            className="btn btn-s btn-sm"

                            disabled={busy}

                            onClick={() => apply(g.id, true)}

                          >

                            {t('matchView.applyAi')}

                          </button>

                        </>

                      )}

                    </div>

                  </div>

                </div>

              );

            })}

          </div>

        </>

      )}



      {tab === 'apps' && (

        <div className="card">

          <h2>{t('matchView.appsTitle')}</h2>

          {myApps.length === 0 && <p className="muted">{t('matchView.appsEmpty')}</p>}

          {myApps.map((a: Application) => {

            const g = db.gigs.find((x) => x.id === a.gigId);

            return (

              <div key={a.id} className="gig-item">

                <div className="title">

                  {g ? loc.text(g.title) : '—'} · {g ? loc.company(g.employer) : ''}

                </div>

                <div className="muted">

                  {t('matchView.matchLine', { score: String(a.matchScore), status: a.status })}

                </div>

                {a.tailoredSummary && <p className="ai-box">{loc.text(a.tailoredSummary)}</p>}

                {a.employerReview && (

                  <p className="muted">

                    {t('matchView.employerReview', {

                      rating: String(a.employerReview.rating),

                      text: loc.text(a.employerReview.text),

                    })}

                  </p>

                )}

              </div>

            );

          })}

        </div>

      )}

    </div>

  );

}

