import { useCallback, useEffect, useState } from 'react';
import { initTaskRoot } from '../../code-editor/ipc/fileSystem';
import type { GitBranchInfo, GitFilePair, GitLogEntry, GitStatusResult } from '../types';

export function useGit(taskId: string) {
  const [repoPath, setRepoPath] = useState('');
  const [status, setStatus] = useState<GitStatusResult | null>(null);
  const [branches, setBranches] = useState<GitBranchInfo | null>(null);
  const [log, setLog] = useState<GitLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const electron = typeof window !== 'undefined' && !!window.dgigGit;

  const refresh = useCallback(async () => {
    if (!window.dgigGit || !taskId) return;
    setLoading(true);
    setError('');
    try {
      const root = repoPath || (await initTaskRoot(taskId));
      if (!repoPath) setRepoPath(root);
      const [st, br, lg] = await Promise.all([
        window.dgigGit.status(root),
        window.dgigGit.branches(root),
        window.dgigGit.log(root, 40),
      ]);
      setStatus(st);
      setBranches(br);
      setLog(lg.commits);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Git error');
    } finally {
      setLoading(false);
    }
  }, [repoPath, taskId]);

  useEffect(() => {
    void refresh();
  }, [taskId]); // eslint-disable-line react-hooks/exhaustive-deps

  const stage = useCallback(
    async (files: string[]) => {
      if (!window.dgigGit || !repoPath) return;
      await window.dgigGit.stage(repoPath, files);
      await refresh();
    },
    [refresh, repoPath],
  );

  const unstage = useCallback(
    async (files: string[]) => {
      if (!window.dgigGit || !repoPath) return;
      await window.dgigGit.unstage(repoPath, files);
      await refresh();
    },
    [refresh, repoPath],
  );

  const commit = useCallback(
    async (message: string) => {
      if (!window.dgigGit || !repoPath) return;
      await window.dgigGit.commit(repoPath, message);
      await refresh();
    },
    [refresh, repoPath],
  );

  const checkout = useCallback(
    async (branch: string) => {
      if (!window.dgigGit || !repoPath) return;
      await window.dgigGit.checkout(repoPath, branch);
      await refresh();
    },
    [refresh, repoPath],
  );

  const newBranch = useCallback(
    async (name: string) => {
      if (!window.dgigGit || !repoPath) return;
      await window.dgigGit.newBranch(repoPath, name);
      await refresh();
    },
    [refresh, repoPath],
  );

  const loadFilePair = useCallback(
    async (file: string): Promise<GitFilePair | null> => {
      if (!window.dgigGit || !repoPath) return null;
      return window.dgigGit.filePair(repoPath, file);
    },
    [repoPath],
  );

  const loadCommitFiles = useCallback(
    async (hash: string) => {
      if (!window.dgigGit || !repoPath) return [];
      const { files } = await window.dgigGit.commitFiles(repoPath, hash);
      return files;
    },
    [repoPath],
  );

  const stageAll = useCallback(async () => {
    const paths = status?.files.filter((f) => !f.staged).map((f) => f.path) ?? [];
    if (paths.length) await stage(paths);
  }, [stage, status?.files]);

  return {
    electron,
    repoPath,
    status,
    branches,
    log,
    loading,
    error,
    refresh,
    stage,
    unstage,
    stageAll,
    commit,
    checkout,
    newBranch,
    loadFilePair,
    loadCommitFiles,
  };
}
