import { useCallback, useState } from 'react';
import { fileNameFromPath, readFile } from '../ipc/fileSystem';

export type EditorTab = {
  id: string;
  path: string;
  name: string;
  content: string;
  savedContent: string;
  language: string;
};

export type EditorPane = 'left' | 'right';

const MAX_TABS = 10;

export function useEditorTabs(taskId: string) {
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [splitMode, setSplitMode] = useState(false);
  const [leftTabId, setLeftTabId] = useState<string | null>(null);
  const [rightTabId, setRightTabId] = useState<string | null>(null);
  const [focusPane, setFocusPane] = useState<EditorPane>('left');

  const openFile = useCallback(
    async (filePath: string, language: string, pane?: EditorPane) => {
      const hit = tabs.find((t) => t.path === filePath);
      if (hit) {
        const targetPane = pane ?? focusPane;
        if (splitMode) {
          if (targetPane === 'right') setRightTabId(hit.id);
          else setLeftTabId(hit.id);
        }
        setActiveTabId(hit.id);
        setFocusPane(targetPane);
        return hit;
      }

      const content = await readFile(filePath, taskId);
      const tab: EditorTab = {
        id: `tab-${filePath}`,
        path: filePath,
        name: fileNameFromPath(filePath),
        content,
        savedContent: content,
        language,
      };

      setTabs((prev) => {
        const existing = prev.find((t) => t.path === filePath);
        if (existing) return prev;
        let next = [...prev, tab];
        if (next.length > MAX_TABS) {
          const drop = next.find((t) => t.content === t.savedContent) || next[0];
          next = next.filter((t) => t.id !== drop.id);
        }
        return next;
      });

      const targetPane = pane ?? focusPane;
      if (splitMode) {
        if (targetPane === 'right') setRightTabId(tab.id);
        else setLeftTabId(tab.id);
      }
      setActiveTabId(tab.id);
      setFocusPane(targetPane);
      return tab;
    },
    [focusPane, splitMode, tabs, taskId],
  );

  const selectTab = useCallback(
    (tabId: string) => {
      setActiveTabId(tabId);
      if (splitMode) {
        if (focusPane === 'right') setRightTabId(tabId);
        else setLeftTabId(tabId);
      }
    },
    [focusPane, splitMode],
  );

  const assignTabToPane = useCallback((tabId: string, pane: EditorPane) => {
    setSplitMode(true);
    if (pane === 'right') setRightTabId(tabId);
    else setLeftTabId(tabId);
    setActiveTabId(tabId);
    setFocusPane(pane);
  }, []);

  const toggleSplit = useCallback(() => {
    setSplitMode((on) => {
      if (!on) {
        setLeftTabId(activeTabId);
        setRightTabId(activeTabId);
        return true;
      }
      const pick = focusPane === 'right' ? rightTabId : leftTabId;
      setActiveTabId(pick ?? activeTabId);
      return false;
    });
  }, [activeTabId, focusPane, leftTabId, rightTabId]);

  const closeTab = useCallback(
    (tabId: string, force = false): 'ok' | 'cancel' => {
      const tab = tabs.find((t) => t.id === tabId);
      if (!tab) return 'ok';
      if (!force && tab.content !== tab.savedContent) {
        const ok = window.confirm(`"${tab.name}"에 저장되지 않은 변경이 있습니다. 닫을까요?`);
        if (!ok) return 'cancel';
      }
      setTabs((prev) => {
        const next = prev.filter((t) => t.id !== tabId);
        const fallback = next[next.length - 1]?.id ?? null;
        setLeftTabId((l) => (l === tabId ? fallback : l));
        setRightTabId((r) => (r === tabId ? fallback : r));
        if (activeTabId === tabId) setActiveTabId(fallback);
        return next;
      });
      return 'ok';
    },
    [tabs, activeTabId],
  );

  const closeAllTabs = useCallback((force = false): 'ok' | 'cancel' => {
    for (const tab of tabs) {
      if (!force && tab.content !== tab.savedContent) {
        const ok = window.confirm('저장되지 않은 탭이 있습니다. 모두 닫을까요?');
        if (!ok) return 'cancel';
        break;
      }
    }
    setTabs([]);
    setActiveTabId(null);
    setLeftTabId(null);
    setRightTabId(null);
    return 'ok';
  }, [tabs]);

  const closeActiveTab = useCallback(
    (force = false) => {
      if (!activeTabId) return 'ok';
      return closeTab(activeTabId, force);
    },
    [activeTabId, closeTab],
  );

  const updateContent = useCallback((tabId: string, content: string) => {
    setTabs((prev) => prev.map((t) => (t.id === tabId ? { ...t, content } : t)));
  }, []);

  const markSaved = useCallback((tabId: string, content: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === tabId ? { ...t, content, savedContent: content } : t)),
    );
  }, []);

  const leftTab = tabs.find((t) => t.id === (splitMode ? leftTabId : activeTabId)) ?? null;
  const rightTab = tabs.find((t) => t.id === rightTabId) ?? null;
  const activeTab = tabs.find((t) => t.id === activeTabId) ?? leftTab;

  const isDirty = (tab: EditorTab) => tab.content !== tab.savedContent;

  return {
    tabs,
    activeTab,
    activeTabId,
    leftTab,
    rightTab,
    splitMode,
    focusPane,
    setFocusPane,
    setActiveTabId: selectTab,
    openFile,
    assignTabToPane,
    toggleSplit,
    closeTab,
    closeAllTabs,
    closeActiveTab,
    updateContent,
    markSaved,
    isDirty,
  };
};
