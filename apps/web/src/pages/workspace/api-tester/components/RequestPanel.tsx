import { useState } from 'react';
import { useI18n } from '../../../../context/I18nContext';
import type { ApiRequestItem, HttpMethod } from '../types';

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];

type TabId = 'headers' | 'body' | 'auth';

function headersToText(headers: Record<string, string>) {
  return Object.entries(headers)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
}

function textToHeaders(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of text.split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    if (key) out[key] = val;
  }
  return out;
}

export function RequestPanel({
  request,
  loading,
  onChange,
  onSend,
}: {
  request: ApiRequestItem | null;
  loading: boolean;
  onChange: (patch: Partial<ApiRequestItem>) => void;
  onSend: () => void;
}) {
  const { t } = useI18n();
  const [tab, setTab] = useState<TabId>('body');

  if (!request) {
    return <div className="api-request-empty">{t('workspace.apiSelectRequest')}</div>;
  }

  return (
    <div className="api-request">
      <div className="api-request-bar">
        <select
          className="api-method-select"
          value={request.method}
          onChange={(e) => onChange({ method: e.target.value as HttpMethod })}
        >
          {METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <input
          className="api-url-input"
          value={request.url}
          placeholder="http://internal-server/api/..."
          onChange={(e) => onChange({ url: e.target.value })}
        />
        <button type="button" className="api-btn api-btn--primary" disabled={loading} onClick={onSend}>
          {loading ? 'Sending…' : 'Send'}
        </button>
      </div>
      <input
        className="api-name-input"
        value={request.name}
        placeholder="Request name"
        onChange={(e) => onChange({ name: e.target.value })}
      />
      <div className="api-tabs">
        {(['headers', 'body', 'auth'] as TabId[]).map((t) => (
          <button
            key={t}
            type="button"
            className={'api-tab' + (tab === t ? ' on' : '')}
            onClick={() => setTab(t)}
          >
            {t === 'headers' ? 'Headers' : t === 'body' ? 'Body' : 'Auth'}
          </button>
        ))}
      </div>
      <div className="api-tab-body">
        {tab === 'headers' && (
          <textarea
            className="api-textarea"
            rows={8}
            value={headersToText(request.headers)}
            onChange={(e) => onChange({ headers: textToHeaders(e.target.value) })}
            placeholder={'Content-Type: application/json\nAccept: application/json'}
          />
        )}
        {tab === 'body' && (
          <textarea
            className="api-textarea"
            rows={12}
            value={request.body ?? ''}
            onChange={(e) => onChange({ body: e.target.value || null })}
            placeholder="Raw JSON body"
          />
        )}
        {tab === 'auth' && (
          <label className="api-auth-row">
            Bearer token
            <input
              className="api-url-input"
              value={request.authBearer ?? ''}
              onChange={(e) => onChange({ authBearer: e.target.value })}
              placeholder="eyJhbGciOi..."
            />
          </label>
        )}
      </div>
    </div>
  );
}
