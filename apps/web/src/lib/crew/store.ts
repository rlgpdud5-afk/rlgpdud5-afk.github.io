import { DEMO_NEW_CRED, FLOW_TASK_ID, INITIAL_CREW_DB } from './seed';
import type { CrewDb, Credential, ProjectForm, Task } from './types';

const STORAGE_KEY = 'dgig_crew_v2';

function uid(p: string) {
  return `${p}${Date.now().toString(36)}`;
}

export function taskStatusForDemo(task: Task, flow: number): string {
  if (task.id !== FLOW_TASK_ID) return task.status;
  if (flow >= 2) return '승인완료';
  if (flow >= 1) return '제출완료';
  return task.status;
}

class CrewStore {
  private listeners = new Set<() => void>();

  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit() {
    this.listeners.forEach((fn) => fn());
  }

  load(): CrewDb {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as CrewDb;
    } catch {
      /* ignore */
    }
    return structuredClone(INITIAL_CREW_DB);
  }

  save(db: CrewDb): CrewDb {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    this.emit();
    return db;
  }

  reset(): CrewDb {
    localStorage.removeItem(STORAGE_KEY);
    const db = structuredClone(INITIAL_CREW_DB);
    this.emit();
    return db;
  }

  addProject(form: ProjectForm): CrewDb {
    const db = this.load();
    db.projects.push({
      id: uid('p'),
      name: form.name,
      client: form.client,
      status: '배정중',
      progress: 0,
      deadline: form.deadline,
      security: form.security,
      budget: form.budget,
      tasks: 0,
      completedTasks: 0,
      modules: ['신규'],
      description: form.description,
    });
    return this.save(db);
  }

  submitDemoTask(): CrewDb {
    const db = this.load();
    const t = db.tasks.find((x) => x.id === FLOW_TASK_ID);
    if (t) {
      t.status = '제출완료';
      t.autoCheck = '통과';
    }
    return this.save(db);
  }

  approveDemoTask(): CrewDb {
    const db = this.load();
    const t = db.tasks.find((x) => x.id === FLOW_TASK_ID);
    if (t) {
      t.status = '승인완료';
      t.reviewScore = 4.9;
    }
    const exists = db.credentials.some((c) => c.verifyId === DEMO_NEW_CRED.verifyId);
    if (!exists) {
      db.credentials.unshift({ ...DEMO_NEW_CRED, isNew: true });
    }
    return this.save(db);
  }

  getCredentials(flow: number): Credential[] {
    const db = this.load();
    if (flow >= 2) {
      const hasDemo = db.credentials.some((c) => c.verifyId === DEMO_NEW_CRED.verifyId);
      return hasDemo ? db.credentials : [{ ...DEMO_NEW_CRED, isNew: true }, ...db.credentials];
    }
    return db.credentials;
  }
}

export const crewStore = new CrewStore();
