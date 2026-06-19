import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

interface PublicSupabaseEnv {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
}

declare const process: { env: PublicSupabaseEnv } | undefined;

function readImportMetaEnv(): PublicSupabaseEnv {
  try {
    return import.meta.env as PublicSupabaseEnv;
  } catch (error) {
    console.error('브라우저 Supabase 환경변수를 읽는 중 오류가 발생했습니다.', error);
    return {};
  }
}

function readProcessEnv(): PublicSupabaseEnv {
  try {
    if (typeof process === 'undefined') {
      return {};
    }

    return {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    };
  } catch (error) {
    console.error('런타임 Supabase 환경변수를 읽는 중 오류가 발생했습니다.', error);
    return {};
  }
}

function getSupabasePublicEnv() {
  const importMetaEnv = readImportMetaEnv();
  const processEnv = readProcessEnv();

  return {
    supabaseUrl:
      processEnv.NEXT_PUBLIC_SUPABASE_URL ??
      importMetaEnv.NEXT_PUBLIC_SUPABASE_URL ??
      importMetaEnv.VITE_SUPABASE_URL,
    supabaseAnonKey:
      processEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      importMetaEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      importMetaEnv.VITE_SUPABASE_ANON_KEY,
  };
}

const { supabaseUrl, supabaseAnonKey } = getSupabasePublicEnv();

export const supabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('YOUR_PROJECT'),
);

export function createClient(): SupabaseClient | null {
  try {
    if (!supabaseConfigured || !supabaseUrl || !supabaseAnonKey) {
      return null;
    }

    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('브라우저 Supabase 클라이언트를 생성하지 못했습니다.', error);
    return null;
  }
}

export const createSupabaseBrowserClient = createClient;
export const supabase = createClient();
