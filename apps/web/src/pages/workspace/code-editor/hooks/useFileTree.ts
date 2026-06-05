import { useCallback, useEffect, useState } from 'react';
import type { FileNode } from '../dgig-globals';
import { initTaskRoot, languageFromPath, readDir } from '../ipc/fileSystem';

export function useFileTree(taskId: string, onOpenFile: (path: string, language: string) => void) {
  const [taskRootDir, setTaskRootDir] = useState('');
  const [cwd, setCwd] = useState('.');
  const [nodes, setNodes] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!taskId) return;
    setLoading(true);
    setError('');
    try {
      const root = await initTaskRoot(taskId);
      setTaskRootDir(root);
      const list = await readDir(cwd, taskId);
      setNodes(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  }, [taskId, cwd]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const openNode = useCallback(
    (node: FileNode) => {
      if (node.isDirectory) {
        setCwd(node.path);
        return;
      }
      onOpenFile(node.path, languageFromPath(node.path));
    },
    [onOpenFile],
  );

  const goUp = useCallback(() => {
    if (cwd === '.' || cwd === '') return;
    const parts = cwd.replace(/\\/g, '/').split('/');
    parts.pop();
    setCwd(parts.length ? parts.join('/') : '.');
  }, [cwd]);

  return {
    taskRootDir,
    cwd,
    nodes,
    loading,
    error,
    refresh,
    openNode,
    goUp,
    setCwd,
  };
}
