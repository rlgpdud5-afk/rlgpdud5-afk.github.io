export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';

export type ApiRequestItem = {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body: string | null;
  authBearer?: string;
};

export type ApiCollectionFile = {
  version: '1.0';
  name: string;
  requests: ApiRequestItem[];
};

export type ApiRequestPayload = {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string | null;
};

export type ApiResponseResult = {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  durationMs: number;
};

export const COLLECTION_PATH = 'api/collection.dgig-api';

export function newRequestId() {
  return `req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function defaultCollection(): ApiCollectionFile {
  return {
    version: '1.0',
    name: 'My API Collection',
    requests: [
      {
        id: newRequestId(),
        name: 'New request',
        method: 'GET',
        url: 'http://127.0.0.1:4400/api/v1/gigs',
        headers: { Accept: 'application/json' },
        body: null,
      },
    ],
  };
}
