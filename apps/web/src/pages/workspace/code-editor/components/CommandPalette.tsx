import { useEffect, useMemo, useRef, useState } from 'react';

export type PaletteCommand = {
  id: string;
  label: string;
  run: () => void;
};

export function CommandPalette({
  open,
  commands,
  onClose,
}: {
  open: boolean;
  commands: PaletteCommand[];
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    setIndex(0);
  }, [query]);

  if (!open) return null;

  const run = (cmd: PaletteCommand) => {
    cmd.run();
    onClose();
  };

  return (
    <div className="ce-palette-overlay" onClick={onClose}>
      <div className="ce-palette" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="ce-palette-input"
          placeholder="명령 검색…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              onClose();
            } else if (e.key === 'ArrowDown') {
              e.preventDefault();
              setIndex((i) => Math.min(i + 1, filtered.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setIndex((i) => Math.max(i - 1, 0));
            } else if (e.key === 'Enter' && filtered[index]) {
              e.preventDefault();
              run(filtered[index]);
            }
          }}
        />
        <ul className="ce-palette-list">
          {filtered.map((cmd, i) => (
            <li key={cmd.id}>
              <button
                type="button"
                className={'ce-palette-item' + (i === index ? ' on' : '')}
                onMouseEnter={() => setIndex(i)}
                onClick={() => run(cmd)}
              >
                {cmd.label}
              </button>
            </li>
          ))}
          {filtered.length === 0 && <li className="ce-palette-empty">일치하는 명령 없음</li>}
        </ul>
      </div>
    </div>
  );
}
