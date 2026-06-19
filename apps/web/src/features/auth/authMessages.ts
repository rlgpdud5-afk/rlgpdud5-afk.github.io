export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function toKoreanAuthError(message: string | null | undefined, fallback: string) {
  if (!message) {
    return fallback;
  }

  const normalized = message.toLowerCase();

  if (normalized.includes('invalid login credentials')) {
    return '이메일 또는 비밀번호가 올바르지 않습니다.';
  }

  if (normalized.includes('email not confirmed')) {
    return '이메일 인증이 완료되지 않았습니다. 메일함을 확인해주세요.';
  }

  if (normalized.includes('user already registered') || normalized.includes('already registered')) {
    return '이미 가입된 이메일입니다. 로그인하거나 비밀번호 찾기를 이용해주세요.';
  }

  if (normalized.includes('password')) {
    return '비밀번호 조건을 확인해주세요. 최소 8자 이상이어야 합니다.';
  }

  if (normalized.includes('email')) {
    return '이메일 주소를 확인해주세요.';
  }

  if (normalized.includes('rate limit')) {
    return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
  }

  return fallback;
}
