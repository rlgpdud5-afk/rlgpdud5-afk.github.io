import type { GitFileEntry } from '../types';

export function GitStatusList({
  files,
  selectedPath,
  onSelect,
  onStage,
  onUnstage,
  onStageAll,
}: {
  files: GitFileEntry[];
  selectedPath: string | null;
  onSelect: (path: string) => void;
  onStage: (path: string) => void;
  onUnstage: (path: string) => void;
  onStageAll: () => void;
}) {
  const unstaged = files.filter((f) => !f.staged);
  const staged = files.filter((f) => f.staged);

  const renderRow = (f: GitFileEntry) => (
    <li
      key={`${f.path}-${f.staged}`}
      className={'git-file-row' + (selectedPath === f.path ? ' on' : '')}
      onClick={() => onSelect(f.path)}
    >
      <span className={'git-badge git-badge--' + f.badge}>{f.badge}</span>
      <span className="git-file-path">{f.path}</span>
      <span className="git-file-actions">
        {f.staged ? (
          <button
            type="button"
            className="git-btn-mini"
            onClick={(e) => {
              e.stopPropagation();
              onUnstage(f.path);
            }}
          >
            −
          </button>
        ) : (
          <button
            type="button"
            className="git-btn-mini"
            onClick={(e) => {
              e.stopPropagation();
              onStage(f.path);
            }}
          >
            +
          </button>
        )}
      </span>
    </li>
  );

  return (
    <div className="git-status-list">
      <div className="git-status-head">
        <span>Changes</span>
        {unstaged.length > 0 && (
          <button type="button" className="git-btn-mini" onClick={onStageAll}>
            Stage All
          </button>
        )}
      </div>
      {files.length === 0 && <p className="git-muted">Working tree clean</p>}
      {unstaged.length > 0 && (
        <>
          <h4 className="git-section-label">Unstaged</h4>
          <ul className="git-file-list">{unstaged.map(renderRow)}</ul>
        </>
      )}
      {staged.length > 0 && (
        <>
          <h4 className="git-section-label">Staged</h4>
          <ul className="git-file-list">{staged.map(renderRow)}</ul>
        </>
      )}
    </div>
  );
}
