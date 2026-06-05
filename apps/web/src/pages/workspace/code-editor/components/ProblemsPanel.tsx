import type { ProblemItem } from '../hooks/useProblems';

export function ProblemsPanel({
  open,
  problems,
  onClose,
  onOpen,
}: {
  open: boolean;
  problems: ProblemItem[];
  onClose: () => void;
  onOpen: (item: ProblemItem) => void;
}) {
  if (!open) return null;

  const errors = problems.filter((p) => p.severity === 'error').length;
  const warnings = problems.filter((p) => p.severity === 'warning').length;

  return (
    <div className="ce-problems-panel">
      <div className="ce-problems-head">
        <span>
          Problems {errors > 0 && `(${errors} errors`}
          {warnings > 0 && `${errors > 0 ? ', ' : '('}${warnings} warnings`}
          {(errors > 0 || warnings > 0) && ')'}
        </span>
        <button type="button" className="ce-tree-btn" onClick={onClose}>
          ✕
        </button>
      </div>
      <ul className="ce-problems-list">
        {problems.length === 0 && <li className="ce-find-msg">문제 없음</li>}
        {problems.map((p, i) => (
          <li key={`${p.path}-${p.line}-${i}`}>
            <button type="button" className="ce-problems-item" onClick={() => onOpen(p)}>
              <span className={'ce-problems-icon ' + p.severity}>
                {p.severity === 'error' ? '✕' : '⚠'}
              </span>
              <span className="ce-problems-msg">{p.message}</span>
              <span className="ce-problems-loc">
                {p.path}:{p.line}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
