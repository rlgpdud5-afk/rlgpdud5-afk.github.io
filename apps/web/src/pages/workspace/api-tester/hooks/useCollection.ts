import { useCallback, useEffect, useState } from 'react';
import { initTaskRoot, readFile, writeFile } from '../../code-editor/ipc/fileSystem';
import {
  COLLECTION_PATH,
  defaultCollection,
  newRequestId,
  type ApiCollectionFile,
  type ApiRequestItem,
} from '../types';

const VFS_KEY = 'dgig-api-collection';

function vfsKey(taskId: string) {
  return `${VFS_KEY}-${taskId}`;
}

export function useCollection(taskId: string) {
  const [collection, setCollection] = useState<ApiCollectionFile>(() => defaultCollection());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      await initTaskRoot(taskId);
      const raw = await readFile(COLLECTION_PATH, taskId);
      const parsed = JSON.parse(raw) as ApiCollectionFile;
      if (parsed.requests?.length) {
        setCollection(parsed);
        setActiveId(parsed.requests[0].id);
      }
      setDirty(false);
    } catch {
      if (!window.dgigFs) {
        try {
          const cached = localStorage.getItem(vfsKey(taskId));
          if (cached) {
            const parsed = JSON.parse(cached) as ApiCollectionFile;
            setCollection(parsed);
            setActiveId(parsed.requests[0]?.id ?? null);
          }
        } catch {
          /* ignore */
        }
      }
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(async () => {
    const json = JSON.stringify(collection, null, 2);
    if (window.dgigFs) {
      await initTaskRoot(taskId);
      await writeFile(COLLECTION_PATH, json, taskId);
    } else {
      localStorage.setItem(vfsKey(taskId), json);
    }
    setDirty(false);
  }, [collection, taskId]);

  const updateCollection = useCallback((next: ApiCollectionFile) => {
    setCollection(next);
    setDirty(true);
  }, []);

  const activeRequest =
    collection.requests.find((r) => r.id === activeId) ?? collection.requests[0] ?? null;

  const updateActive = useCallback(
    (patch: Partial<ApiRequestItem>) => {
      if (!activeRequest) return;
      updateCollection({
        ...collection,
        requests: collection.requests.map((r) =>
          r.id === activeRequest.id ? { ...r, ...patch } : r,
        ),
      });
    },
    [activeRequest, collection, updateCollection],
  );

  const addRequest = useCallback(() => {
    const item: ApiRequestItem = {
      id: newRequestId(),
      name: 'New request',
      method: 'GET',
      url: '',
      headers: {},
      body: null,
    };
    updateCollection({
      ...collection,
      requests: [...collection.requests, item],
    });
    setActiveId(item.id);
  }, [collection, updateCollection]);

  const removeRequest = useCallback(
    (id: string) => {
      const next = collection.requests.filter((r) => r.id !== id);
      updateCollection({ ...collection, requests: next.length ? next : defaultCollection().requests });
      if (activeId === id) setActiveId(next[0]?.id ?? null);
    },
    [activeId, collection, updateCollection],
  );

  const importCollection = useCallback(
    (file: ApiCollectionFile) => {
      updateCollection(file);
      setActiveId(file.requests[0]?.id ?? null);
    },
    [updateCollection],
  );

  return {
    collection,
    activeRequest,
    activeId,
    setActiveId,
    loading,
    dirty,
    load,
    save,
    updateActive,
    addRequest,
    removeRequest,
    importCollection,
    setCollectionName: (name: string) => updateCollection({ ...collection, name }),
  };
}
