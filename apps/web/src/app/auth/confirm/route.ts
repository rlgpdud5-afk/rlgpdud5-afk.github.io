import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { createKillSwitchResponse } from '../../../lib/security/killSwitch';

const EMAIL_OTP_TYPES = [
  'signup',
  'invite',
  'magiclink',
  'recovery',
  'email_change',
  'email',
] as const;

type EmailOtpType = (typeof EMAIL_OTP_TYPES)[number];

function isEmailOtpType(value: string | null): value is EmailOtpType {
  try {
    return EMAIL_OTP_TYPES.includes(value as EmailOtpType);
  } catch (error) {
    console.error('이메일 인증 타입을 확인하지 못했습니다.', error);
    return false;
  }
}

function redirectTo(requestUrl: URL, pathname: string, error?: string) {
  try {
    const redirectUrl = new URL(pathname, requestUrl.origin);

    if (error) {
      redirectUrl.searchParams.set('error', error);
    }

    return Response.redirect(redirectUrl, 303);
  } catch (redirectError) {
    console.error('이메일 인증 리다이렉트 URL을 만들지 못했습니다.', redirectError);
    return new Response('Email confirmation redirect failed', { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const killSwitchResponse = createKillSwitchResponse();

    if (killSwitchResponse) {
      return killSwitchResponse;
    }

    const requestUrl = new URL(request.url);
    const tokenHash = requestUrl.searchParams.get('token_hash');
    const type = requestUrl.searchParams.get('type');

    if (!tokenHash || !isEmailOtpType(type)) {
      return redirectTo(requestUrl, '/login', 'invalid_confirmation_token');
    }

    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      return redirectTo(requestUrl, '/login', 'supabase_not_configured');
    }

    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (error) {
      console.error('이메일 인증 토큰을 처리하지 못했습니다.', error);
      return redirectTo(requestUrl, '/login', 'email_confirmation_failed');
    }

    return redirectTo(requestUrl, '/dashboard');
  } catch (error) {
    console.error('이메일 인증 route 처리 중 오류가 발생했습니다.', error);

    try {
      return redirectTo(new URL(request.url), '/login', 'email_confirmation_failed');
    } catch (redirectError) {
      console.error('이메일 인증 오류 리다이렉트에 실패했습니다.', redirectError);
      return new Response('Email confirmation failed', { status: 500 });
    }
  }
}
