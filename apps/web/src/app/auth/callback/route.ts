import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { createKillSwitchResponse } from '../../../lib/security/killSwitch';

function redirectTo(requestUrl: URL, pathname: string, error?: string) {
  try {
    const redirectUrl = new URL(pathname, requestUrl.origin);

    if (error) {
      redirectUrl.searchParams.set('error', error);
    }

    return Response.redirect(redirectUrl, 303);
  } catch (redirectError) {
    console.error('인증 callback 리다이렉트 URL을 만들지 못했습니다.', redirectError);
    return new Response('Authentication redirect failed', { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const killSwitchResponse = createKillSwitchResponse();

    if (killSwitchResponse) {
      return killSwitchResponse;
    }

    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (!code) {
      return redirectTo(requestUrl, '/login', 'missing_oauth_code');
    }

    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      return redirectTo(requestUrl, '/login', 'supabase_not_configured');
    }

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('OAuth code를 세션으로 교환하지 못했습니다.', error);
      return redirectTo(requestUrl, '/login', 'oauth_exchange_failed');
    }

    return redirectTo(requestUrl, '/dashboard');
  } catch (error) {
    console.error('OAuth callback 처리 중 오류가 발생했습니다.', error);

    try {
      return redirectTo(new URL(request.url), '/login', 'oauth_callback_failed');
    } catch (redirectError) {
      console.error('OAuth callback 오류 리다이렉트에 실패했습니다.', redirectError);
      return new Response('Authentication callback failed', { status: 500 });
    }
  }
}
