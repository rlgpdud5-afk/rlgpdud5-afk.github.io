import { useEffect } from 'react';
import type { DesignTool, WorkspaceMode } from '../../lib/workspace/store';

export interface ShortcutActions {
  mode: WorkspaceMode;
  setMode: (m: WorkspaceMode) => void;
  save: () => void;
  openPalette: () => void;
  openQuickOpen: () => void;
  toggleSidebar: () => void;
  toggleTerminal: () => void;
  closeTab: () => void;
  newFile: () => void;
  setDesignTool: (t: DesignTool) => void;
  togglePanels: () => void;
  zoomFit: () => void;
  runAction: () => void;
  toast: (msg: string) => void;
}

function mod(e: KeyboardEvent) {
  return e.ctrlKey || e.metaKey;
}

export function useWorkspaceShortcuts(actions: ShortcutActions) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (mod(e) && e.key === 's') {
        e.preventDefault();
        actions.save();
        return;
      }
      if (mod(e) && e.shiftKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault();
        actions.openPalette();
        return;
      }
      if (mod(e) && !e.shiftKey && (e.key === 'p' || e.key === 'P') && !typing) {
        e.preventDefault();
        actions.openQuickOpen();
        return;
      }
      if (mod(e) && e.key === 'b') {
        e.preventDefault();
        actions.toggleSidebar();
        return;
      }
      if (mod(e) && e.key === '`') {
        e.preventDefault();
        actions.toggleTerminal();
        return;
      }
      if (mod(e) && (e.key === 'w' || e.key === 'W')) {
        e.preventDefault();
        actions.closeTab();
        return;
      }
      if (mod(e) && (e.key === 'n' || e.key === 'N') && !e.shiftKey) {
        e.preventDefault();
        actions.newFile();
        return;
      }
      if (mod(e) && e.key === '\\') {
        e.preventDefault();
        actions.togglePanels();
        return;
      }

      if (mod(e) && e.shiftKey && (e.key === 'E' || e.key === 'e')) {
        e.preventDefault();
        actions.setMode('code');
        return;
      }
      if (mod(e) && e.shiftKey && (e.key === 'G' || e.key === 'g')) {
        e.preventDefault();
        actions.setMode('git');
        return;
      }
      if (mod(e) && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        actions.setMode('debug');
        return;
      }

      if (mod(e) && e.key === 'Enter') {
        if (actions.mode === 'git' || actions.mode === 'api' || actions.mode === 'db') {
          e.preventDefault();
          actions.runAction();
        }
        return;
      }

      if (e.key === 'F5' && actions.mode === 'db') {
        e.preventDefault();
        actions.runAction();
        return;
      }

      if (actions.mode === 'design' && e.shiftKey && e.key === '1' && !typing) {
        e.preventDefault();
        actions.zoomFit();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [actions]);
}
