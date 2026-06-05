import type { GitBranchInfo } from '../types';

export function GitBranchBar({
  branches,
  onCheckout,
  onNewBranch,
}: {
  branches: GitBranchInfo | null;
  onCheckout: (branch: string) => void;
  onNewBranch: (name: string) => void;
}) {
  const current = branches?.current ?? 'main';
  const all = branches?.all ?? [current];

  return (
    <div className="git-branch-bar">
      <label className="git-branch-label">
        Branch
        <select
          value={current}
          onChange={(e) => onCheckout(e.target.value)}
          className="git-branch-select"
        >
          {all.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="git-btn git-btn--ghost"
        onClick={() => {
          const name = window.prompt('New branch name', 'feature/');
          if (name?.trim()) onNewBranch(name.trim());
        }}
      >
        + New Branch
      </button>
    </div>
  );
}
