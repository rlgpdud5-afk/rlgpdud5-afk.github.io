import { useEffect, useMemo, useState } from 'react';
import type { Editor, TLShape, TLShapeId } from 'tldraw';

export function useLayerSync(editor: Editor | null) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!editor) return;
    const unsub = editor.store.listen(() => setTick((n) => n + 1));
    return unsub;
  }, [editor]);

  const shapes = useMemo<TLShape[]>(() => {
    if (!editor) return [];
    return editor.getCurrentPageShapes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, tick]);

  const selectedIds = useMemo<TLShapeId[]>(() => {
    if (!editor) return [];
    return editor.getSelectedShapeIds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, tick]);

  const zoom = useMemo(() => {
    if (!editor) return 1;
    return editor.getZoomLevel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, tick]);

  const currentTool = useMemo(() => {
    if (!editor) return 'select';
    return editor.getCurrentToolId();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, tick]);

  return { shapes, selectedIds, zoom, currentTool };
}
