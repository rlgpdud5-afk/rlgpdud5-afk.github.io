const { app, BrowserWindow, dialog, ipcMain, session } = require('electron');
const http = require('http');
const fs = require('fs');
const path = require('path');

/** Main-process deps must be listed in package.json dependencies (included by electron-builder). */
function requireMain(name) {
  try {
    return require(name);
  } catch (err) {
    dialog.showErrorBox(
      'D-GIG 시작 오류',
      `필수 모듈 "${name}" 을(를) 찾을 수 없습니다.\n\n앱을 다시 빌드해 주세요.\n\n${err instanceof Error ? err.message : err}`,
    );
    app.quit();
    throw err;
  }
}

const simpleGit = requireMain('simple-git');
const axios = requireMain('axios');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

/** @type {Map<number, import('node-pty').IPty | null>} */
const terminals = new Map();

const TASK_SEEDS = {
  st2: {
    'api/client.ts': `// 폐쇄망 — 외부 전송 금지\nexport async function fetchGigs() {\n  return [];\n}\n`,
  },
  st3: {
    'scripts/verify-ler.ts': `export function verify(id: string) {\n  console.log('VRF', id);\n}\n`,
  },
  st5: {
    'migrations/001.sql': `SELECT id, name, trust_score FROM workers;\n`,
  },
  st4: {
    'api/collection.dgig-api': JSON.stringify(
      {
        version: '1.0',
        name: 'GigCareer API',
        requests: [
          {
            id: 'a1',
            name: 'List gigs',
            method: 'GET',
            url: 'http://127.0.0.1:4400/api/v1/gigs',
            headers: { Accept: 'application/json' },
            body: null,
          },
          {
            id: 'a2',
            name: 'Apply gig',
            method: 'POST',
            url: 'http://127.0.0.1:4400/api/v1/applications',
            headers: { 'Content-Type': 'application/json' },
            body: '{\n  "workerId": "w1",\n  "gigId": "g1"\n}',
          },
        ],
      },
      null,
      2,
    ),
  },
  st1: {
    'designs/canvas.dgig': JSON.stringify(
      {
        version: '1.0',
        meta: { createdAt: '2026-06-04', taskId: 'st1' },
        canvas: { width: 1440, height: 900 },
        elements: [],
      },
      null,
      2,
    ),
  },
};

function getDistDir() {
  return path.join(app.getAppPath(), 'dist');
}

function getTaskRoot(taskId) {
  return path.join(app.getPath('userData'), 'dgig-tasks', taskId);
}

function ensureTaskSeeded(taskId) {
  const root = getTaskRoot(taskId);
  fs.mkdirSync(root, { recursive: true });
  const seeds = TASK_SEEDS[taskId];
  if (seeds) {
    for (const [rel, content] of Object.entries(seeds)) {
      const fp = path.join(root, rel);
      fs.mkdirSync(path.dirname(fp), { recursive: true });
      if (!fs.existsSync(fp)) fs.writeFileSync(fp, content, 'utf-8');
    }
  }
  return root;
}

/** @type {string | null} */
let activeTaskRoot = null;

function resolveSafe(root, userPath) {
  const base = path.resolve(root);
  const resolved = path.resolve(base, userPath);
  if (resolved !== base && !resolved.startsWith(base + path.sep)) {
    throw new Error('Path outside task root');
  }
  return resolved;
}

function resolveRepoPath(repoPath) {
  const tasksRoot = path.join(app.getPath('userData'), 'dgig-tasks');
  const resolved = path.resolve(repoPath);
  if (resolved !== tasksRoot && !resolved.startsWith(tasksRoot + path.sep)) {
    throw new Error('Repo path outside task roots');
  }
  return resolved;
}

/** @type {Map<string, Promise<import('simple-git').SimpleGit>>} */
const ensureGitRepoPending = new Map();

async function isValidGitRepo(repoPath) {
  try {
    return await simpleGit(repoPath).checkIsRepo();
  } catch {
    return false;
  }
}

/** Incomplete .git from concurrent git init breaks later commands. */
async function removeBrokenGitMeta(repoPath) {
  const gitDir = path.join(repoPath, '.git');
  if (!fs.existsSync(gitDir)) return;
  if (await isValidGitRepo(repoPath)) return;
  fs.rmSync(gitDir, { recursive: true, force: true });
}

async function doEnsureGitRepo(repoPath) {
  await removeBrokenGitMeta(repoPath);
  const git = simpleGit(repoPath);
  if (await git.checkIsRepo()) return git;
  await git.init();
  await git.add('.');
  try {
    await git.commit('Initial commit (D-GIG)');
  } catch {
    await git.commit('Initial commit (D-GIG)', { '--allow-empty': true });
  }
  return git;
}

function ensureGitRepo(repoPath) {
  let pending = ensureGitRepoPending.get(repoPath);
  if (!pending) {
    pending = doEnsureGitRepo(repoPath);
    ensureGitRepoPending.set(repoPath, pending);
    void pending.finally(() => {
      if (ensureGitRepoPending.get(repoPath) === pending) {
        ensureGitRepoPending.delete(repoPath);
      }
    });
  }
  return pending;
}

function mapStatusFiles(status) {
  const files = [];
  const seen = new Set();

  const push = (filePath, badge, staged) => {
    const key = `${filePath}:${staged}`;
    if (seen.has(key)) return;
    seen.add(key);
    files.push({ path: filePath, badge, staged });
  };

  if (Array.isArray(status.files) && status.files.length) {
    for (const f of status.files) {
      const p = f.path;
      const index = f.index;
      const work = f.working_dir;
      if (index === 'A' || index === 'M' || index === 'D' || index === 'R') {
        push(p, index === 'A' ? 'A' : index === 'D' ? 'D' : 'M', true);
      }
      if (work === '?' || work === 'U') push(p, 'U', false);
      else if (work === 'M') push(p, 'M', false);
      else if (work === 'D') push(p, 'D', false);
      else if (work === 'A' && index === ' ') push(p, 'A', false);
    }
    return files;
  }

  for (const p of status.staged || []) push(p, 'M', true);
  for (const p of status.created || []) push(p, 'A', false);
  for (const p of status.modified || []) push(p, 'M', false);
  for (const p of status.deleted || []) push(p, 'D', false);
  for (const p of status.not_added || []) push(p, 'U', false);
  return files;
}

function registerIpc() {
  ipcMain.handle('workspace:getTaskRoot', (_e, { taskId }) => {
    if (!taskId) throw new Error('taskId required');
    activeTaskRoot = ensureTaskSeeded(taskId);
    return { root: activeTaskRoot };
  });

  ipcMain.handle('fs:readFile', (_e, { path: filePath }) => {
    if (!activeTaskRoot) throw new Error('No task root');
    const abs = resolveSafe(activeTaskRoot, filePath);
    const content = fs.readFileSync(abs, 'utf-8');
    return { content };
  });

  ipcMain.handle('fs:writeFile', (_e, { path: filePath, content }) => {
    if (!activeTaskRoot) throw new Error('No task root');
    const abs = resolveSafe(activeTaskRoot, filePath);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content, 'utf-8');
    return { ok: true };
  });

  ipcMain.handle('fs:readDir', (_e, { path: dirPath }) => {
    if (!activeTaskRoot) throw new Error('No task root');
    const abs = resolveSafe(activeTaskRoot, dirPath || '.');
    const entries = fs.readdirSync(abs, { withFileTypes: true });
    const base = dirPath && dirPath !== '.' ? dirPath.replace(/\\/g, '/') : '';
    return entries.map((d) => ({
      name: d.name,
      path: base ? `${base}/${d.name}` : d.name,
      isDirectory: d.isDirectory(),
    }));
  });

  ipcMain.handle('fs:deleteFile', (_e, { path: filePath }) => {
    if (!activeTaskRoot) throw new Error('No task root');
    const abs = resolveSafe(activeTaskRoot, filePath);
    const stat = fs.statSync(abs);
    if (stat.isDirectory()) fs.rmSync(abs, { recursive: true });
    else fs.unlinkSync(abs);
    return { ok: true };
  });

  ipcMain.handle('fs:mkdir', (_e, { path: dirPath }) => {
    if (!activeTaskRoot) throw new Error('No task root');
    const abs = resolveSafe(activeTaskRoot, dirPath);
    fs.mkdirSync(abs, { recursive: true });
    return { ok: true };
  });

  ipcMain.handle('terminal:spawn', (e, { cwd }) => {
    const win = BrowserWindow.fromWebContents(e.sender);
    if (!win) return { ok: false, error: 'no window' };

    let pty;
    try {
      pty = require('node-pty');
    } catch {
      return { ok: false, error: 'node-pty not available' };
    }

    const workDir = cwd && fs.existsSync(cwd) ? cwd : activeTaskRoot || process.cwd();

    const existing = terminals.get(win.id);
    if (existing) {
      try {
        existing.kill();
      } catch {
        /* ignore */
      }
    }

    let shellFile;
    let shellArgs;
    if (process.platform === 'win32') {
      const sysRoot = process.env.SystemRoot || 'C:\\Windows';
      shellFile = path.join(sysRoot, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
      shellArgs = [
        '-NoLogo',
        '-NoExit',
        '-Command',
        [
          'chcp 65001 | Out-Null',
          '$utf8 = [System.Text.UTF8Encoding]::new($false)',
          '[Console]::InputEncoding = $utf8',
          '[Console]::OutputEncoding = $utf8',
          '$OutputEncoding = $utf8',
        ].join('; '),
      ];
    } else {
      shellFile = process.env.SHELL || 'bash';
      shellArgs = [];
    }

    const term = pty.spawn(shellFile, shellArgs, {
      name: 'xterm-color',
      cwd: workDir,
      env: {
        ...process.env,
        LANG: 'ko_KR.UTF-8',
        LC_ALL: 'ko_KR.UTF-8',
      },
      encoding: 'utf8',
    });

    terminals.set(win.id, term);

    term.onData((data) => {
      if (!win.isDestroyed()) win.webContents.send('terminal:data', data);
    });

    return { ok: true };
  });

  ipcMain.on('terminal:write', (e, data) => {
    const win = BrowserWindow.fromWebContents(e.sender);
    const term = win ? terminals.get(win.id) : null;
    if (term) term.write(data);
  });

  ipcMain.on('terminal:resize', (e, { cols, rows }) => {
    const win = BrowserWindow.fromWebContents(e.sender);
    const term = win ? terminals.get(win.id) : null;
    if (term) term.resize(cols, rows);
  });

  ipcMain.handle('terminal:kill', (e) => {
    const win = BrowserWindow.fromWebContents(e.sender);
    const term = win ? terminals.get(win.id) : null;
    if (term) {
      try {
        term.kill();
      } catch {
        /* ignore */
      }
      terminals.delete(win.id);
    }
    return { ok: true };
  });

  ipcMain.handle('git:status', async (_e, { repoPath }) => {
    const root = resolveRepoPath(repoPath);
    const git = await ensureGitRepo(root);
    const status = await git.status();
    return {
      current: status.current || 'main',
      tracking: status.tracking || null,
      files: mapStatusFiles(status),
    };
  });

  ipcMain.handle('git:diff', async (_e, { repoPath, file }) => {
    const root = resolveRepoPath(repoPath);
    const git = await ensureGitRepo(root);
    try {
      const diff = await git.diff(['HEAD', '--', file]);
      return diff || '';
    } catch {
      return '';
    }
  });

  ipcMain.handle('git:filePair', async (_e, { repoPath, file }) => {
    const root = resolveRepoPath(repoPath);
    const git = await ensureGitRepo(root);
    const abs = resolveSafe(root, file);
    let modified = '';
    try {
      modified = fs.readFileSync(abs, 'utf-8');
    } catch {
      modified = '';
    }
    let original = '';
    try {
      original = await git.show(['HEAD:' + file.replace(/\\/g, '/')]);
    } catch {
      original = '';
    }
    return { original, modified };
  });

  ipcMain.handle('git:stage', async (_e, { repoPath, files }) => {
    const root = resolveRepoPath(repoPath);
    const git = await ensureGitRepo(root);
    await git.add(files);
    return { ok: true };
  });

  ipcMain.handle('git:unstage', async (_e, { repoPath, files }) => {
    const root = resolveRepoPath(repoPath);
    const git = await ensureGitRepo(root);
    await git.reset(['HEAD', '--', ...files]);
    return { ok: true };
  });

  ipcMain.handle('git:commit', async (_e, { repoPath, message }) => {
    const root = resolveRepoPath(repoPath);
    const git = await ensureGitRepo(root);
    await git.commit(message);
    return { ok: true };
  });

  ipcMain.handle('git:log', async (_e, { repoPath, n = 30 }) => {
    const root = resolveRepoPath(repoPath);
    const git = await ensureGitRepo(root);
    const log = await git.log({ maxCount: n });
    const commits = (log.all || []).map((c) => ({
      hash: c.hash,
      hashShort: c.hash.slice(0, 7),
      message: c.message,
      author: c.author_name || c.author || '',
      date: c.date || '',
    }));
    return { commits };
  });

  ipcMain.handle('git:branches', async (_e, { repoPath }) => {
    const root = resolveRepoPath(repoPath);
    const git = await ensureGitRepo(root);
    const summary = await git.branchLocal();
    return {
      current: summary.current || 'main',
      all: summary.all || [],
    };
  });

  ipcMain.handle('git:checkout', async (_e, { repoPath, branch }) => {
    const root = resolveRepoPath(repoPath);
    const git = await ensureGitRepo(root);
    await git.checkout(branch);
    return { ok: true };
  });

  ipcMain.handle('git:newBranch', async (_e, { repoPath, name }) => {
    const root = resolveRepoPath(repoPath);
    const git = await ensureGitRepo(root);
    await git.checkoutLocalBranch(name);
    return { ok: true };
  });

  ipcMain.handle('git:commitFiles', async (_e, { repoPath, hash }) => {
    const root = resolveRepoPath(repoPath);
    const git = await ensureGitRepo(root);
    const out = await git.show(['--name-only', '--pretty=format:', hash]);
    const files = out
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    return { files };
  });

  ipcMain.handle('api:request', async (_e, payload) => {
    const { method, url, headers, body } = payload || {};
    if (!url || typeof url !== 'string') {
      throw new Error('url required');
    }
    const start = Date.now();
    try {
      const res = await axios({
        method: (method || 'GET').toUpperCase(),
        url,
        headers: headers && typeof headers === 'object' ? headers : {},
        data: body != null && body !== '' ? body : undefined,
        validateStatus: () => true,
        timeout: 120000,
        maxRedirects: 10,
        responseType: 'text',
        transformResponse: [(data) => data],
      });
      const flatHeaders = {};
      for (const [k, v] of Object.entries(res.headers || {})) {
        if (v == null) continue;
        flatHeaders[k] = Array.isArray(v) ? v.join(', ') : String(v);
      }
      const responseBody =
        typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2);
      return {
        status: res.status,
        statusText: res.statusText || '',
        headers: flatHeaders,
        body: responseBody,
        durationMs: Date.now() - start,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        status: 0,
        statusText: 'Network Error',
        headers: {},
        body: message,
        durationMs: Date.now() - start,
      };
    }
  });
}

function startStaticServer(distDir) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
        if (urlPath === '/') urlPath = '/index.html';

        let filePath = path.join(distDir, urlPath.replace(/^\//, '').replace(/\//g, path.sep));
        if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          filePath = path.join(distDir, 'index.html');
        }

        const ext = path.extname(filePath).toLowerCase();
        const data = fs.readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(data);
      } catch {
        res.writeHead(404);
        res.end('Not found');
      }
    });

    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({ server, url: `http://127.0.0.1:${port}/` });
    });
  });
}

let staticServer = null;

async function createWindow() {
  const distDir = getDistDir();
  const indexHtml = path.join(distDir, 'index.html');

  if (!fs.existsSync(indexHtml)) {
    dialog.showErrorBox(
      'D-GIG 실행 오류',
      `앱 파일을 찾을 수 없습니다.\n\n${indexHtml}\n\n다시 빌드해 주세요.`,
    );
    app.quit();
    return;
  }

  let appUrl;
  if (!app.isPackaged) {
    appUrl = 'http://127.0.0.1:5173';
  } else {
    const started = await startStaticServer(distDir);
    staticServer = started.server;
    appUrl = started.url;
  }

  const preloadPath = path.join(__dirname, 'preload.cjs');

  const win = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 960,
    minHeight: 640,
    title: 'D-GIG — GigCareer',
    autoHideMenuBar: true,
    backgroundColor: '#04060c',
    show: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: fs.existsSync(preloadPath) ? preloadPath : undefined,
      sandbox: false,
    },
  });

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; worker-src 'self' blob:",
        ],
      },
    });
  });

  win.webContents.on('did-fail-load', (_e, code, desc, url) => {
    dialog.showErrorBox('로드 실패', `${desc}\n(${code})\n${url}`);
  });

  win.on('closed', () => {
    const term = terminals.get(win.id);
    if (term) {
      try {
        term.kill();
      } catch {
        /* ignore */
      }
      terminals.delete(win.id);
    }
  });

  await win.loadURL(appUrl);
}

app.whenReady().then(() => {
  registerIpc();
  createWindow().catch((err) => {
    dialog.showErrorBox('D-GIG 오류', String(err));
    app.quit();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (staticServer) staticServer.close();
  if (process.platform !== 'darwin') app.quit();
});
