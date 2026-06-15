import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../context/I18nContext';
import { useLocalize } from '../../i18n/localizeDisplay';
import {
  SECURE_TASKS,
  loadWorkspace,
  saveWorkspace,
  type WorkspaceFile,
  type WorkspaceMode,
  type WorkspaceState,
} from '../../lib/workspace/store';
import { clearLegacyVfs, migrateSeedFiles } from '../../lib/workspace/seeds';
import { useWorkspaceShortcuts } from './useWorkspaceShortcuts';
import { ApiTesterPage } from './api-tester/ApiTesterPage';
import { CodeEditorPage, type CodeEditorHandle } from './code-editor/CodeEditorPage';
import { DbPanel } from './panels/DbPanel';
import { DebugPanel } from './panels/DebugPanel';
import { DesignPanel } from './panels/DesignPanel';
import type { DesignEditorHandle } from './design-editor/DesignEditorPage';
import { DocsPanel } from './panels/DocsPanel';
import { GitPanel } from './git/GitPanel';
import { SecurityTrustPanel } from './panels/SecurityTrustPanel';
import '../../workspace.css';

const TOOLS: { mode: WorkspaceMode; icon: string; key: string }[] = [
  { mode: 'code', icon: '⌨', key: 'code' },
  { mode: 'design', icon: '◆', key: 'design' },
  { mode: 'git', icon: '⎇', key: 'git' },
  { mode: 'api', icon: '⚡', key: 'api' },
  { mode: 'db', icon: '▦', key: 'db' },
  { mode: 'debug', icon: '⛭', key: 'debug' },
  { mode: 'security', icon: '◈', key: 'security' },
  { mode: 'docs', icon: '☰', key: 'docs' },
];

const COMMANDS = [
  { id: 'save', keys: 'Ctrl+S', run: 'save' },
  { id: 'modeCode', keys: 'Ctrl+Shift+E', run: 'modeCode' },
  { id: 'modeDesign', keys: '', run: 'modeDesign' },
  { id: 'modeGit', keys: 'Ctrl+Shift+G', run: 'modeGit' },
  { id: 'modeDebug', keys: 'Ctrl+Shift+D', run: 'modeDebug' },
  { id: 'modeSecurity', keys: '', run: 'modeSecurity' },
  { id: 'modeApi', keys: '', run: 'modeApi' },
  { id: 'modeDb', keys: '', run: 'modeDb' },
  { id: 'toggleSidebar', keys: 'Ctrl+B', run: 'sidebar' },
  { id: 'toggleTerminal', keys: 'Ctrl+`', run: 'terminal' },
  { id: 'newFile', keys: 'Ctrl+N', run: 'newFile' },
  { id: 'togglePanels', keys: 'Ctrl+\\', run: 'panels' },
  { id: 'zoomFit', keys: 'Shift+1', run: 'zoom' },
] as const;

export function WorkspacePage() {
  const navigate = useNavigate();
  const { t, locale } = useI18n();
  const loc = useLocalize();
  const [state, setState] = useState<WorkspaceState>(() => {
    clearLegacyVfs(locale);
    return loadWorkspace(locale);
  });
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState('');
  const [toast, setToast] = useState('');
  const [, setZoom] = useState(1);
  const [codeTaskId, setCodeTaskId] = useState('st2');
  const [designTaskId, setDesignTaskId] = useState('st1');
  const [gitTaskId, setGitTaskId] = useState('st2');
  const [apiTaskId, setApiTaskId] = useState('st4');
  const codeEditorRef = useRef<CodeEditorHandle>(null);
  const designEditorRef = useRef<DesignEditorHandle>(null);

  const codeInitialPath = useMemo(() => {
    return SECURE_TASKS.find((task) => task.id === codeTaskId)?.file;
  }, [codeTaskId]);

  useEffect(() => {
    clearLegacyVfs(locale);
    setState((prev) => {
      const files = migrateSeedFiles(prev.files, locale);
      const changed = files.some((f, i) => f.content !== prev.files[i]?.content);
      if (!changed) return prev;
      const next = { ...prev, files };
      saveWorkspace(next);
      return next;
    });
  }, [locale]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  }, []);

  const patch = useCallback((p: Partial<WorkspaceState>) => {
    setState((s) => {
      const next = { ...s, ...p };
      saveWorkspace(next);
      return next;
    });
  }, []);

  const save = useCallback(() => {
    if (state.mode === 'code' && codeEditorRef.current) {
      void codeEditorRef.current.save();
      return;
    }
    if (state.mode === 'design' && designEditorRef.current) {
      void designEditorRef.current.save();
      return;
    }
    saveWorkspace(state);
    showToast(t('workspace.saved'));
  }, [state, showToast, t]);

  const newFile = useCallback(() => {
    if (state.mode === 'code' && codeEditorRef.current) {
      codeEditorRef.current.newFile();
      return;
    }
    const id = `f${Date.now()}`;
    const file: WorkspaceFile = { id, name: 'untitled.ts', content: '' };
    patch({ files: [...state.files, file], activeFileId: id, mode: 'code' });
    showToast(t('workspace.newFile'));
  }, [patch, showToast, state.files, state.mode, t]);

  const closeTab = useCallback(() => {
    if (state.mode === 'code' && codeEditorRef.current) {
      codeEditorRef.current.closeActiveTab();
      return;
    }
    if (state.files.length <= 1 || state.mode !== 'code') return;
    const rest = state.files.filter((f) => f.id !== state.activeFileId);
    patch({ files: rest, activeFileId: rest[0].id });
  }, [patch, state.activeFileId, state.files, state.mode]);

  const runAction = useCallback(() => {
    if (state.mode === 'db') {
      showToast(t('workspace.dbRan'));
    }
  }, [patch, showToast, state.commitMsg, state.mode, t]);

  const runCommand = useCallback(
    (run: string) => {
      setPaletteOpen(false);
      setPaletteQuery('');
      const map: Record<string, () => void> = {
        save,
        modeCode: () => patch({ mode: 'code' }),
        modeDesign: () => patch({ mode: 'design' }),
        modeGit: () => patch({ mode: 'git' }),
        modeDebug: () => patch({ mode: 'debug' }),
        modeApi: () => patch({ mode: 'api' }),
        modeDb: () => patch({ mode: 'db' }),
        modeSecurity: () => patch({ mode: 'security' }),
        sidebar: () => patch({ sidebarOpen: !state.sidebarOpen }),
        terminal: () => patch({ terminalOpen: !state.terminalOpen }),
        newFile,
        panels: () => patch({ panelsHidden: !state.panelsHidden }),
        zoom: () => {
          setZoom(1);
          showToast(t('workspace.zoomFit'));
        },
      };
      map[run]?.();
    },
    [newFile, patch, save, showToast, state.panelsHidden, state.sidebarOpen, state.terminalOpen, t],
  );

  useWorkspaceShortcuts({
    mode: state.mode,
    setMode: (m) => patch({ mode: m }),
    save,
    openPalette: () => {
      setPaletteOpen(true);
      setQuickOpen(false);
    },
    openQuickOpen: () => {
      setQuickOpen(true);
      setPaletteOpen(false);
    },
    toggleSidebar: () => patch({ sidebarOpen: !state.sidebarOpen }),
    toggleTerminal: () => patch({ terminalOpen: !state.terminalOpen }),
    closeTab,
    newFile,
    setDesignTool: (designTool) => patch({ designTool }),
    togglePanels: () => patch({ panelsHidden: !state.panelsHidden }),
    zoomFit: () => {
      setZoom(1);
      showToast(t('workspace.zoomFit'));
    },
    runAction,
    toast: showToast,
  });

  const commands = useMemo(
    () =>
      COMMANDS.map((c) => ({ ...c, label: t(`workspace.cmd.${c.id}`) })).filter(
        (c) => !paletteQuery || c.label.toLowerCase().includes(paletteQuery.toLowerCase()),
      ),
    [paletteQuery, t],
  );

  const docsContent = state.files.find((f) => f.name.endsWith('.md'))?.content || '';

  useEffect(() => {
    saveWorkspace(state);
  }, [state]);

  const statusKeys =
    state.mode === 'code'
      ? ['save', 'quickOpen', 'palette']
      : state.mode === 'design'
        ? ['figmaTools', 'hideUi']
        : state.mode === 'git'
          ? ['gitKeys']
          : state.mode === 'api'
            ? ['apiKeys']
            : state.mode === 'db'
              ? ['dbKeys']
              : state.mode === 'debug'
                ? ['debugKeys']
                : state.mode === 'security'
                  ? ['securityKeys']
                  : ['docsKeys'];

  return (
    <div className={'ws-root' + (state.panelsHidden ? ' ws-hidden' : '')}>
      <div className="ws-titlebar">
        <button type="button" className="ws-titlebar-back" onClick={() => navigate('/')}>
          ← {t('common.home')}
        </button>
        <span className="ws-secure-badge">
          <span className="ws-secure-dot" />
          {t('workspace.secureBadge')}
        </span>
        <span className="ws-titlebar-mode">{t(`workspace.tools.${state.mode}`)}</span>
        <span className="ws-suite-tag">{t('workspace.suiteTag')}</span>
      </div>

      <div className="ws-body">
        <div className="ws-activity">
          {TOOLS.map(({ mode, icon, key }) => (
            <button
              key={mode}
              type="button"
              className={'ws-act-btn' + (state.mode === mode ? ' on' : '')}
              title={t(`workspace.tools.${key}`)}
              onClick={() => patch({ mode, sidebarOpen: true, sideView: mode === 'code' ? 'files' : state.sideView })}
            >
              {icon}
            </button>
          ))}
          <button
            type="button"
            className={'ws-act-btn' + (state.sideView === 'tasks' ? ' on' : '')}
            title={t('workspace.tasks')}
            onClick={() => {
              patch({ sidebarOpen: true, sideView: 'tasks' });
            }}
          >
            🔒
          </button>
        </div>

        <aside className={'ws-sidebar' + (state.sidebarOpen ? '' : ' off')}>
          <div className="ws-side-head">
            {state.sideView === 'tasks' ? t('workspace.tasks') : t('workspace.explorer')}
          </div>
          {state.sideView === 'tasks'
            ? SECURE_TASKS.map((task) => (
                <div
                  key={task.id}
                  className="ws-task"
                  onClick={() => {
                    if (task.tool === 'code') setCodeTaskId(task.id);
                    if (task.tool === 'design') setDesignTaskId(task.id);
                    if (task.tool === 'code' || task.tool === 'git') setGitTaskId(task.id);
                    if (task.tool === 'api') setApiTaskId(task.id);
                    const file = state.files.find((f) => f.taskId === task.id);
                    if (file) patch({ activeFileId: file.id, mode: task.tool });
                    else patch({ mode: task.tool });
                    showToast(loc.text(task.title));
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="ws-task-title">{loc.text(task.title)}</div>
                  <div className="ws-task-meta">
                    {loc.name(task.assignee)} · {t(`workspace.tools.${task.tool}`)} · {task.status}
                  </div>
                </div>
              ))
            : state.files.map((f) => (
                <div
                  key={f.id}
                  className={'ws-file' + (f.id === state.activeFileId ? ' on' : '')}
                  onClick={() => patch({ activeFileId: f.id, mode: f.name.endsWith('.md') ? 'docs' : 'code' })}
                  role="button"
                  tabIndex={0}
                >
                  {f.name}
                </div>
              ))}
        </aside>

        <div className="ws-main">
          {state.mode === 'code' && (
            <CodeEditorPage
              ref={codeEditorRef}
              key={codeTaskId}
              taskId={codeTaskId}
              terminalOpen={state.terminalOpen}
              onToggleTerminal={() => patch({ terminalOpen: !state.terminalOpen })}
              onToast={showToast}
              initialPath={codeInitialPath}
            />
          )}
          {state.mode === 'design' && (
            <DesignPanel
              ref={designEditorRef}
              key={designTaskId}
              taskId={designTaskId}
              onToast={showToast}
            />
          )}
          {state.mode === 'git' && (
            <GitPanel key={gitTaskId} taskId={gitTaskId} onToast={showToast} />
          )}
          {state.mode === 'api' && (
            <ApiTesterPage key={apiTaskId} taskId={apiTaskId} onToast={showToast} />
          )}
          {state.mode === 'db' && (
            <DbPanel
              query={state.sqlQuery}
              onQuery={(sqlQuery) => patch({ sqlQuery })}
              onRun={runAction}
              runLabel={t('workspace.dbRun')}
              tablesLabel={t('workspace.dbTables')}
            />
          )}
          {state.mode === 'debug' && (
            <DebugPanel
              consoleLines={state.debugConsole}
              watchLabel={t('workspace.debugWatch')}
              consoleLabel={t('workspace.debugConsole')}
              breakpointsLabel={t('workspace.debugBp')}
            />
          )}
          {state.mode === 'security' && <SecurityTrustPanel />}
          {state.mode === 'docs' && (
            <DocsPanel
              content={docsContent}
              onChange={(content) => {
                const md = state.files.find((f) => f.name.endsWith('.md'));
                if (md) patch({ files: state.files.map((f) => (f.id === md.id ? { ...f, content } : f)) });
              }}
              previewLabel={t('workspace.docsPreview')}
              editLabel={t('workspace.docsEdit')}
            />
          )}

          <div className={'ws-statusbar ws-statusbar--' + state.mode}>
            {statusKeys.map((k) => (
              <span key={k}>{t(`workspace.status.${k}`)}</span>
            ))}
          </div>
        </div>
      </div>

      {paletteOpen && (
        <div className="ws-palette-bg" onClick={() => setPaletteOpen(false)} role="presentation">
          <div className="ws-palette" onClick={(e) => e.stopPropagation()} role="dialog">
            <input
              autoFocus
              placeholder={t('workspace.palettePh')}
              value={paletteQuery}
              onChange={(e) => setPaletteQuery(e.target.value)}
            />
            {commands.map((c) => (
              <div key={c.id} className="ws-palette-item" onClick={() => runCommand(c.run)} role="button" tabIndex={0}>
                {c.label}
                {c.keys && <kbd>{c.keys}</kbd>}
              </div>
            ))}
          </div>
        </div>
      )}

      {quickOpen && (
        <div className="ws-palette-bg" onClick={() => setQuickOpen(false)} role="presentation">
          <div className="ws-palette" onClick={(e) => e.stopPropagation()} role="dialog">
            <input autoFocus placeholder={t('workspace.quickOpenPh')} readOnly />
            {state.files.map((f) => (
              <div
                key={f.id}
                className="ws-palette-item"
                onClick={() => {
                  patch({ activeFileId: f.id, mode: 'code' });
                  setQuickOpen(false);
                }}
                role="button"
                tabIndex={0}
              >
                {f.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {toast && <div className="ws-toast">{toast}</div>}
    </div>
  );
}
