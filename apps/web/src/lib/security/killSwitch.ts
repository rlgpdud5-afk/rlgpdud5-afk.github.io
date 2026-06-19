interface KillSwitchEnv {
  AUTH_KILL_SWITCH?: string;
  DGIG_KILL_SWITCH?: string;
  KILL_SWITCH?: string;
}

declare const process: { env: KillSwitchEnv } | undefined;

const ENABLED_VALUES = new Set(['1', 'true', 'yes', 'on', 'enabled']);

function readEnv(): KillSwitchEnv {
  try {
    if (typeof process === 'undefined') {
      return {};
    }

    return {
      AUTH_KILL_SWITCH: process.env.AUTH_KILL_SWITCH,
      DGIG_KILL_SWITCH: process.env.DGIG_KILL_SWITCH,
      KILL_SWITCH: process.env.KILL_SWITCH,
    };
  } catch (error) {
    console.error('Kill Switch 환경변수를 읽지 못했습니다.', error);
    return {};
  }
}

function isEnabled(value: string | undefined) {
  try {
    return ENABLED_VALUES.has((value ?? '').trim().toLowerCase());
  } catch (error) {
    console.error('Kill Switch 값을 확인하지 못했습니다.', error);
    return false;
  }
}

export function isKillSwitchEnabled() {
  try {
    const env = readEnv();

    return (
      isEnabled(env.AUTH_KILL_SWITCH) ||
      isEnabled(env.DGIG_KILL_SWITCH) ||
      isEnabled(env.KILL_SWITCH)
    );
  } catch (error) {
    console.error('Kill Switch 상태 확인 중 오류가 발생했습니다.', error);
    return true;
  }
}

export function createKillSwitchResponse() {
  try {
    if (!isKillSwitchEnabled()) {
      return null;
    }

    return new Response(
      JSON.stringify({
        error: 'service_unavailable',
        message: '현재 인증 서비스가 일시 중지되었습니다.',
      }),
      {
        status: 503,
        headers: {
          'cache-control': 'no-store',
          'content-type': 'application/json; charset=utf-8',
        },
      },
    );
  } catch (error) {
    console.error('Kill Switch 응답 생성 중 오류가 발생했습니다.', error);
    return new Response(
      JSON.stringify({
        error: 'service_unavailable',
        message: '현재 인증 서비스가 일시 중지되었습니다.',
      }),
      {
        status: 503,
        headers: {
          'content-type': 'application/json; charset=utf-8',
        },
      },
    );
  }
}
