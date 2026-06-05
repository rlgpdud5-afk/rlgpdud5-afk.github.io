import type { ApiCollectionFile, ApiRequestItem } from '../types';

export function CollectionPanel({
  collection,
  activeId,
  onSelect,
  onNew,
  onSave,
  onOpen,
  onDelete,
  dirty,
}: {
  collection: ApiCollectionFile;
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onSave: () => void;
  onOpen: () => void;
  onDelete: (id: string) => void;
  dirty: boolean;
}) {
  return (
    <aside className="api-collection">
      <div className="api-collection-head">
        <span className="api-collection-title">{collection.name}{dirty ? ' •' : ''}</span>
      </div>
      <div className="api-collection-actions">
        <button type="button" className="api-btn api-btn--ghost" onClick={onNew}>
          + New Request
        </button>
        <button type="button" className="api-btn api-btn--ghost" onClick={onSave}>
          Save Collection
        </button>
        <button type="button" className="api-btn api-btn--ghost" onClick={onOpen}>
          Open Collection
        </button>
      </div>
      <ul className="api-collection-list">
        {collection.requests.map((r: ApiRequestItem) => (
          <li key={r.id}>
            <button
              type="button"
              className={'api-collection-item' + (r.id === activeId ? ' on' : '')}
              onClick={() => onSelect(r.id)}
            >
              <span className={'api-method api-method--' + r.method.toLowerCase()}>{r.method}</span>
              <span className="api-collection-name">{r.name}</span>
            </button>
            <button
              type="button"
              className="api-collection-del"
              title="Delete"
              onClick={() => onDelete(r.id)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
