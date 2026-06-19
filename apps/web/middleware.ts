import { createKillSwitchResponse } from './src/lib/security/killSwitch';
import {
  updateSession,
  type MiddlewareRequest as SupabaseMiddlewareRequest,
  type NextResponseFactory,
} from './src/lib/supabase/middleware';

interface MiddlewareHeaders {
  get: (name: string) => string | null;
}

interface MiddlewareRequest extends SupabaseMiddlewareRequest {
  headers: MiddlewareHeaders;
  ip?: string;
}

interface NextServerModule {
  NextResponse: NextResponseFactory;
}

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 120;
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

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

export async function middleware(request: MiddlewareRequest) {
  let nextResponse: NextResponseFactory | null = null;

  try {
    const killSwitchResponse = createKillSwitchResponse();

    if (killSwitchResponse) {
      return killSwitchResponse;
    }

    nextResponse = await getNextResponseFactory();
    const sessionResponse = await updateSession(request, nextResponse);
    const rateLimitResponse = checkRateLimit(request);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return sessionResponse;
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
