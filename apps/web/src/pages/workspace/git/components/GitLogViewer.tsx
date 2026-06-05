import type { GitLogEntry } from '../types';

export function GitLogViewer({
  commits,
  selectedHash,
  commitFiles,
  onSelectCommit,
  onSelectCommitFile,
}: {
  commits: GitLogEntry[];
  selectedHash: string | null;
  commitFiles: string[];
  onSelectCommit: (entry: GitLogEntry) => void;
  onSelectCommitFile: (file: string) => void;
}) {
  return (
    <div className="git-log-viewer">
      <h4 className="git-section-label">History</h4>
      <ul className="git-log-list">
        {commits.map((c) => (
          <li key={c.hash}>
            <button
              type="button"
              className={'git-log-item' + (selectedHash === c.hash ? ' on' : '')}
              onClick={() => onSelectCommit(c)}
            >
              <span className="git-log-hash">{c.hashShort}</span>
              <span className="git-log-msg">{c.message}</span>
              <span className="git-log-meta">
                {c.author} · {c.date ? new Date(c.date).toLocaleString() : ''}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {commitFiles.length > 0 && (
        <div className="git-commit-files">
          <h4 className="git-section-label">Commit files</h4>
          <ul className="git-file-list">
            {commitFiles.map((f) => (
              <li key={f}>
                <button type="button" className="git-commit-file-btn" onClick={() => onSelectCommitFile(f)}>
                  {f}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
