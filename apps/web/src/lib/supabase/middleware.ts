import { createServerClient, type CookieOptions } from '@supabase/ssr';

interface PublicSupabaseEnv {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
}

export interface MiddlewareCookie {
  name: string;
  value: string;
}

export interface MiddlewareRequest {
  cookies: {
    getAll: () => MiddlewareCookie[];
    set: (name: string, value: string) => void;
  };
}

export interface MiddlewareResponse {
  cookies: {
    set: (name: string, value: string, options?: CookieOptions) => void;
  };
}

export interface NextResponseFactory {
  next: (init?: { request?: MiddlewareRequest }) => MiddlewareResponse;
}

interface NextServerModule {
  NextResponse: NextResponseFactory;
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
    console.error('미들웨어 Supabase 환경변수를 읽는 중 오류가 발생했습니다.', error);
    return {};
  }
}

async function getNextResponseFactory(): Promise<NextResponseFactory> {
  try {
    const moduleName = 'next/server';
    const nextServer = (await import(moduleName)) as NextServerModule;

    return nextServer.NextResponse;
  } catch (error) {
    console.error('NextResponse를 불러오지 못했습니다.', error);
    throw error;
  }
}

const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = readProcessEnv();

export const supabaseMiddlewareConfigured = Boolean(
  NEXT_PUBLIC_SUPABASE_URL &&
    NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !NEXT_PUBLIC_SUPABASE_URL.includes('YOUR_PROJECT'),
);

export async function updateSession(
  request: MiddlewareRequest,
  responseFactory?: NextResponseFactory,
): Promise<MiddlewareResponse> {
  let supabaseResponse: MiddlewareResponse | null = null;

  try {
    const nextResponse = responseFactory ?? (await getNextResponseFactory());
    supabaseResponse = nextResponse.next({ request });

    if (
      !supabaseMiddlewareConfigured ||
      !NEXT_PUBLIC_SUPABASE_URL ||
      !NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      return supabaseResponse;
    }

    const supabase = createServerClient(
      NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            try {
              cookiesToSet.forEach(({ name, value }) => {
                request.cookies.set(name, value);
              });

              supabaseResponse = nextResponse.next({ request });

              cookiesToSet.forEach(({ name, value, options }) => {
                supabaseResponse.cookies.set(name, value, options);
              });
            } catch (error) {
              console.error('Supabase 미들웨어 쿠키를 갱신하지 못했습니다.', error);
            }
          },
        },
      },
    );

    await supabase.auth.getUser();

    return supabaseResponse;
  } catch (error) {
    console.error('Supabase 세션 갱신 중 오류가 발생했습니다.', error);
    return supabaseResponse ?? { cookies: { set: () => undefined } };
  }
}

export const refreshSession = updateSession;
