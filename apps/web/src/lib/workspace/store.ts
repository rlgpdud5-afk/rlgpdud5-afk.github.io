import { getWorkspaceLocale } from './locale';
import { buildDefaultFiles, migrateSeedFiles } from './seeds';

const KEY = 'dgig-workspace-v2';

export type WorkspaceMode = 'code' | 'design' | 'git' | 'api' | 'db' | 'debug' | 'docs';
export type DesignTool = 'select' | 'frame' | 'rect' | 'text';
export type SideView = 'files' | 'tasks' | 'git' | 'api';

export interface SecureTask {
  id: string;
  title: string;
  tool: WorkspaceMode;
  assignee: string;
  status: 'pending' | 'in_progress' | 'review';
  file: string;
}

export interface WorkspaceFile {
  id: string;
  name: string;
  content: string;
  taskId?: string;
}

export interface GitChange {
  id: string;
  file: string;
  status: 'M' | 'A' | 'D';
}

export interface ApiRequest {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  body: string;
}

export interface WorkspaceState {
  mode: WorkspaceMode;
  files: WorkspaceFile[];
  activeFileId: string;
  terminalOpen: boolean;
  sidebarOpen: boolean;
  sideView: SideView;
  designTool: DesignTool;
  panelsHidden: boolean;
  gitBranch: string;
  commitMsg: string;
  activeApiId: string;
  sqlQuery: string;
  debugConsole: string[];
}

export const SECURE_TASKS: SecureTask[] = [
  { id: 'st1', title: '마케팅 데이터 시각화', tool: 'design', assignee: '김서연', status: 'in_progress', file: 'product-card.fig' },
  { id: 'st2', title: 'React API 연동', tool: 'code', assignee: '박민수', status: 'pending', file: 'api/client.ts' },
  { id: 'st3', title: 'LER 검증 스크립트', tool: 'code', assignee: '김서연', status: 'review', file: 'scripts/verify-ler.ts' },
  { id: 'st4', title: 'REST API 스펙 검증', tool: 'api', assignee: '박민수', status: 'in_progress', file: 'gigs.api' },
  { id: 'st5', title: '워커 DB 마이그레이션', tool: 'db', assignee: '김서연', status: 'pending', file: 'migrations/001.sql' },
];

export const GIT_CHANGES: GitChange[] = [
  { id: 'g1', file: 'api/client.ts', status: 'M' },
  { id: 'g2', file: 'scripts/verify-ler.ts', status: 'M' },
  { id: 'g3', file: 'package.json', status: 'A' },
];

export const API_REQUESTS: ApiRequest[] = [
  { id: 'a1', name: 'List gigs', method: 'GET', url: '/api/v1/gigs', body: '' },
  { id: 'a2', name: 'Apply gig', method: 'POST', url: '/api/v1/applications', body: '{\n  "workerId": "w1",\n  "gigId": "g1"\n}' },
  { id: 'a3', name: 'Verify LER', method: 'GET', url: '/api/v1/ler/kim_daejeon_001', body: '' },
];

export const DB_TABLES = ['workers', 'gigs', 'applications', 'credentials'];

function defaultState(locale = getWorkspaceLocale()): WorkspaceState {
  return {
    mode: 'code',
    files: buildDefaultFiles(locale),
    activeFileId: 'f1',
    terminalOpen: false,
    sidebarOpen: true,
    sideView: 'files',
    designTool: 'select',
    panelsHidden: false,
    gitBranch: 'feature/ler-api',
    commitMsg: '',
    activeApiId: 'a1',
    sqlQuery: 'SELECT id, name, rating FROM workers LIMIT 10;',
    debugConsole: ['[debug] Breakpoint ready', '[info] Local only — no external attach'],
  };
}

export function loadWorkspace(locale = getWorkspaceLocale()): WorkspaceState {
  try {
    const raw = localStorage.getItem(KEY);
    const base = defaultState(locale);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<WorkspaceState>;
    const files = parsed.files?.length
      ? migrateSeedFiles(parsed.files, locale)
      : base.files;
    return { ...base, ...parsed, files };
  } catch {
    return defaultState(locale);
  }
}

export function saveWorkspace(state: WorkspaceState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}
