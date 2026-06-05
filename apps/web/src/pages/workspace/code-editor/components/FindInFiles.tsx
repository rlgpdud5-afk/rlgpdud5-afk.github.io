import type { FindMatch } from '../hooks/useFindInFiles';

export function FindInFiles({
  open,
  query,
  onQueryChange,
  results,
  searching,
  onClose,
  onOpenMatch,
}: {
  open: boolean;
  query: string;
  onQueryChange: (q: string) => void;
  results: FindMatch[];
  searching: boolean;
  onClose: () => void;
  onOpenMatch: (match: FindMatch) => void;
}) {
  if (!open) return null;

  return (
    <div className="ce-find-panel">
      <div className="ce-find-head">
        <span>Find in Files</span>
        <button type="button" className="ce-tree-btn" onClick={onClose}>
          ✕
        </button>
      </div>
      <input
        className="ce-find-input"
        placeholder="검색…"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        autoFocus
      />
      <ul className="ce-find-list">
        {searching && <li className="ce-find-msg">검색 중…</li>}
        {!searching && results.length === 0 && query && (
          <li className="ce-find-msg">결과 없음</li>
        )}
        {results.map((r, i) => (
          <li key={`${r.path}-${r.line}-${i}`}>
            <button type="button" className="ce-find-item" onClick={() => onOpenMatch(r)}>
              <span className="ce-find-path">
                {r.path}:{r.line}
              </span>
              <span className="ce-find-preview">{r.preview}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
