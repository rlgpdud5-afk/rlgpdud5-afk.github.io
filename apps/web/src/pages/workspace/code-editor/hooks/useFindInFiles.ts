import { useCallback, useEffect, useState } from 'react';
import { listAllFiles, readFile } from '../ipc/fileSystem';

export type FindMatch = {
  path: string;
  line: number;
  preview: string;
};

export function useFindInFiles(taskId: string, query: string, enabled: boolean) {
  const [results, setResults] = useState<FindMatch[]>([]);
  const [searching, setSearching] = useState(false);

  const search = useCallback(async () => {
    const q = query.trim();
    if (!q || !enabled) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const files = await listAllFiles(taskId);
      const matches: FindMatch[] = [];
      const lower = q.toLowerCase();

      for (const path of files) {
        if (path.endsWith('.keep')) continue;
        try {
          const content = await readFile(path, taskId);
          const lines = content.split(/\r?\n/);
          lines.forEach((line, i) => {
            if (line.toLowerCase().includes(lower)) {
              matches.push({
                path,
                line: i + 1,
                preview: line.trim().slice(0, 120),
              });
            }
          });
        } catch {
          /* skip unreadable */
        }
        if (matches.length >= 200) break;
      }
      setResults(matches);
    } finally {
      setSearching(false);
    }
  }, [enabled, query, taskId]);

  useEffect(() => {
    const t = setTimeout(() => void search(), 300);
    return () => clearTimeout(t);
  }, [search]);

  return { results, searching };
}
