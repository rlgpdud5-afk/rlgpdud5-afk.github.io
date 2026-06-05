import { useCallback, useEffect } from 'react';
import { useI18n } from '../../../context/I18nContext';
import { initTaskRoot, writeFile } from '../code-editor/ipc/fileSystem';
import { CollectionPanel } from './components/CollectionPanel';
import { RequestPanel } from './components/RequestPanel';
import { ResponsePanel } from './components/ResponsePanel';
import { useApiRequest } from './hooks/useApiRequest';
import { useCollection } from './hooks/useCollection';
import type { ApiCollectionFile, ApiRequestPayload } from './types';
import { COLLECTION_PATH } from './types';
import './api-tester.css';

export function ApiTesterPage({
  taskId,
  onToast,
}: {
  taskId: string;
  onToast: (msg: string) => void;
}) {
  const { t } = useI18n();
  const {
    collection,
    activeRequest,
    activeId,
    setActiveId,
    dirty,
    save,
    updateActive,
    addRequest,
    removeRequest,
    importCollection,
  } = useCollection(taskId);

  const { electron, loading, lastResponse, send } = useApiRequest();

  const buildPayload = useCallback((): ApiRequestPayload | null => {
    if (!activeRequest?.url.trim()) return null;
    const headers = { ...activeRequest.headers };
    if (activeRequest.authBearer?.trim()) {
      headers.Authorization = `Bearer ${activeRequest.authBearer.trim()}`;
    }
    const method = activeRequest.method;
    const body =
      method === 'GET' || method === 'OPTIONS' ? null : activeRequest.body;
    return {
      method,
      url: activeRequest.url.trim(),
      headers,
      body,
    };
  }, [activeRequest]);

  const handleSend = useCallback(async () => {
    const payload = buildPayload();
    if (!payload) {
      onToast(t('workspace.apiNeedUrl'));
      return;
    }
    try {
      const res = await send(payload);
      onToast(res.status ? `Response ${res.status}` : 'Request failed');
    } catch (e) {
      onToast(e instanceof Error ? e.message : 'Request error');
    }
  }, [buildPayload, onToast, send, t]);

  const handleSaveCollection = useCallback(async () => {
    try {
      await save();
      onToast('Collection saved');
    } catch (e) {
      onToast(e instanceof Error ? e.message : 'Save failed');
    }
  }, [onToast, save]);

  const handleOpenCollection = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.dgig-api';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = JSON.parse(text) as ApiCollectionFile;
        if (!parsed.requests) throw new Error('Invalid collection');
        importCollection(parsed);
        if (window.dgigFs) {
          await initTaskRoot(taskId);
          await writeFile(COLLECTION_PATH, text, taskId);
        }
        onToast('Collection opened');
      } catch (e) {
        onToast(e instanceof Error ? e.message : 'Open failed');
      }
    };
    input.click();
  }, [importCollection, onToast, taskId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 's') return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        /* still save collection in api mode */
      }
      e.preventDefault();
      e.stopImmediatePropagation();
      void handleSaveCollection();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [handleSaveCollection]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (document.activeElement?.closest('.api-request')) {
          e.preventDefault();
          void handleSend();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleSend]);

  if (!electron) {
    return (
      <div className="api-root">
        <p className="api-muted">{t('workspace.apiElectronOnly')}</p>
        <p className="api-muted">{t('workspace.apiCollectionBrowser')}</p>
        <div className="api-layout">
          <CollectionPanel
            collection={collection}
            activeId={activeId}
            onSelect={setActiveId}
            onNew={addRequest}
            onSave={() => void handleSaveCollection()}
            onOpen={() => void handleOpenCollection()}
            onDelete={removeRequest}
            dirty={dirty}
          />
          <div className="api-main">
            <RequestPanel
              request={activeRequest}
              loading={loading}
              onChange={updateActive}
              onSend={() => void handleSend()}
            />
            <ResponsePanel
              response={lastResponse}
              onCopy={() => {
                if (lastResponse?.body) {
                  void navigator.clipboard.writeText(lastResponse.body);
                  onToast('Copied');
                }
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="api-root">
      <div className="api-layout">
        <CollectionPanel
          collection={collection}
          activeId={activeId}
          onSelect={setActiveId}
          onNew={addRequest}
          onSave={() => void handleSaveCollection()}
          onOpen={() => void handleOpenCollection()}
          onDelete={removeRequest}
          dirty={dirty}
        />
        <div className="api-main">
          <RequestPanel
            request={activeRequest}
            loading={loading}
            onChange={updateActive}
            onSend={() => void handleSend()}
          />
          <ResponsePanel
            response={lastResponse}
            onCopy={() => {
              if (lastResponse?.body) {
                void navigator.clipboard.writeText(lastResponse.body);
                onToast('Copied');
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
