import type { FileNode } from '../dgig-globals';
import { getWorkspaceLocale } from '../../../../lib/workspace/locale';
import { getBrowserSeedMap } from '../../../../lib/workspace/seeds';

const VFS_KEY = 'dgig-code-vfs';

function vfsKey(taskId: string) {
  return `${VFS_KEY}-${taskId}`;
}

function loadVfs(taskId: string): Record<string, string> {
  try {
    const raw = localStorage.getItem(vfsKey(taskId));
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function saveVfs(taskId: string, files: Record<string, string>) {
  localStorage.setItem(vfsKey(taskId), JSON.stringify(files));
}

const LEGACY_KO_CLIENT = '폐쇄망 — 외부 전송 금지';

function seedBrowserVfs(taskId: string): Record<string, string> {
  const locale = getWorkspaceLocale();
  const existing = loadVfs(taskId);
  const seeds = getBrowserSeedMap(locale)[taskId] || {};
  const merged = { ...seeds, ...existing };
  if (
    locale !== 'ko' &&
    merged['api/client.ts']?.includes(LEGACY_KO_CLIENT) &&
    seeds['api/client.ts']
  ) {
    merged['api/client.ts'] = seeds['api/client.ts'];
  }
  saveVfs(taskId, merged);
  return merged;
}

function listVfsFiles(files: Record<string, string>, dirPath: string): FileNode[] {
  const norm = dirPath === '.' || dirPath === '' ? '' : dirPath.replace(/\\/g, '/').replace(/\/$/, '');
  const prefix = norm ? `${norm}/` : '';
  const dirs = new Set<string>();
  const nodes: FileNode[] = [];

  for (const filePath of Object.keys(files)) {
    if (!filePath.startsWith(prefix) && norm) continue;
    const rest = norm ? filePath.slice(prefix.length) : filePath;
    if (!rest) continue;
    const slash = rest.indexOf('/');
    if (slash === -1) {
      nodes.push({ name: rest, path: norm ? `${norm}/${rest}` : rest, isDirectory: false });
    } else {
      const dirName = rest.slice(0, slash);
      const dirRel = norm ? `${norm}/${dirName}` : dirName;
      if (!dirs.has(dirRel)) {
        dirs.add(dirRel);
        nodes.push({ name: dirName, path: dirRel, isDirectory: true });
      }
    }
  }

  return nodes.sort((a, b) => {
    if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export function isElectronFs(): boolean {
  return typeof window !== 'undefined' && !!window.dgigFs;
}

let cachedTaskRoot = '';

export async function initTaskRoot(taskId: string): Promise<string> {
  if (window.dgigFs) {
    const { root } = await window.dgigFs.getTaskRoot(taskId);
    cachedTaskRoot = root;
    return root;
  }
  seedBrowserVfs(taskId);
  cachedTaskRoot = `browser://${taskId}`;
  return cachedTaskRoot;
}

export function getCachedTaskRoot() {
  return cachedTaskRoot;
}

export async function readFile(filePath: string, taskId: string): Promise<string> {
  if (window.dgigFs) {
    const { content } = await window.dgigFs.readFile(filePath);
    return content;
  }
  const vfs = seedBrowserVfs(taskId);
  if (!(filePath in vfs)) throw new Error('File not found');
  return vfs[filePath];
}

export async function writeFile(filePath: string, content: string, taskId: string): Promise<void> {
  if (window.dgigFs) {
    await window.dgigFs.writeFile(filePath, content);
    return;
  }
  const vfs = seedBrowserVfs(taskId);
  vfs[filePath] = content;
  saveVfs(taskId, vfs);
}

export async function readDir(dirPath: string, taskId: string): Promise<FileNode[]> {
  if (window.dgigFs) {
    return window.dgigFs.readDir(dirPath || '.');
  }
  const vfs = seedBrowserVfs(taskId);
  return listVfsFiles(vfs, dirPath || '.');
}

export async function deletePath(filePath: string, taskId: string): Promise<void> {
  if (window.dgigFs) {
    await window.dgigFs.deleteFile(filePath);
    return;
  }
  const vfs = seedBrowserVfs(taskId);
  const norm = filePath.replace(/\\/g, '/');
  for (const key of Object.keys(vfs)) {
    if (key === norm || key.startsWith(`${norm}/`)) delete vfs[key];
  }
  saveVfs(taskId, vfs);
}

export async function mkdir(dirPath: string, taskId: string): Promise<void> {
  if (window.dgigFs) {
    await window.dgigFs.mkdir(dirPath);
    return;
  }
  const vfs = seedBrowserVfs(taskId);
  const placeholder = `${dirPath.replace(/\\/g, '/').replace(/\/$/, '')}/.keep`;
  vfs[placeholder] = '';
  saveVfs(taskId, vfs);
}

export function languageFromPath(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    css: 'css',
    html: 'html',
    json: 'json',
    sql: 'sql',
    md: 'markdown',
  };
  return map[ext] || 'plaintext';
}

export function fileNameFromPath(filePath: string) {
  return filePath.split(/[/\\]/).pop() || filePath;
}

/** Recursively list all file paths under task root */
export async function listAllFiles(taskId: string, dirPath = '.'): Promise<string[]> {
  const nodes = await readDir(dirPath, taskId);
  const out: string[] = [];
  for (const node of nodes) {
    if (node.isDirectory) {
      out.push(...(await listAllFiles(taskId, node.path)));
    } else {
      out.push(node.path);
    }
  }
  return out;
}
