import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Tldraw, getSnapshot, loadSnapshot, type Editor, type TLShape } from 'tldraw';
import 'tldraw/tldraw.css';
import { initTaskRoot, readFile, writeFile } from '../code-editor/ipc/fileSystem';
import { Toolbar } from './components/Toolbar';
import { LayerPanel } from './components/LayerPanel';
import { PropertiesPanel } from './components/PropertiesPanel';
import { useExport } from './hooks/useExport';
import { useLayerSync } from './hooks/useLayerSync';
import {
  DEFAULT_CANVAS,
  type DesignTool,
  type DgigDesignFile,
  type LayerMeta,
} from './types/design';
import { applyTool, insertLocalImage, migrateLegacyElements } from './utils/tldrawHelpers';
import './design-editor.css';

const DESIGN_FILE = 'designs/canvas.dgig';

export type DesignEditorHandle = {
  save: () => Promise<boolean>;
};

function mapToolId(id: string): DesignTool {
  if (id === 'text') return 'text';
  if (id === 'media' || id === 'image') return 'image';
  if (id === 'geo') return 'rect';
  return 'select';
}

export const DesignEditorPage = forwardRef<
  DesignEditorHandle,
  { taskId: string; onToast: (msg: string) => void }
>(function DesignEditorPage({ taskId, onToast }, ref) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [activeTool, setActiveTool] = useState<DesignTool>('select');
  const editorRef = useRef<Editor | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const loadedTaskRef = useRef<string | null>(null);

  const { shapes, selectedIds, zoom, currentTool } = useLayerSync(editor);
  const { exportPng, exportCss } = useExport(editor, taskId, onToast);

  const selectedShape = useMemo<TLShape | null>(() => {
    if (!editor || selectedIds.length !== 1) return null;
    return editor.getShape(selectedIds[0]) ?? null;
  }, [editor, selectedIds]);

  useEffect(() => {
    setActiveTool(mapToolId(currentTool));
  }, [currentTool]);

  const buildFile = useCallback((): DgigDesignFile => {
    const snap = editor ? getSnapshot(editor.store) : undefined;
    return {
      version: '2.0',
      meta: { createdAt: new Date().toISOString(), taskId },
      canvas: DEFAULT_CANVAS,
      tldrawSnapshot: snap as DgigDesignFile['tldrawSnapshot'],
    };
  }, [editor, taskId]);

  const save = useCallback(async () => {
    if (!editor) {
      onToast('Editor not ready');
      return false;
    }
    try {
      await initTaskRoot(taskId);
      await writeFile(DESIGN_FILE, JSON.stringify(buildFile(), null, 2), taskId);
      onToast('Design saved (.dgig)');
      return true;
    } catch (e) {
      onToast(e instanceof Error ? e.message : 'Save failed');
      return false;
    }
  }, [buildFile, editor, onToast, taskId]);

  const load = useCallback(
    async (ed: Editor) => {
      try {
        await initTaskRoot(taskId);
        const raw = await readFile(DESIGN_FILE, taskId);
        const parsed = JSON.parse(raw) as DgigDesignFile;
        if (parsed.tldrawSnapshot) {
          loadSnapshot(ed.store, parsed.tldrawSnapshot);
          onToast('Design loaded');
        } else if (parsed.elements?.length) {
          migrateLegacyElements(ed, parsed.elements);
          onToast('Legacy design imported (Konva → tldraw)');
        }
      } catch {
        onToast('No saved design — new canvas');
      }
    },
    [onToast, taskId],
  );

  const handleMount = useCallback(
    (ed: Editor) => {
      editorRef.current = ed;
      setEditor(ed);
      if (loadedTaskRef.current !== taskId) {
        loadedTaskRef.current = taskId;
        void load(ed);
      }
    },
    [load, taskId],
  );

  useEffect(() => {
    loadedTaskRef.current = null;
    if (editorRef.current) void load(editorRef.current);
  }, [taskId, load]);

  useImperativeHandle(ref, () => ({ save }), [save]);

  const onPickImage = useCallback(() => {
    imageInputRef.current?.click();
  }, []);

  const onImageFile = useCallback(
    async (file: File) => {
      if (!editor) return;
      await insertLocalImage(editor, file);
      setActiveTool('image');
    },
    [editor],
  );

  const getShapeVisibility = useCallback((shape: TLShape) => {
    const hidden = (shape.meta as LayerMeta)?.hidden;
    return hidden ? ('hidden' as const) : ('inherit' as const);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!editor) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const mod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (!mod && key === 's') {
        e.preventDefault();
        applyTool(editor, 'select');
        setActiveTool('select');
        return;
      }
      if (!mod && key === 'r') {
        e.preventDefault();
        applyTool(editor, 'rect');
        setActiveTool('rect');
        return;
      }
      if (!mod && key === 'e') {
        e.preventDefault();
        applyTool(editor, 'ellipse');
        setActiveTool('ellipse');
        return;
      }
      if (!mod && key === 't') {
        e.preventDefault();
        applyTool(editor, 'text');
        setActiveTool('text');
        return;
      }
      if (!mod && key === 'i') {
        e.preventDefault();
        onPickImage();
        return;
      }
      if (mod && key === 's') {
        e.preventDefault();
        void save();
        return;
      }
      if (mod && key === '0') {
        e.preventDefault();
        editor.resetZoom();
        return;
      }
      if (e.key === 'Escape') {
        applyTool(editor, 'select');
        setActiveTool('select');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [editor, onPickImage, save]);

  return (
    <div className="de-root">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="de-hidden-input"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void onImageFile(file);
          e.target.value = '';
        }}
      />
      <Toolbar
        editor={editor}
        activeTool={activeTool}
        zoom={zoom}
        onPickImage={onPickImage}
        onZoomIn={() => editor?.zoomIn()}
        onZoomOut={() => editor?.zoomOut()}
        onZoomReset={() => editor?.resetZoom()}
        onExportPng={() => void exportPng()}
        onExportCss={() => void exportCss()}
        onOpenFile={() => editor && void load(editor)}
      />
      <div className="de-body">
        <LayerPanel editor={editor} shapes={shapes} selectedIds={selectedIds} />
        <div className="de-canvas-wrap de-tldraw-host">
          <Tldraw hideUi onMount={handleMount} getShapeVisibility={getShapeVisibility} />
        </div>
        <PropertiesPanel editor={editor} shape={selectedShape} />
      </div>
    </div>
  );
});
