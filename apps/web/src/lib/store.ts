import { STORAGE_KEY } from './constants';
import { matchScore, tailorSummary } from './matching';
import { supabase, supabaseConfigured } from './supabase/client';
import type { Application, Gig, GigForm, MatchDb, StorageMode, Worker } from './types';

const SEED: MatchDb = {
  workers: [
    {
      id: 'w1',
      name: '김서연',
      tags: ['데이터 분석', 'Figma', '카피라이팅'],
      regions: ['대전', '원격'],
      duration: '1개월',
      rating: 4.7,
      completed: 6,
      bio: '대전·충청 로컬 긱 · LER kim_daejeon_001',
    },
    {
      id: 'w2',
      name: '박민수',
      tags: ['프론트엔드', 'React', '데이터 정리'],
      regions: ['대전', '세종', '청주'],
      duration: '1개월',
      rating: 4.5,
      completed: 4,
      bio: 'React·지역 IT 프로젝트',
    },
  ],
  gigs: [
    {
      id: 'g1',
      employer: '대전 헬스테크',
      title: '마케팅 데이터 분석 (4주)',
      tags: ['데이터 분석', 'Figma'],
      region: '대전',
      duration: '1개월',
      pay: '320만',
      status: 'open',
      employerRating: 4.7,
      jdText:
        '대전 스타트업 마케팅 데이터 분석 프로젝트. 캠페인·설문 데이터 정리·시각화. LER 포트폴리오 연계.',
    },
    {
      id: 'g2',
      employer: '서울 핀테크',
      title: '원격 계약직 (스킬 매칭)',
      tags: ['데이터 분석', '카피라이팅'],
      region: '원격',
      duration: '1개월',
      pay: '협의',
      status: 'open',
      employerRating: 4.8,
      jdText:
        '검증된 LER·실무 데이터 기반 스킬 매칭. kim_daejeon_001 유형 포트폴리오 우대. 수도권 이주 불필요.',
    },
    {
      id: 'g3',
      employer: '충남대 산학협력단',
      title: '지역 기업 UX 리서치 보조',
      tags: ['UX 리서치', '데이터 정리'],
      region: '대전',
      duration: '2주',
      pay: '180만',
      status: 'open',
      employerRating: 4.5,
      jdText: '대전·충청 지역 기업 사용자 인터뷰·리서치 정리. Local Gig 단기 실무.',
    },
  ],
  applications: [],
};

function uid(p: string) {
  return `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

function mapWorker(row: Record<string, unknown>): Worker {
  return {
    id: row.id as string,
    name: row.name as string,
    tags: (row.role_tags as string[]) || [],
    regions: (row.regions as string[]) || [],
    duration: (row.duration as string) || '2주',
    rating: Number(row.rating),
    completed: (row.completed_count as number) ?? 0,
    bio: (row.bio as string) || '',
    userId: (row.user_id as string) || null,
  };
}

function mapGig(row: Record<string, unknown>): Gig {
  return {
    id: row.id as string,
    employer: row.employer as string,
    title: row.title as string,
    tags: (row.role_tags as string[]) || [],
    region: row.region as string,
    duration: (row.duration as string) || '2주',
    pay: (row.pay as string) || '',
    status: row.status as string,
    employerRating: Number(row.employer_rating ?? 4.5),
    jdText: (row.jd_text as string) || '',
    postedBy: (row.posted_by as string) || null,
  };
}

function mapApp(row: Record<string, unknown>): Application {
  return {
    id: row.id as string,
    gigId: row.gig_id as string,
    workerId: row.worker_id as string,
    status: row.status as string,
    matchScore: row.match_score as number,
    tailoredSummary: (row.tailored_summary as string) || null,
    workerReview: row.worker_review as Application['workerReview'],
    employerReview: row.employer_review as Application['employerReview'],
  };
}

type Listener = () => void;

class GigMatchStore {
  mode: StorageMode = 'local';
  private listeners = new Set<Listener>();

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit() {
    this.listeners.forEach((fn) => fn());
  }

  async init(): Promise<StorageMode> {
    if (supabaseConfigured && supabase) {
      try {
        await supabase.from('workers').select('id').limit(1);
        this.mode = 'cloud';
        return 'cloud';
      } catch {
        console.warn('Supabase unavailable, using local');
      }
    }
    this.mode = 'local';
    return 'local';
  }

  async load(): Promise<MatchDb> {
    if (this.mode === 'cloud' && supabase) return this.loadCloud();
    return this.loadLocal();
  }

  loadLocal(): MatchDb {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as MatchDb;
    } catch {
      /* ignore */
    }
    return structuredClone(SEED);
  }

  saveLocal(db: MatchDb): MatchDb {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    this.emit();
    return db;
  }

  async loadCloud(): Promise<MatchDb> {
    if (!supabase) throw new Error('Supabase not configured');
    const [w, g, a] = await Promise.all([
      supabase.from('workers').select('*').order('created_at'),
      supabase.from('gigs').select('*').order('created_at', { ascending: false }),
      supabase.from('applications').select('*').order('created_at', { ascending: false }),
    ]);
    if (w.error) throw w.error;
    if (g.error) throw g.error;
    if (a.error) throw a.error;
    return {
      workers: (w.data || []).map((r) => mapWorker(r)),
      gigs: (g.data || []).map((r) => mapGig(r)),
      applications: (a.data || []).map((r) => mapApp(r)),
    };
  }

  async reset(): Promise<MatchDb> {
    if (this.mode === 'cloud' && supabase) {
      await supabase.from('applications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('gigs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('workers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      return this.load();
    }
    localStorage.removeItem(STORAGE_KEY);
    return structuredClone(SEED);
  }

  async getWorkerByUserId(userId: string): Promise<Worker | null> {
    const db = await this.load();
    return db.workers.find((w) => w.userId === userId) ?? null;
  }

  async updateWorker(worker: Worker): Promise<MatchDb> {
    if (this.mode === 'cloud' && supabase) {
      const { error } = await supabase
        .from('workers')
        .update({
          name: worker.name,
          role_tags: worker.tags,
          regions: worker.regions,
          duration: worker.duration,
          bio: worker.bio,
          rating: worker.rating,
          completed_count: worker.completed,
        })
        .eq('id', worker.id);
      if (error) throw error;
      this.emit();
      return this.load();
    }
    const db = this.loadLocal();
    db.workers = db.workers.map((x) => (x.id === worker.id ? { ...x, ...worker } : x));
    return this.saveLocal(db);
  }

  async createWorker(name: string, userId?: string | null): Promise<{ db: MatchDb; workerId: string }> {
    const row = {
      name,
      tags: ['CS·응대'] as string[],
      regions: ['대전'] as string[],
      duration: '2주',
      rating: 4.5,
      completed: 0,
      bio: '',
      userId: userId ?? null,
    };

    if (this.mode === 'cloud' && supabase) {
      const { data, error } = await supabase
        .from('workers')
        .insert({
          name: row.name,
          role_tags: row.tags,
          regions: row.regions,
          duration: row.duration,
          rating: row.rating,
          completed_count: 0,
          user_id: userId || null,
        })
        .select()
        .single();
      if (error) throw error;
      this.emit();
      const db = await this.load();
      return { db, workerId: data.id as string };
    }

    const db = this.loadLocal();
    const w: Worker = { id: uid('w'), ...row };
    db.workers.push(w);
    this.saveLocal(db);
    return { db, workerId: w.id };
  }

  async postGig(form: GigForm, postedBy?: string | null): Promise<MatchDb> {
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

    if (this.mode === 'cloud' && supabase) {
      const { error } = await supabase.from('gigs').insert({
        employer: gig.employer,
        title: gig.title,
        role_tags: gig.tags,
        region: gig.region,
        duration: gig.duration,
        pay: gig.pay,
        jd_text: gig.jdText,
        status: 'open',
        posted_by: postedBy || null,
      });
      if (error) throw error;
      this.emit();
      return this.load();
    }

    const db = this.loadLocal();
    db.gigs.unshift({ id: uid('g'), ...gig, postedBy: postedBy ?? null });
    return this.saveLocal(db);
  }

  async apply(workerId: string, gigId: string, withAi: boolean): Promise<MatchDb> {
    const db = this.mode === 'cloud' ? await this.load() : this.loadLocal();
    const worker = db.workers.find((x) => x.id === workerId);
    const gig = db.gigs.find((x) => x.id === gigId);
    if (!worker || !gig) return db;
    if (
      db.applications.some(
        (a) => a.gigId === gigId && a.workerId === workerId && a.status !== 'rejected',
      )
    ) {
      return db;
    }

    const app: Omit<Application, 'id'> = {
      gigId,
      workerId,
      status: 'applied',
      matchScore: matchScore(worker, gig),
      tailoredSummary: withAi ? tailorSummary(worker, gig) : null,
      workerReview: null,
      employerReview: null,
    };

    if (this.mode === 'cloud' && supabase) {
      const { error } = await supabase.from('applications').insert({
        gig_id: app.gigId,
        worker_id: app.workerId,
        status: app.status,
        match_score: app.matchScore,
        tailored_summary: app.tailoredSummary,
      });
      if (error) throw error;
      this.emit();
      return this.load();
    }

    db.applications.push({ id: uid('a'), ...app });
    return this.saveLocal(db);
  }

  async setApplicationStatus(
    appId: string,
    status: string,
    extras: {
      workerId?: string;
      tailoredSummary?: string;
      workerReview?: Application['workerReview'];
      employerReview?: Application['employerReview'];
    } = {},
  ): Promise<MatchDb> {
    if (this.mode === 'cloud' && supabase) {
      const patch: Record<string, unknown> = { status };
      if (extras.tailoredSummary != null) patch.tailored_summary = extras.tailoredSummary;
      if (extras.workerReview != null) patch.worker_review = extras.workerReview;
      if (extras.employerReview != null) patch.employer_review = extras.employerReview;
      const { error } = await supabase.from('applications').update(patch).eq('id', appId);
      if (error) throw error;

      if (status === 'completed' && extras.workerId) {
        const loaded = await this.load();
        const worker = loaded.workers.find((w) => w.id === extras.workerId);
        const er = extras.employerReview;
        if (worker && er?.rating) {
          const completed = worker.completed + 1;
          const rating =
            Math.round(((worker.rating * worker.completed + er.rating) / completed) * 10) / 10;
          await supabase
            .from('workers')
            .update({ completed_count: completed, rating })
            .eq('id', worker.id);
        }
        const app = loaded.applications.find((a) => a.id === appId);
        if (app) {
          await supabase.from('gigs').update({ status: 'filled' }).eq('id', app.gigId);
        }
      }
      this.emit();
      return this.load();
    }

    const db = this.loadLocal();
    const app = db.applications.find((a) => a.id === appId);
    if (!app) return db;
    app.status = status;
    if (extras.tailoredSummary != null) app.tailoredSummary = extras.tailoredSummary;
    if (extras.workerReview != null) app.workerReview = extras.workerReview;
    if (extras.employerReview != null) app.employerReview = extras.employerReview;

    if (status === 'completed') {
      const worker = db.workers.find((w) => w.id === app.workerId);
      const er = app.employerReview;
      if (worker && er?.rating) {
        worker.completed += 1;
        worker.rating =
          Math.round(
            ((worker.rating * (worker.completed - 1) + er.rating) / worker.completed) * 10,
          ) / 10;
      }
      const gig = db.gigs.find((g) => g.id === app.gigId);
      if (gig) gig.status = 'filled';
    }
    return this.saveLocal(db);
  }
}

export const store = new GigMatchStore();
