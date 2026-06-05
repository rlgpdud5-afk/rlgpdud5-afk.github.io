import { DiffEditor } from '@monaco-editor/react';
import { useI18n } from '../../../../context/I18nContext';
import type { GitFilePair } from '../types';

export function GitDiffViewer({
  filePath,
  pair,
  loading,
}: {
  filePath: string | null;
  pair: GitFilePair | null;
  loading: boolean;
}) {
  const { t } = useI18n();

  if (!filePath) {
    return (
      <div className="git-diff-empty">
        <p>{t('workspace.gitSelectFile')}</p>
      </div>
    );
  }

  if (loading) {
    return <div className="git-diff-empty">Loading diff…</div>;
  }

  if (!pair) {
    return <div className="git-diff-empty">Diff unavailable</div>;
  }

  const lang = filePath.endsWith('.ts') || filePath.endsWith('.tsx') ? 'typescript' : 'plaintext';

  return (
    <div className="git-diff-viewer">
      <div className="git-diff-title">{filePath}</div>
      <div className="git-diff-editor-wrap">
      <DiffEditor
        height="100%"
        language={lang}
        original={pair.original}
        modified={pair.modified}
        theme="vs-dark"
        options={{
          readOnly: true,
          renderSideBySide: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
      </div>
    </div>
  );
}
