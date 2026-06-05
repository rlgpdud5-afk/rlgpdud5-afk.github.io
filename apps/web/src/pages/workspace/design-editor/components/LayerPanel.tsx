import { useState } from 'react';
import type { Editor, TLShape, TLShapeId } from 'tldraw';
import {
  setShapeHidden,
  setShapeMetaName,
  shapeDisplayName,
  shapeTypeLabel,
} from '../utils/tldrawHelpers';

export function LayerPanel({
  editor,
  shapes,
  selectedIds,
}: {
  editor: Editor | null;
  shapes: TLShape[];
  selectedIds: TLShapeId[];
}) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [renameId, setRenameId] = useState<TLShapeId | null>(null);
  const list = [...shapes].reverse();

  const select = (id: TLShapeId, additive: boolean) => {
    if (!editor) return;
    if (additive) {
      const current = editor.getSelectedShapeIds();
      if (current.includes(id)) editor.deselect(id);
      else editor.select(...current, id);
    } else {
      editor.select(id);
    }
  };

  return (
    <aside className="de-layer-panel">
      <div className="de-panel-head">Layers</div>
      <ul className="de-layer-list">
        {list.map((shape, visIdx) => {
          const idx = shapes.length - 1 - visIdx;
          const selected = selectedIds.includes(shape.id);
          const meta = shape.meta as { hidden?: boolean };
          const name = shapeDisplayName(shape);
          const hidden = !!meta.hidden;

          return (
            <li
              key={shape.id}
              className={'de-layer-item' + (selected ? ' on' : '')}
              draggable={!!editor}
              onDragStart={() => setDragIdx(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (!editor || dragIdx === null || dragIdx === idx) return;
                const target = shapes[idx];
                const source = shapes[dragIdx];
                if (dragIdx < idx) editor.bringToFront([source.id]);
                else editor.sendToBack([source.id]);
                void target;
                setDragIdx(null);
              }}
              onClick={(e) => select(shape.id, e.shiftKey)}
              onContextMenu={(e) => {
                e.preventDefault();
                if (!editor) return;
                if (window.confirm(`"${name}" 삭제할까요?`)) {
                  editor.deleteShapes([shape.id]);
                }
              }}
            >
              <button
                type="button"
                className="de-layer-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  if (editor) setShapeHidden(editor, shape.id, !hidden);
                }}
                title="Visibility"
              >
                {!hidden ? '👁' : '—'}
              </button>
              <button
                type="button"
                className="de-layer-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!editor) return;
                  editor.updateShape({ id: shape.id, type: shape.type, isLocked: !shape.isLocked });
                }}
                title="Lock"
              >
                {shape.isLocked ? '🔒' : '○'}
              </button>
              <span className="de-layer-type" title={shape.type}>
                {shapeTypeLabel(shape).slice(0, 1).toUpperCase()}
              </span>
              {renameId === shape.id ? (
                <input
                  className="de-layer-rename"
                  defaultValue={name}
                  autoFocus
                  onBlur={(e) => {
                    if (editor) setShapeMetaName(editor, shape.id, e.target.value.trim() || name);
                    setRenameId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span
                  className="de-layer-name"
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setRenameId(shape.id);
                  }}
                >
                  {name}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
