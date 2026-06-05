import { useCallback, useState } from 'react';
import type { ApiRequestPayload, ApiResponseResult } from '../types';

export function useApiRequest() {
  const [loading, setLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<ApiResponseResult | null>(null);
  const electron = typeof window !== 'undefined' && !!window.dgigApi;

  const send = useCallback(async (payload: ApiRequestPayload) => {
    if (!window.dgigApi) {
      const mock: ApiResponseResult = {
        status: 0,
        statusText: 'Unavailable',
        headers: {},
        body: 'API Tester requires Electron (main-process HTTP).',
        durationMs: 0,
      };
      setLastResponse(mock);
      return mock;
    }
    setLoading(true);
    try {
      const res = await window.dgigApi.request(payload);
      setLastResponse(res);
      return res;
    } finally {
      setLoading(false);
    }
  }, []);

  return { electron, loading, lastResponse, send, setLastResponse };
}
