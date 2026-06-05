import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as monaco from 'monaco-editor';
import { languageFromPath, writeFile } from './ipc/fileSystem';
import { useEditorTabs, type EditorPane } from './hooks/useEditorTabs';
import { useFileTree } from './hooks/useFileTree';
import { useFindInFiles } from './hooks/useFindInFiles';
import { useProblems } from './hooks/useProblems';
import { EditorTabs } from './components/EditorTabs';
import { FileTree } from './components/FileTree';
import { MonacoPane } from './components/MonacoPane';
import { Terminal } from './components/Terminal';
import { Breadcrumb } from './components/Breadcrumb';
import { CommandPalette, type PaletteCommand } from './components/CommandPalette';
import { EditorToolbar } from './components/EditorToolbar';
import { FindInFiles } from './components/FindInFiles';
import { ProblemsPanel } from './components/ProblemsPanel';
import './code-editor.css';

export type CodeEditorHandle = {
  save: () => Promise<boolean>;
  closeActiveTab: () => 'ok' | 'cancel';
  newFile: () => void;
};

const LANG_MODES = [
  { id: 'typescript', label: 'TypeScript' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'json', label: 'JSON' },
  { id: 'css', label: 'CSS' },
  { id: 'html', label: 'HTML' },
  { id: 'sql', label: 'SQL' },
  { id: 'markdown', label: 'Markdown' },
  { id: 'plaintext', label: 'Plain Text' },
];

export const CodeEditorPage = forwardRef<
  CodeEditorHandle,
  {
    taskId: string;
    terminalOpen: boolean;
    onToggleTerminal: () => void;
    onToast: (msg: string) => void;
    initialPath?: string;
  }
>(function CodeEditorPage({ taskId, terminalOpen, onToggleTerminal, onToast, initialPath }, ref) {
  const {
    tabs,
    activeTab,
    activeTabId,
    leftTab,
    rightTab,
    splitMode,
    focusPane,
    setFocusPane,
    setActiveTabId,
    openFile,
    assignTabToPane,
    toggleSplit,
    closeTab,
    closeAllTabs,
    closeActiveTab,
    updateContent,
    markSaved,
    isDirty,
  } = useEditorTabs(taskId);

  const [minimapOn, setMinimapOn] = useState(true);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [findOpen, setFindOpen] = useState(false);
  const [findQuery, setFindQuery] = useState('');
  const [problemsOpen, setProblemsOpen] = useState(false);
  const [markerTick, setMarkerTick] = useState(0);

  const leftEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const rightEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const focusedEditor = () =>
    splitMode && focusPane === 'right' ? rightEditorRef.current : leftEditorRef.current;

  const onOpenFile = useCallback(
    (path: string, language: string) => {
      void openFile(path, language);
    },
    [openFile],
  );

  const { taskRootDir, cwd, nodes, loading, error, refresh, openNode, goUp, setCwd } = useFileTree(
    taskId,
    onOpenFile,
  );

  const { results: findResults, searching } = useFindInFiles(taskId, findQuery, findOpen);
  const problems = useProblems(problemsOpen, markerTick);

  useEffect(() => {
    if (initialPath) {
      void openFile(initialPath, languageFromPath(initialPath));
    }
  }, [initialPath, openFile]);

  const breadcrumbPath = useMemo(() => {
    if (splitMode && focusPane === 'right') return rightTab?.path ?? null;
    return (splitMode ? leftTab : activeTab)?.path ?? null;
  }, [activeTab, focusPane, leftTab, rightTab, splitMode]);

  const formatEditor = useCallback(async (editor: monaco.editor.IStandaloneCodeEditor | null) => {
    if (!editor) return;
    await editor.getAction('editor.action.formatDocument')?.run();
  }, []);

  const save = useCallback(async () => {
    const tab = splitMode && focusPane === 'right' ? rightTab : splitMode ? leftTab : activeTab;
    const editor = focusedEditor();
    if (!tab) {
      onToast('열린 파일 없음');
      return false;
    }
    try {
      await formatEditor(editor);
      const model = editor?.getModel();
      const content = model?.getValue() ?? tab.content;
      if (model && content !== tab.content) {
        updateContent(tab.id, content);
      }
      await writeFile(tab.path, content, taskId);
      markSaved(tab.id, content);
      onToast('저장됨');
      setMarkerTick((n) => n + 1);
      return true;
    } catch (e) {
      onToast(e instanceof Error ? e.message : '저장 실패');
      return false;
    }
  }, [
    activeTab,
    focusPane,
    formatEditor,
    leftTab,
    markSaved,
    onToast,
    rightTab,
    splitMode,
    taskId,
    updateContent,
  ]);

  const newFile = useCallback(() => {
    const name = window.prompt('새 파일 경로', 'untitled.ts');
    if (!name) return;
    const rel = cwd === '.' ? name : `${cwd}/${name}`;
    writeFile(rel, '', taskId)
      .then(() => {
        refresh();
        return openFile(rel, languageFromPath(rel));
      })
      .catch((e) => onToast(e instanceof Error ? e.message : '생성 실패'));
  }, [cwd, onToast, openFile, refresh, taskId]);

  const jumpToLine = useCallback(
    (path: string, line: number) => {
      void openFile(path, languageFromPath(path)).then(() => {
        const ed = focusedEditor();
        if (ed) {
          ed.revealLineInCenter(line);
          ed.setPosition({ lineNumber: line, column: 1 });
          ed.focus();
        }
      });
    },
    [openFile],
  );

  const toggleMinimap = useCallback(() => {
    const next = !minimapOn;
    setMinimapOn(next);
    leftEditorRef.current?.updateOptions({ minimap: { enabled: next } });
    rightEditorRef.current?.updateOptions({ minimap: { enabled: next } });
  }, [minimapOn]);

  const paletteCommands = useMemo((): PaletteCommand[] => {
    const ed = focusedEditor();
    const tab = splitMode && focusPane === 'right' ? rightTab : splitMode ? leftTab : activeTab;
    return [
      {
        id: 'format',
        label: 'Format Document',
        run: () => void formatEditor(ed),
      },
      {
        id: 'minimap',
        label: 'Toggle Minimap',
        run: toggleMinimap,
      },
      {
        id: 'terminal',
        label: 'Toggle Terminal',
        run: onToggleTerminal,
      },
      {
        id: 'split',
        label: 'Split Editor',
        run: toggleSplit,
      },
      {
        id: 'lang',
        label: 'Change Language Mode',
        run: () => {
          if (!ed || !tab) return;
          const pick = window.prompt(
            `Language (${LANG_MODES.map((l) => l.id).join(', ')})`,
            tab.language,
          );
          if (!pick) return;
          const model = ed.getModel();
          if (model) monaco.editor.setModelLanguage(model, pick);
        },
      },
      {
        id: 'goto',
        label: 'Go to Line',
        run: () => {
          if (!ed) return;
          const raw = window.prompt('Line number', '1');
          const n = parseInt(raw ?? '', 10);
          if (!Number.isFinite(n) || n < 1) return;
          ed.revealLineInCenter(n);
          ed.setPosition({ lineNumber: n, column: 1 });
        },
      },
      {
        id: 'closeAll',
        label: 'Close All Tabs',
        run: () => closeAllTabs(false),
      },
      {
        id: 'find',
        label: 'Find in Files',
        run: () => setFindOpen(true),
      },
      {
        id: 'problems',
        label: 'Toggle Problems',
        run: () => setProblemsOpen((o) => !o),
      },
    ];
  }, [
    activeTab,
    closeAllTabs,
    focusPane,
    formatEditor,
    leftTab,
    onToggleTerminal,
    rightTab,
    splitMode,
    toggleMinimap,
    toggleSplit,
  ]);

  useImperativeHandle(ref, () => ({ save, closeActiveTab: () => closeActiveTab(false), newFile }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault();
        e.stopImmediatePropagation();
        setPaletteOpen(true);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
        e.preventDefault();
        e.stopImmediatePropagation();
        setFindOpen(true);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'M' || e.key === 'm')) {
        e.preventDefault();
        e.stopImmediatePropagation();
        setProblemsOpen((o) => !o);
        setMarkerTick((n) => n + 1);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '\\' && !e.shiftKey) {
        e.preventDefault();
        e.stopImmediatePropagation();
        toggleSplit();
        return;
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [toggleSplit]);

  const onTabDrop = (pane: EditorPane) => (e: React.DragEvent) => {
    e.preventDefault();
    const tabId = e.dataTransfer.getData('text/ce-tab-id');
    if (tabId) assignTabToPane(tabId, pane);
  };

  return (
    <div className="ce-root">
      <CommandPalette open={paletteOpen} commands={paletteCommands} onClose={() => setPaletteOpen(false)} />
      <div className="ce-main">
        <EditorTabs
          tabs={tabs}
          activeTabId={activeTabId}
          isDirty={isDirty}
          onSelect={setActiveTabId}
          onClose={(id) => closeTab(id)}
          onNew={newFile}
          onDragToPane={assignTabToPane}
        />
        <div className="ce-workspace">
          <FileTree
            taskId={taskId}
            cwd={cwd}
            nodes={nodes}
            loading={loading}
            error={error}
            onOpen={openNode}
            onRefresh={refresh}
            onGoUp={goUp}
          />
          <div className="ce-editor-col">
            <EditorToolbar
              splitMode={splitMode}
              minimapOn={minimapOn}
              onToggleSplit={toggleSplit}
              onToggleMinimap={toggleMinimap}
              onHelp={() =>
                onToast('Alt+Click: multi-cursor · F12: Go to definition · Ctrl+Space: IntelliSense')
              }
            />
            <Breadcrumb
              filePath={breadcrumbPath}
              onNavigate={(folder) => setCwd(folder === '' ? '.' : folder)}
            />
            <FindInFiles
              open={findOpen}
              query={findQuery}
              onQueryChange={setFindQuery}
              results={findResults}
              searching={searching}
              onClose={() => setFindOpen(false)}
              onOpenMatch={(m) => {
                setFindOpen(false);
                jumpToLine(m.path, m.line);
              }}
            />
            <div className={'ce-editor-split' + (splitMode ? ' split' : '')}>
              <div
                className={'ce-editor-pane' + (focusPane === 'left' ? ' focused' : '')}
                onDragOver={(e) => e.preventDefault()}
                onDrop={onTabDrop('left')}
                onMouseDown={() => setFocusPane('left')}
              >
                <MonacoPane
                  tab={splitMode ? leftTab : activeTab}
                  minimapEnabled={minimapOn}
                  onChange={(v) => {
                    const t = splitMode ? leftTab : activeTab;
                    if (t) updateContent(t.id, v);
                  }}
                  onEditorReady={(ed) => {
                    leftEditorRef.current = ed;
                    ed.onDidChangeModelContent(() => setMarkerTick((n) => n + 1));
                  }}
                  onFocus={() => setFocusPane('left')}
                />
              </div>
              {splitMode && (
                <div
                  className={'ce-editor-pane' + (focusPane === 'right' ? ' focused' : '')}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onTabDrop('right')}
                  onMouseDown={() => setFocusPane('right')}
                >
                  <MonacoPane
                    tab={rightTab}
                    minimapEnabled={minimapOn}
                    onChange={(v) => rightTab && updateContent(rightTab.id, v)}
                    onEditorReady={(ed) => {
                      rightEditorRef.current = ed;
                      ed.onDidChangeModelContent(() => setMarkerTick((n) => n + 1));
                    }}
                    onFocus={() => setFocusPane('right')}
                  />
                </div>
              )}
            </div>
            <ProblemsPanel
              open={problemsOpen}
              problems={problems}
              onClose={() => setProblemsOpen(false)}
              onOpen={(p) => {
                const path = tabs.find((t) => p.path.endsWith(t.path) || t.path === p.path)?.path ?? p.path;
                jumpToLine(path, p.line);
              }}
            />
          </div>
        </div>
      </div>
      <Terminal open={terminalOpen} taskRootDir={taskRootDir} onToggle={onToggleTerminal} />
    </div>
  );
});
