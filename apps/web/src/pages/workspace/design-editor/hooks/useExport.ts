import { useCallback } from 'react';
import type { Editor } from 'tldraw';
import { initTaskRoot, writeFile } from '../../code-editor/ipc/fileSystem';
import { shapesToCss } from '../utils/cssExport';

export function useExport(editor: Editor | null, taskId: string, onToast: (m: string) => void) {
  const exportPng = useCallback(async () => {
    if (!editor) return;
    try {
      const ids = [...editor.getCurrentPageShapeIds()];
      const { blob } = await editor.toImage(ids, {
        format: 'png',
        background: true,
        padding: 16,
        scale: 2,
      });
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
      const path = `designs/export-${Date.now()}.png`;
      if (window.dgigFs) {
        await initTaskRoot(taskId);
        await writeFile(path, dataUrl, taskId);
      } else {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'export.png';
        a.click();
      }
      onToast('PNG exported');
    } catch (e) {
      onToast(e instanceof Error ? e.message : 'PNG export failed');
    }
  }, [editor, onToast, taskId]);

  const exportCss = useCallback(async () => {
    if (!editor) return;
    try {
      const css = shapesToCss(editor);
      const path = `designs/export-${Date.now()}.css`;
      if (window.dgigFs) {
        await initTaskRoot(taskId);
        await writeFile(path, css, taskId);
      } else {
        const blob = new Blob([css], { type: 'text/css' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'export.css';
        a.click();
      }
      onToast('CSS exported');
    } catch (e) {
      onToast(e instanceof Error ? e.message : 'CSS export failed');
    }
  }, [editor, onToast, taskId]);

  return { exportPng, exportCss };
}
