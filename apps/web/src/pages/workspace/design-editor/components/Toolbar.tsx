import type { Editor } from 'tldraw';
import type { DesignTool } from '../types/design';
import { applyTool } from '../utils/tldrawHelpers';

const TOOLS: { id: DesignTool; label: string }[] = [
  { id: 'select', label: 'S' },
  { id: 'rect', label: 'R' },
  { id: 'ellipse', label: 'E' },
  { id: 'text', label: 'T' },
  { id: 'image', label: 'I' },
];

export function Toolbar({
  editor,
  activeTool,
  zoom,
  onPickImage,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onExportPng,
  onExportCss,
  onOpenFile,
}: {
  editor: Editor | null;
  activeTool: DesignTool;
  zoom: number;
  onPickImage: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onExportPng: () => void;
  onExportCss: () => void;
  onOpenFile: () => void;
}) {
  const setTool = (t: DesignTool) => {
    if (!editor) return;
    if (t === 'image') {
      onPickImage();
      return;
    }
    applyTool(editor, t);
  };

  return (
    <div className="de-toolbar">
      <div className="de-toolbar-tools">
        {TOOLS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={'de-tool-btn' + (activeTool === id ? ' on' : '')}
            disabled={!editor}
            onClick={() => setTool(id)}
            title={id}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="de-toolbar-actions">
        <button type="button" className="de-action-btn" disabled={!editor} onClick={onOpenFile}>
          Open
        </button>
        <button type="button" className="de-action-btn" disabled={!editor} onClick={onExportPng}>
          Export PNG
        </button>
        <button type="button" className="de-action-btn" disabled={!editor} onClick={onExportCss}>
          Export CSS
        </button>
        <button type="button" className="de-action-btn" disabled={!editor} onClick={onZoomOut}>
          −
        </button>
        <span className="de-zoom-label">{Math.round(zoom * 100)}%</span>
        <button type="button" className="de-action-btn" disabled={!editor} onClick={onZoomIn}>
          +
        </button>
        <button type="button" className="de-action-btn" disabled={!editor} onClick={onZoomReset}>
          100%
        </button>
      </div>
    </div>
  );
}
