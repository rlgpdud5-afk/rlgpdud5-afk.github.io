import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

interface PublicSupabaseEnv {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
}

export interface ServerCookie {
  name: string;
  value: string;
}

export interface ServerCookieStore {
  getAll: () => ServerCookie[] | Promise<ServerCookie[]>;
  set?: (name: string, value: string, options?: CookieOptions) => void | Promise<void>;
}

interface NextHeadersModule {
  cookies: () => ServerCookieStore | Promise<ServerCookieStore>;
}

declare const process: { env: PublicSupabaseEnv } | undefined;

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
    console.error('서버 Supabase 환경변수를 읽는 중 오류가 발생했습니다.', error);
    return {};
  }
}

async function getCookieStore(): Promise<ServerCookieStore> {
  try {
    const moduleName = 'next/headers';
    const nextHeaders = (await import(moduleName)) as NextHeadersModule;

    return await nextHeaders.cookies();
  } catch (error) {
    console.error('Next.js cookies()를 불러오지 못했습니다.', error);
    throw error;
  }
}

const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = readProcessEnv();

export const supabaseServerConfigured = Boolean(
  NEXT_PUBLIC_SUPABASE_URL &&
    NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !NEXT_PUBLIC_SUPABASE_URL.includes('YOUR_PROJECT'),
);

export async function createClient(
  cookieStoreOverride?: ServerCookieStore,
): Promise<SupabaseClient | null> {
  try {
    if (
      !supabaseServerConfigured ||
      !NEXT_PUBLIC_SUPABASE_URL ||
      !NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      return null;
    }

    const cookieStore = cookieStoreOverride ?? (await getCookieStore());

    return createServerClient(
      NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: async () => {
            try {
              return await cookieStore.getAll();
            } catch (error) {
              console.error('Supabase 서버 쿠키를 읽지 못했습니다.', error);
              return [];
            }
          },
          setAll: async (cookiesToSet) => {
            try {
              if (!cookieStore.set) {
                return;
              }

              await Promise.all(
                cookiesToSet.map(({ name, value, options }) =>
                  cookieStore.set?.(name, value, options),
                ),
              );
            } catch (error) {
              // Server Components can read cookies, but cookie writes must be handled by middleware.
              console.error('Supabase 서버 쿠키를 저장하지 못했습니다.', error);
            }
          },
        },
      },
    );
  } catch (error) {
    console.error('서버 Supabase 클라이언트를 생성하지 못했습니다.', error);
    return null;
  }
}

export const createSupabaseServerClient = createClient;
