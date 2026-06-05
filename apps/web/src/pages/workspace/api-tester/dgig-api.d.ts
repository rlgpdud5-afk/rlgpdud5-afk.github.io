import type { ApiRequestPayload, ApiResponseResult } from './types';

export type DgigApi = {
  request: (args: ApiRequestPayload) => Promise<ApiResponseResult>;
};

declare global {
  interface Window {
    dgigApi?: DgigApi;
  }
}

export {};
