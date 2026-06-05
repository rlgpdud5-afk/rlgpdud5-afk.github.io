import type { EditorPane } from '../hooks/useEditorTabs';
import type { EditorTab } from '../hooks/useEditorTabs';

export function EditorTabs({
  tabs,
  activeTabId,
  isDirty,
  onSelect,
  onClose,
  onNew,
  onDragToPane,
}: {
  tabs: EditorTab[];
  activeTabId: string | null;
  isDirty: (tab: EditorTab) => boolean;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onNew: () => void;
  onDragToPane?: (tabId: string, pane: EditorPane) => void;
}) {
  return (
    <div className="ce-tabs">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={'ce-tab' + (tab.id === activeTabId ? ' on' : '')}
          draggable={!!onDragToPane}
          onDragStart={(e) => {
            e.dataTransfer.setData('text/ce-tab-id', tab.id);
            e.dataTransfer.effectAllowed = 'move';
          }}
          onClick={() => onSelect(tab.id)}
          role="tab"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onSelect(tab.id)}
        >
          <span className="ce-tab-label">
            {isDirty(tab) ? '• ' : ''}
            {tab.name}
          </span>
          <button
            type="button"
            className="ce-tab-close"
            aria-label={`Close ${tab.name}`}
            onClick={(e) => {
              e.stopPropagation();
              onClose(tab.id);
            }}
          >
            ×
          </button>
        </div>
      ))}
      <button type="button" className="ce-tab-add" onClick={onNew} aria-label="New file">
        +
      </button>
    </div>
  );
}
