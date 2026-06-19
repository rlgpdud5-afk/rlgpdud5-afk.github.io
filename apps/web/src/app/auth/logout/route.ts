import { createKillSwitchResponse } from '../../../lib/security/killSwitch';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

function appendClearedAuthCookies(response: Response, request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') ?? '';
    const cookieNames = cookieHeader
      .split(';')
      .map((part) => part.split('=')[0]?.trim())
      .filter((name): name is string => Boolean(name));

    const authCookieNames = new Set(
      cookieNames.filter(
        (name) =>
          name.startsWith('sb-') ||
          name === 'supabase-auth-token' ||
          name.startsWith('supabase-auth-token.'),
      ),
    );

    authCookieNames.forEach((name) => {
      response.headers.append(
        'set-cookie',
        `${name}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
      );
      response.headers.append(
        'set-cookie',
        `${name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`,
      );
    });
  } catch (error) {
    console.error('Supabase 인증 쿠키 삭제 헤더를 만들지 못했습니다.', error);
  }
}

function createLogoutResponse(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const redirectUrl = new URL('/login', requestUrl.origin);
    const response = Response.redirect(redirectUrl, 303);

    appendClearedAuthCookies(response, request);

    return response;
  } catch (error) {
    console.error('로그아웃 리다이렉트 응답을 만들지 못했습니다.', error);
    const response = new Response(null, { status: 204 });

    appendClearedAuthCookies(response, request);

    return response;
  }
}

async function handleLogout(request: Request) {
  try {
    const killSwitchResponse = createKillSwitchResponse();

    if (killSwitchResponse) {
      return killSwitchResponse;
    }

    const supabase = await createSupabaseServerClient();

    if (supabase) {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('서버 로그아웃 중 오류가 발생했습니다.', error);
      }
    }

    return createLogoutResponse(request);
  } catch (error) {
    console.error('로그아웃 route 처리 중 오류가 발생했습니다.', error);
    return createLogoutResponse(request);
  }
}

export async function GET(request: Request) {
  return handleLogout(request);
}

export async function POST(request: Request) {
  return handleLogout(request);
}
