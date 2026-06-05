import { useEffect, useState } from 'react';
import * as monaco from 'monaco-editor';

export type ProblemItem = {
  path: string;
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
};

export function useProblems(open: boolean, refreshKey: number) {
  const [problems, setProblems] = useState<ProblemItem[]>([]);

  useEffect(() => {
    if (!open) return;
    const markers = monaco.editor.getModelMarkers({});
    const items: ProblemItem[] = markers.map((m) => ({
      path: m.resource.path.replace(/^file:\/\//, '').replace(/^\//, ''),
      line: m.startLineNumber,
      column: m.startColumn,
      message: m.message,
      severity:
        m.severity === monaco.MarkerSeverity.Error
          ? 'error'
          : m.severity === monaco.MarkerSeverity.Warning
            ? 'warning'
            : 'info',
    }));
    setProblems(items);
  }, [open, refreshKey]);

  return problems;
}
