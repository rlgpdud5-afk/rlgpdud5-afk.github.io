import { createKillSwitchResponse } from './src/lib/security/killSwitch';
import {
  updateSessionAndGetUser,
  type MiddlewareRequest as SupabaseMiddlewareRequest,
  type MiddlewareResponse,
  type NextResponseFactory,
} from './src/lib/supabase/middleware';

interface MiddlewareHeaders {
  get: (name: string) => string | null;
}

interface MiddlewareRequest extends SupabaseMiddlewareRequest {
  headers: MiddlewareHeaders;
  ip?: string;
  url: string;
}

interface NextServerModule {
  NextResponse: NextResponseFactory;
}

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 120;
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();
const PROTECTED_PATH_PREFIXES = [
  '/dashboard',
  '/gig-match',
  '/match',
  '/profile',
  '/account',
  '/applications',
  '/employer',
];
const AUTH_PATHS = new Set(['/login', '/signup']);

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

function getClientKey(request: MiddlewareRequest) {
  try {
    const forwardedFor = request.headers.get('x-forwarded-for');

    return (
      request.ip ??
      forwardedFor?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'anonymous'
    );
  } catch (error) {
    console.error('Rate Limit 클라이언트 키를 만들지 못했습니다.', error);
    return 'anonymous';
  }
}

function createRateLimitResponse() {
  return new Response(
    JSON.stringify({
      error: 'rate_limited',
      message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
    }),
    {
      status: 429,
      headers: {
        'cache-control': 'no-store',
        'content-type': 'application/json; charset=utf-8',
      },
    },
  );
}

function checkRateLimit(request: MiddlewareRequest) {
  try {
    const now = Date.now();
    const clientKey = getClientKey(request);
    const bucket = rateLimitBuckets.get(clientKey);

    if (!bucket || bucket.resetAt <= now) {
      rateLimitBuckets.set(clientKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
      return null;
    }

    bucket.count += 1;

    if (bucket.count > RATE_LIMIT_MAX_REQUESTS) {
      return createRateLimitResponse();
    }

    return null;
  } catch (error) {
    console.error('Rate Limit 확인 중 오류가 발생했습니다.', error);
    return createRateLimitResponse();
  }
}

function getRequestUrl(request: MiddlewareRequest) {
  try {
    return new URL(request.url);
  } catch (error) {
    console.error('미들웨어 요청 URL을 파싱하지 못했습니다.', error);
    return new URL('http://localhost/');
  }
}

function isProtectedPath(pathname: string) {
  try {
    return PROTECTED_PATH_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );
  } catch (error) {
    console.error('보호 경로 여부를 확인하지 못했습니다.', error);
    return true;
  }
}

function createRedirectResponse(
  request: MiddlewareRequest,
  nextResponse: NextResponseFactory,
  pathname: string,
  searchParams?: Record<string, string>,
) {
  try {
    const redirectUrl = getRequestUrl(request);
    redirectUrl.pathname = pathname;
    redirectUrl.search = '';

    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        redirectUrl.searchParams.set(key, value);
      });
    }

    return nextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('미들웨어 리다이렉트 응답을 만들지 못했습니다.', error);
    return nextResponse.next({ request });
  }
}

function applyRouteProtection(
  request: MiddlewareRequest,
  nextResponse: NextResponseFactory,
  sessionResponse: MiddlewareResponse,
  isAuthenticated: boolean,
) {
  try {
    const requestUrl = getRequestUrl(request);
    const pathname = requestUrl.pathname;

    if (isProtectedPath(pathname) && !isAuthenticated) {
      return createRedirectResponse(request, nextResponse, '/login', {
        redirectedFrom: `${requestUrl.pathname}${requestUrl.search}`,
      });
    }

    if (AUTH_PATHS.has(pathname) && isAuthenticated) {
      return createRedirectResponse(request, nextResponse, '/dashboard');
    }

    return sessionResponse;
  } catch (error) {
    console.error('라우트 보호 처리 중 오류가 발생했습니다.', error);
    return sessionResponse;
  }
}

export async function middleware(request: MiddlewareRequest) {
  let nextResponse: NextResponseFactory | null = null;

  try {
    const killSwitchResponse = createKillSwitchResponse();

    if (killSwitchResponse) {
      return killSwitchResponse;
    }

    nextResponse = await getNextResponseFactory();
    const { response: sessionResponse, user } = await updateSessionAndGetUser(
      request,
      nextResponse,
    );
    const rateLimitResponse = checkRateLimit(request);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return applyRouteProtection(request, nextResponse, sessionResponse, Boolean(user));
  } catch (error) {
    console.error('미들웨어 처리 중 오류가 발생했습니다.', error);

    if (nextResponse) {
      return nextResponse.next({ request });
    }

    return new Response(null, { status: 204 });
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)',
  ],
};
