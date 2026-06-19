import type { Provider } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase/client';

type OAuthProvider = Extract<Provider, 'google' | 'kakao' | 'apple' | 'github'>;

interface SocialProviderConfig {
  provider: OAuthProvider;
  label: string;
  icon: string;
  className: string;
}

const SOCIAL_PROVIDERS: SocialProviderConfig[] = [
  { provider: 'google', label: 'Google', icon: 'G', className: 'auth-social-google' },
  { provider: 'kakao', label: 'Kakao', icon: 'K', className: 'auth-social-kakao' },
  { provider: 'apple', label: 'Apple', icon: 'A', className: 'auth-social-apple' },
  { provider: 'github', label: 'GitHub', icon: 'GH', className: 'auth-social-github' },
];

function getOAuthRedirectTo() {
  try {
    return new URL('/auth/callback', window.location.origin).toString();
  } catch (error) {
    console.error('OAuth redirect URL을 만들지 못했습니다.', error);
    return undefined;
  }
}

function getOAuthErrorMessage(providerLabel: string) {
  return `${providerLabel} 로그인을 시작하지 못했습니다. 잠시 후 다시 시도해주세요.`;
}

export function SocialButtons() {
  const handleOAuthSignIn = async (provider: OAuthProvider, label: string) => {
    try {
      if (!supabase) {
        alert('Supabase가 설정되지 않았습니다.');
        return;
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: getOAuthRedirectTo(),
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(`${label} OAuth 로그인 중 오류가 발생했습니다.`, error);
      alert(getOAuthErrorMessage(label));
    }
  };

  return (
    <div className="auth-social" aria-label="소셜 로그인">
      <div className="auth-divider">
        <span>또는 소셜 계정으로 계속하기</span>
      </div>
      <div className="auth-social-grid">
        {SOCIAL_PROVIDERS.map(({ provider, label, icon, className }) => (
          <button
            key={provider}
            type="button"
            className={`auth-social-btn ${className}`}
            onClick={() => void handleOAuthSignIn(provider, label)}
          >
            <span className="auth-social-icon" aria-hidden>
              {icon}
            </span>
            <span>{label}</span>
          </button>
        ))}
        <button type="button" className="auth-social-btn auth-social-naver" disabled>
          <span className="auth-social-icon" aria-hidden>
            N
          </span>
          <span>Naver 준비 중</span>
        </button>
      </div>
    </div>
  );
}
