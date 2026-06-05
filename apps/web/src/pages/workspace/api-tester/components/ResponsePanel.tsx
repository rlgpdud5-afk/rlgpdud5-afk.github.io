import { useMemo } from 'react';
import Editor from '@monaco-editor/react';
import type { ApiResponseResult } from '../types';

function statusClass(status: number) {
  if (status >= 200 && status < 300) return 'ok';
  if (status >= 400 && status < 500) return 'client';
  if (status >= 500) return 'server';
  return 'err';
}

function detectLanguage(body: string, headers: Record<string, string>) {
  const ct = (headers['content-type'] || headers['Content-Type'] || '').toLowerCase();
  if (ct.includes('json') || (body.trim().startsWith('{') || body.trim().startsWith('['))) return 'json';
  if (ct.includes('html')) return 'html';
  return 'plaintext';
}

export function ResponsePanel({
  response,
  onCopy,
}: {
  response: ApiResponseResult | null;
  onCopy: () => void;
}) {
  const lang = useMemo(
    () => (response ? detectLanguage(response.body, response.headers) : 'plaintext'),
    [response],
  );

  if (!response) {
    return (
      <div className="api-response">
        <h4 className="api-response-title">Response</h4>
        <p className="api-muted">Send a request to see the response.</p>
      </div>
    );
  }

  return (
    <div className="api-response">
      <div className="api-response-head">
        <h4 className="api-response-title">Response</h4>
        <span className={'api-status api-status--' + statusClass(response.status)}>
          {response.status} {response.statusText}
        </span>
        <span className="api-duration">{response.durationMs} ms</span>
        <button type="button" className="api-btn api-btn--ghost" onClick={onCopy}>
          Copy body
        </button>
      </div>
      <div className="api-response-headers">
        <table>
          <tbody>
            {Object.entries(response.headers).map(([k, v]) => (
              <tr key={k}>
                <th>{k}</th>
                <td>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="api-response-body">
        <Editor
          height="100%"
          language={lang}
          value={response.body}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
          }}
        />
      </div>
    </div>
  );
}
