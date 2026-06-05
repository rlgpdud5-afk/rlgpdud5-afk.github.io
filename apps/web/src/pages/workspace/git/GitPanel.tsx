import { useCallback, useEffect, useState } from 'react';
import { useI18n } from '../../../context/I18nContext';
import { GitBranchBar } from './components/GitBranchBar';
import { GitDiffViewer } from './components/GitDiffViewer';
import { GitLogViewer } from './components/GitLogViewer';
import { GitStatusList } from './components/GitStatusList';
import { useGit } from './hooks/useGit';
import type { GitFilePair, GitLogEntry } from './types';
import './git.css';

export type GitPanelHandle = {
  commit: () => Promise<void>;
};

export function GitPanel({
  taskId,
  onToast,
}: {
  taskId: string;
  onToast: (msg: string) => void;
}) {
  const { t } = useI18n();
  const {
    electron,
    status,
    branches,
    log,
    loading,
    error,
    refresh,
    stage,
    unstage,
    stageAll,
    commit: gitCommit,
    checkout,
    newBranch,
    loadFilePair,
    loadCommitFiles,
  } = useGit(taskId);

  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [pair, setPair] = useState<GitFilePair | null>(null);
  const [diffLoading, setDiffLoading] = useState(false);
  const [commitMsg, setCommitMsg] = useState('');
  const [selectedHash, setSelectedHash] = useState<string | null>(null);
  const [commitFiles, setCommitFiles] = useState<string[]>([]);

  const selectFile = useCallback(
    async (path: string) => {
      setSelectedPath(path);
      setDiffLoading(true);
      try {
        const p = await loadFilePair(path);
        setPair(p);
      } catch {
        setPair(null);
      } finally {
        setDiffLoading(false);
      }
    },
    [loadFilePair],
  );

  const doCommit = useCallback(async () => {
    if (!commitMsg.trim()) {
      onToast(t('workspace.gitNeedMsg'));
      return;
    }
    try {
      await gitCommit(commitMsg.trim());
      setCommitMsg('');
      onToast(t('workspace.gitCommitted'));
    } catch (e) {
      onToast(e instanceof Error ? e.message : t('workspace.gitCommitFailed'));
    }
  }, [commitMsg, gitCommit, onToast, t]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        void doCommit();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [doCommit]);

  const onSelectCommit = useCallback(
    async (entry: GitLogEntry) => {
      setSelectedHash(entry.hash);
      try {
        const files = await loadCommitFiles(entry.hash);
        setCommitFiles(files);
      } catch {
        setCommitFiles([]);
      }
    },
    [loadCommitFiles],
  );

  if (!electron) {
    return (
      <div className="git-root">
        <p className="git-muted">{t('workspace.gitElectronOnly')}</p>
      </div>
    );
  }

  const files = status?.files ?? [];

  return (
    <div className="git-root">
      <GitBranchBar branches={branches} onCheckout={checkout} onNewBranch={newBranch} />
      {error && <p className="git-error">{error}</p>}
      {loading && <p className="git-muted">Refreshing…</p>}
      <div className="git-layout">
        <aside className="git-side">
          <GitStatusList
            files={files}
            selectedPath={selectedPath}
            onSelect={(p) => void selectFile(p)}
            onStage={(p) => void stage([p])}
            onUnstage={(p) => void unstage([p])}
            onStageAll={() => void stageAll()}
          />
          <textarea
            className="git-commit-input"
            rows={3}
            placeholder="Commit message"
            value={commitMsg}
            onChange={(e) => setCommitMsg(e.target.value)}
          />
          <button type="button" className="git-btn git-btn--primary" onClick={() => void doCommit()}>
            Commit (Ctrl+Enter)
          </button>
          <button type="button" className="git-btn git-btn--ghost" onClick={() => void refresh()}>
            Refresh
          </button>
          <GitLogViewer
            commits={log}
            selectedHash={selectedHash}
            commitFiles={commitFiles}
            onSelectCommit={(e) => void onSelectCommit(e)}
            onSelectCommitFile={(f) => void selectFile(f)}
          />
        </aside>
        <main className="git-main">
          <GitDiffViewer filePath={selectedPath} pair={pair} loading={diffLoading} />
        </main>
      </div>
    </div>
  );
}
