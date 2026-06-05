export function EditorToolbar({
  splitMode,
  minimapOn,
  onToggleSplit,
  onToggleMinimap,
  onHelp,
}: {
  splitMode: boolean;
  minimapOn: boolean;
  onToggleSplit: () => void;
  onToggleMinimap: () => void;
  onHelp?: () => void;
}) {
  return (
    <div className="ce-editor-toolbar">
      <button
        type="button"
        className={'ce-tree-btn' + (splitMode ? ' on' : '')}
        onClick={onToggleSplit}
        title="Split editor (Ctrl+\)"
      >
        ⊟ Split
      </button>
      <button
        type="button"
        className={'ce-tree-btn' + (minimapOn ? ' on' : '')}
        onClick={onToggleMinimap}
        title="Toggle minimap"
      >
        ⊡ Minimap
      </button>
      {onHelp && (
        <button type="button" className="ce-tree-btn" onClick={onHelp} title="Editor shortcuts">
          ?
        </button>
      )}
    </div>
  );
}
