/**
 * GigCareer matching store — localStorage (default) or Supabase (when config.js is set).
 */
(function (global) {
  const STORAGE_KEY = 'gigcareer_match_v2';

  const SEED = {
    workers: [
      { id: 'w1', name: '김서연', tags: ['바리스타', '영어 가능', 'CS·응대'], regions: ['제주', '원격'], duration: '2주', rating: 4.7, completed: 6, bio: '제주·원격 바리스타' },
      { id: 'w2', name: '박민수', tags: ['프론트엔드', 'React', '데이터 정리'], regions: ['대전', '세종'], duration: '1개월', rating: 4.5, completed: 4, bio: 'React·데이터' },
      { id: 'w3', name: '이하은', tags: ['번역·통역', '마케팅 보조'], regions: ['부산', '원격'], duration: '1주', rating: 4.8, completed: 9, bio: '번역·마케팅' },
    ],
    gigs: [
      { id: 'g1', employer: '제주 카페 모모', title: '바리스타 2주 긱 (오전)', tags: ['바리스타', 'CS·응대'], region: '제주', duration: '2주', pay: '시급 1.2만', status: 'open', employerRating: 4.6, jdText: '제주 카페 바리스타. 영어 가능 우대.' },
      { id: 'g2', employer: '로컬테크', title: '쇼핑몰 React UI 3주', tags: ['프론트엔드', 'React'], region: '대전', duration: '1개월', pay: '300만', status: 'open', employerRating: 4.4, jdText: 'React 컴포넌트·쇼핑몰 UI.' },
      { id: 'g3', employer: '부산 페스티벌', title: '현장 스태프 1주', tags: ['이벤트 스태프', 'CS·응대'], region: '부산', duration: '1주', pay: '일당 12만', status: 'open', employerRating: 4.2, jdText: '현장 안내·CS.' },
    ],
    applications: [],
  };

  function uid(p) {
    return p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function matchScore(worker, gig) {
    let s = 0;
    const wTags = worker.tags || [];
    const gTags = gig.tags || [];
    const overlap = wTags.filter((t) => gTags.some((gt) => gt.includes(t) || t.includes(gt)));
    s += overlap.length * 22;
    const regions = worker.regions || [];
    if (regions.includes(gig.region) || gig.region === '원격' || regions.includes('원격')) s += 28;
    if (worker.duration === gig.duration || gig.duration === '협의' || worker.duration === '협의') s += 12;
    s += (worker.rating || 0) * 5;
    s += Math.min((worker.completed || 0) * 2, 14);
    return Math.round(Math.min(s, 100));
  }

  function extractKeywords(text) {
    if (!text) return [];
    const pool = ['바리스타', '프론트엔드', 'React', 'UX', '리서치', '번역', '이벤트', '데이터', '영상', 'CS', '마케팅', '영어', '카페', 'UI', '컴포넌트'];
    return pool.filter((k) => text.includes(k) || text.toLowerCase().includes(k.toLowerCase()));
  }

  function tailorSummary(worker, gig, jdExtra) {
    const jd = [gig.jdText, jdExtra, gig.title, (gig.tags || []).join(' ')].filter(Boolean).join(' ');
    const keys = extractKeywords(jd);
    const top = [...(worker.tags || [])].sort((a, b) => {
      const sa = keys.some((k) => a.includes(k) || k.includes(a)) ? 1 : 0;
      const sb = keys.some((k) => b.includes(k) || k.includes(b)) ? 1 : 0;
      return sb - sa;
    });
    const hit = top.filter((t) => keys.some((k) => t.includes(k) || k.includes(t)));
    return (
      `[AI 맞춤 · ${gig.employer}] ${worker.name} — ` +
      (hit.length ? hit.join(', ') + ' 역량을 공고 키워드(' + keys.slice(0, 4).join(', ') + ')에 맞게 상단 배치. ` : '') +
      `${gig.title}에 ${worker.completed || 0}건의 검증된 긱 수행·평점 ${worker.rating}으로 지원합니다.`
    );
  }

  function mapWorker(row) {
    return {
      id: row.id,
      name: row.name,
      tags: row.role_tags || [],
      regions: row.regions || [],
      duration: row.duration || '2주',
      rating: Number(row.rating),
      completed: row.completed_count ?? 0,
      bio: row.bio || '',
    };
  }

  function mapGig(row) {
    return {
      id: row.id,
      employer: row.employer,
      title: row.title,
      tags: row.role_tags || [],
      region: row.region,
      duration: row.duration || '2주',
      pay: row.pay || '',
      status: row.status,
      employerRating: Number(row.employer_rating ?? 4.5),
      jdText: row.jd_text || '',
    };
  }

  function mapApp(row) {
    return {
      id: row.id,
      gigId: row.gig_id,
      workerId: row.worker_id,
      status: row.status,
      matchScore: row.match_score,
      tailoredSummary: row.tailored_summary,
      workerReview: row.worker_review,
      employerReview: row.employer_review,
    };
  }

  class GigMatchStore {
    constructor() {
      this.mode = 'local';
      this.supabase = null;
      this._listeners = new Set();
    }

    subscribe(fn) {
      this._listeners.add(fn);
      return () => this._listeners.delete(fn);
    }

    _emit() {
      this._listeners.forEach((fn) => fn());
    }

    async init() {
      const cfg = global.__GIG_CONFIG;
      if (cfg?.supabaseUrl && cfg?.supabaseAnonKey && global.supabase?.createClient) {
        try {
          this.supabase = global.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
          await this.supabase.from('workers').select('id').limit(1);
          this.mode = 'cloud';
          return { mode: 'cloud' };
        } catch (e) {
          console.warn('Supabase unavailable, using local', e);
        }
      }
      this.mode = 'local';
      return { mode: 'local' };
    }

    async load() {
      if (this.mode === 'cloud') return this._loadCloud();
      return this._loadLocal();
    }

    _loadLocal() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) {}
      return JSON.parse(JSON.stringify(SEED));
    }

    _saveLocal(db) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
      this._emit();
      return db;
    }

    async _loadCloud() {
      const [w, g, a] = await Promise.all([
        this.supabase.from('workers').select('*').order('created_at'),
        this.supabase.from('gigs').select('*').order('created_at', { ascending: false }),
        this.supabase.from('applications').select('*').order('created_at', { ascending: false }),
      ]);
      if (w.error) throw w.error;
      if (g.error) throw g.error;
      if (a.error) throw a.error;
      return {
        workers: (w.data || []).map(mapWorker),
        gigs: (g.data || []).map(mapGig),
        applications: (a.data || []).map(mapApp),
      };
    }

    async reset() {
      if (this.mode === 'cloud') {
        await this.supabase.from('applications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await this.supabase.from('gigs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await this.supabase.from('workers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        return this.load();
      }
      localStorage.removeItem(STORAGE_KEY);
      return JSON.parse(JSON.stringify(SEED));
    }

    async updateWorker(worker) {
      if (this.mode === 'cloud') {
        const { error } = await this.supabase.from('workers').update({
          name: worker.name,
          role_tags: worker.tags,
          regions: worker.regions,
          duration: worker.duration,
          bio: worker.bio,
          rating: worker.rating,
          completed_count: worker.completed,
        }).eq('id', worker.id);
        if (error) throw error;
        this._emit();
        return this.load();
      }
      const db = this._loadLocal();
      db.workers = db.workers.map((x) => (x.id === worker.id ? { ...x, ...worker } : x));
      return this._saveLocal(db);
    }

    async createWorker(name) {
      const row = {
        name,
        tags: ['CS·응대'],
        regions: ['대전'],
        duration: '2주',
        rating: 4.5,
        completed: 0,
        bio: '',
      };
      if (this.mode === 'cloud') {
        const { data, error } = await this.supabase
          .from('workers')
          .insert({
            name: row.name,
            role_tags: row.tags,
            regions: row.regions,
            duration: row.duration,
            rating: row.rating,
            completed_count: 0,
          })
          .select()
          .single();
        if (error) throw error;
        this._emit();
        const db = await this.load();
        return { db, workerId: data.id };
      }
      const db = this._loadLocal();
      const w = { id: uid('w'), ...row };
      db.workers.push(w);
      this._saveLocal(db);
      return { db, workerId: w.id };
    }

    async postGig(form) {
      const gig = {
        employer: form.employer,
        title: form.title,
        tags: form.tags,
        region: form.region,
        duration: form.duration,
        pay: form.pay,
        jdText: form.jdText || '',
        status: 'open',
        employerRating: 4.5,
      };
      if (this.mode === 'cloud') {
        const { error } = await this.supabase.from('gigs').insert({
          employer: gig.employer,
          title: gig.title,
          role_tags: gig.tags,
          region: gig.region,
          duration: gig.duration,
          pay: gig.pay,
          jd_text: gig.jdText,
          status: 'open',
        });
        if (error) throw error;
        this._emit();
        return this.load();
      }
      const db = this._loadLocal();
      db.gigs.unshift({ id: uid('g'), ...gig });
      return this._saveLocal(db);
    }

    async apply(workerId, gigId, withAi) {
      const db = await (this.mode === 'cloud' ? this.load() : Promise.resolve(this._loadLocal()));
      const worker = db.workers.find((x) => x.id === workerId);
      const gig = db.gigs.find((x) => x.id === gigId);
      if (!worker || !gig) return db;
      if (db.applications.some((a) => a.gigId === gigId && a.workerId === workerId && a.status !== 'rejected')) return db;

      const app = {
        gigId,
        workerId,
        status: 'applied',
        matchScore: matchScore(worker, gig),
        tailoredSummary: withAi ? tailorSummary(worker, gig) : null,
        workerReview: null,
        employerReview: null,
      };

      if (this.mode === 'cloud') {
        const { error } = await this.supabase.from('applications').insert({
          gig_id: app.gigId,
          worker_id: app.workerId,
          status: app.status,
          match_score: app.matchScore,
          tailored_summary: app.tailoredSummary,
        });
        if (error) throw error;
        this._emit();
        return this.load();
      }
      db.applications.push({ id: uid('a'), ...app });
      return this._saveLocal(db);
    }

    async setApplicationStatus(appId, status, extras) {
      extras = extras || {};
      if (this.mode === 'cloud') {
        const patch = { status };
        if (extras.tailoredSummary != null) patch.tailored_summary = extras.tailoredSummary;
        if (extras.workerReview != null) patch.worker_review = extras.workerReview;
        if (extras.employerReview != null) patch.employer_review = extras.employerReview;
        const { error } = await this.supabase.from('applications').update(patch).eq('id', appId);
        if (error) throw error;

        if (status === 'completed' && extras.workerId) {
          const db = await this.load();
          const worker = db.workers.find((w) => w.id === extras.workerId);
          const er = extras.employerReview;
          if (worker && er?.rating) {
            const completed = worker.completed + 1;
            const rating = Math.round(((worker.rating * worker.completed + er.rating) / completed) * 10) / 10;
            await this.supabase.from('workers').update({ completed_count: completed, rating }).eq('id', worker.id);
          }
          const app = db.applications.find((a) => a.id === appId);
          if (app) {
            await this.supabase.from('gigs').update({ status: 'filled' }).eq('id', app.gigId);
          }
        }
        this._emit();
        return this.load();
      }

      const db = this._loadLocal();
      const app = db.applications.find((a) => a.id === appId);
      if (!app) return db;
      app.status = status;
      Object.assign(app, extras);

      if (status === 'completed') {
        const worker = db.workers.find((w) => w.id === app.workerId);
        const er = app.employerReview;
        if (worker && er?.rating) {
          worker.completed += 1;
          worker.rating = Math.round(((worker.rating * (worker.completed - 1) + er.rating) / worker.completed) * 10) / 10;
        }
        const gig = db.gigs.find((g) => g.id === app.gigId);
        if (gig) gig.status = 'filled';
      }
      return this._saveLocal(db);
    }

    tailorForJob(worker, gig, jdExtra) {
      return tailorSummary(worker, gig, jdExtra);
    }
  }

  global.GigMatchStore = GigMatchStore;
  global.GigMatchUtils = { matchScore, extractKeywords, ROLE_TAGS: null };
})((typeof window !== 'undefined') ? window : globalThis);
