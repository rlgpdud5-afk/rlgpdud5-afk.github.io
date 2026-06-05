import { useState } from 'react';

import { ReviewModal } from '../components/ReviewModal';

import { useI18n } from '../context/I18nContext';

import { useLocalize } from '../i18n/localizeDisplay';

import { TagPicker } from '../components/TagPicker';

import { DURATIONS, REGIONS, ROLE_TAGS } from '../lib/constants';

import { store } from '../lib/store';

import type { Application, Gig, GigForm, MatchDb, StorageMode } from '../lib/types';



interface EmployerViewProps {

  db: MatchDb;

  storageMode: StorageMode;

  refresh: () => Promise<MatchDb>;

  toast: (msg: string) => void;

  userId?: string | null;

}



export function EmployerView({ db, storageMode, refresh, toast, userId }: EmployerViewProps) {

  const { t } = useI18n();

  const loc = useLocalize();

  const [form, setForm] = useState<GigForm>({

    title: '',

    employer: '',

    tags: [],

    region: '제주',

    duration: '2주',

    pay: '',

    jdText: '',

  });

  const [pickGig, setPickGig] = useState<string | null>(null);

  const [reviewApp, setReviewApp] = useState<(Application & { workerName?: string }) | null>(null);

  const [busy, setBusy] = useState(false);



  const run = async (fn: () => Promise<void>) => {

    setBusy(true);

    try {

      await fn();

      await refresh();

      toast(t('matchView.saved'));

    } catch (e) {

      toast(t('matchView.toastError', { msg: e instanceof Error ? e.message : String(e) }));

    }

    setBusy(false);

  };



  const postGig = () => {

    if (!form.title || !form.employer) return toast(t('matchView.required'));

    run(async () => {

      await store.postGig(form, userId);

      setForm({ title: '', employer: '', tags: [], region: '제주', duration: '2주', pay: '', jdText: '' });

    });

  };



  const appsFor = (gigId: string) =>

    db.applications

      .filter((a) => a.gigId === gigId)

      .map((a) => ({ ...a, worker: db.workers.find((w) => w.id === a.workerId) }))

      .sort((a, b) => b.matchScore - a.matchScore);



  const selectedGig: Gig | undefined = pickGig ? db.gigs.find((g) => g.id === pickGig) : undefined;



  return (

    <div className="wrap">

      <div className={'notice' + (storageMode === 'cloud' ? ' ok' : '')}>

        <b>{t('matchView.employerTitle')}</b> — {t('matchView.employerSub')}

      </div>

      <div className="grid2">

        <div className="card">

          <h2>{t('matchView.postTitle')}</h2>

          <input

            className="input"

            placeholder={t('matchView.postTitlePh')}

            value={form.title}

            onChange={(e) => setForm({ ...form, title: e.target.value })}

          />

          <input

            className="input"

            placeholder={t('matchView.postEmployerPh')}

            value={form.employer}

            onChange={(e) => setForm({ ...form, employer: e.target.value })}

          />

          <input

            className="input"

            placeholder={t('matchView.postPayPh')}

            value={form.pay}

            onChange={(e) => setForm({ ...form, pay: e.target.value })}

          />

          <textarea

            className="input"

            rows={3}

            placeholder={t('matchView.postJdPh')}

            value={form.jdText}

            onChange={(e) => setForm({ ...form, jdText: e.target.value })}

          />

          <TagPicker

            pool={ROLE_TAGS}

            selected={form.tags}

            onToggle={(tag) =>

              setForm((f) => ({

                ...f,

                tags: f.tags.includes(tag) ? f.tags.filter((x) => x !== tag) : [...f.tags, tag],

              }))

            }

            label={t('matchView.postTags')}

          />

          <TagPicker

            pool={REGIONS}

            selected={[form.region]}

            onToggle={(r) => setForm({ ...form, region: r })}

            label={t('matchView.postRegion')}

          />

          <div className="tags">

            {DURATIONS.map((d) => (

              <span

                key={d}

                className={'tag' + (form.duration === d ? ' on' : '')}

                onClick={() => setForm({ ...form, duration: d })}

                role="button"

                tabIndex={0}

              >

                {loc.text(d)}

              </span>

            ))}

          </div>

          <button type="button" className="btn btn-p" disabled={busy} onClick={postGig}>

            {t('matchView.postSubmit')}

          </button>

        </div>

        <div className="card">

          <h2>{t('matchView.myGigs')}</h2>

          {db.gigs.map((g) => (

            <div key={g.id} className="gig-item">

              <div className="row">

                <div>

                  <div className="title">{loc.text(g.title)}</div>

                  <div className="muted">

                    {g.status} · {t('matchView.appsCount', { n: String(appsFor(g.id).length) })}

                  </div>

                </div>

                <button type="button" className="btn btn-s btn-sm" onClick={() => setPickGig(g.id)}>

                  {t('matchView.applicants')}

                </button>

              </div>

            </div>

          ))}

        </div>

      </div>



      {selectedGig && (

        <div className="card">

          <h2>{t('matchView.applicantsTitle', { title: loc.text(selectedGig.title) })}</h2>

          {appsFor(selectedGig.id).map((a) => (

            <div key={a.id} className="gig-item">

              <div className="row">

                <div className="flex1">

                  <div className="title">{a.worker?.name ? loc.name(a.worker.name) : '—'}</div>

                  <div className="muted">{(a.worker?.tags || []).map((tag) => loc.text(tag)).join(' · ')}</div>

                  <div className="stars">

                    ★ {a.worker?.rating} · {a.worker?.completed}

                  </div>

                  {a.tailoredSummary && <p className="ai-box">{loc.text(a.tailoredSummary)}</p>}

                </div>

                <div className="score-col">

                  <div className="score">{a.matchScore}%</div>

                  {a.status === 'applied' && (

                    <>

                      <button

                        type="button"

                        className="btn btn-p btn-sm"

                        disabled={busy}

                        onClick={() =>

                          run(async () => {

                            await store.setApplicationStatus(a.id, 'accepted');

                          })

                        }

                      >

                        {t('matchView.accept')}

                      </button>

                      <button

                        type="button"

                        className="btn btn-s btn-sm"

                        disabled={busy}

                        onClick={() =>

                          run(async () => {

                            await store.setApplicationStatus(a.id, 'rejected');

                          })

                        }

                      >

                        {t('matchView.reject')}

                      </button>

                    </>

                  )}

                  {a.status === 'accepted' && (

                    <button type="button" className="btn btn-p btn-sm" onClick={() => setReviewApp(a)}>

                      {t('matchView.completeReview')}

                    </button>

                  )}

                  {a.status === 'completed' && <span className="badge b-done">{t('matchView.completed')}</span>}

                </div>

              </div>

            </div>

          ))}

          <button type="button" className="btn btn-s btn-sm" onClick={() => setPickGig(null)}>

            {t('matchView.close')}

          </button>

        </div>

      )}



      {reviewApp && (

        <ReviewModal

          onClose={() => setReviewApp(null)}

          onSubmit={(rev) =>

            run(async () => {

              await store.setApplicationStatus(reviewApp.id, 'completed', {

                workerId: reviewApp.workerId,

                employerReview: rev,

                workerReview: {

                  rating: rev.rating,

                  text:
                    loc.locale === 'en' || loc.locale === 'es'
                      ? 'Collaborated smoothly with the employer.'
                      : '고용주와 원활히 협업했습니다.',

                },

              });

              setReviewApp(null);

            })

          }

        />

      )}

    </div>

  );

}

