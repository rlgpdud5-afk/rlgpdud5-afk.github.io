import { useTerminal } from '../hooks/useTerminal';

export function Terminal({
  open,
  taskRootDir,
  onToggle,
}: {
  open: boolean;
  taskRootDir: string;
  onToggle: () => void;
}) {
  const { containerRef } = useTerminal(taskRootDir, open);

  return (
    <div className={'ce-terminal-panel' + (open ? ' open' : '')}>
      <div className="ce-terminal-bar">
        <span>Terminal</span>
        <button type="button" className="ce-terminal-toggle" onClick={onToggle}>
          {open ? '▼' : '▲'} Ctrl+`
        </button>
      </div>
      {open && <div className="ce-terminal-body" ref={containerRef} />}
    </div>
  );
}
