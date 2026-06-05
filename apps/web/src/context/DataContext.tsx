import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { store } from '../lib/store';
import type { MatchDb, StorageMode } from '../lib/types';

interface DataState {
  db: MatchDb | null;
  storageMode: StorageMode;
  loading: boolean;
  refresh: () => Promise<MatchDb>;
  reset: () => Promise<void>;
}

const DataContext = createContext<DataState | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<MatchDb | null>(null);
  const [storageMode, setStorageMode] = useState<StorageMode>('local');
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await store.load();
    setDb(data);
    return data;
  }, []);

  useEffect(() => {
    (async () => {
      const mode = await store.init();
      setStorageMode(mode);
      await refresh();
      setLoading(false);
    })();
    const unsub = store.subscribe(() => {
      void refresh();
    });
    return () => {
      unsub();
    };
  }, [refresh]);

  const reset = useCallback(async () => {
    const data = await store.reset();
    setDb(data);
  }, []);

  const value = useMemo(
    () => ({ db, storageMode, loading, refresh, reset }),
    [db, storageMode, loading, refresh, reset],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
