import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, supabaseConfigured } from '../../lib/supabase/client';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  authEnabled: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

function getEmailRedirectTo() {
  try {
    return new URL('/auth/confirm', window.location.origin).toString();
  } catch (error) {
    console.error('이메일 인증 redirect URL을 만들지 못했습니다.', error);
    return undefined;
  }
}

async function clearServerAuthCookies() {
  try {
    await fetch('/auth/logout', {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
    });
  } catch (error) {
    console.error('서버 인증 쿠키 정리 요청에 실패했습니다.', error);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(supabaseConfigured);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return undefined;
    }

    let active = true;

    async function loadSession() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!active) {
          return;
        }

        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.error('인증 세션을 불러오지 못했습니다.', error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadSession();

    let subscription: { unsubscribe: () => void } | null = null;

    try {
      const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        try {
          setSession(nextSession);
          setUser(nextSession?.user ?? null);
        } catch (error) {
          console.error('인증 상태 변경을 처리하지 못했습니다.', error);
        }
      });

      subscription = data.subscription;
    } catch (error) {
      console.error('인증 상태 변경 구독을 시작하지 못했습니다.', error);
    }

    return () => {
      active = false;

      try {
        subscription?.unsubscribe();
      } catch (error) {
        console.error('인증 구독을 해제하지 못했습니다.', error);
      }
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    try {
      if (!supabase) {
        return 'Supabase가 설정되지 않았습니다.';
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getEmailRedirectTo(),
          data: { display_name: displayName },
        },
      });

      return error?.message ?? null;
    } catch (error) {
      console.error('회원가입 중 오류가 발생했습니다.', error);
      return '회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      if (!supabase) {
        return 'Supabase가 설정되지 않았습니다.';
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });

      return error?.message ?? null;
    } catch (error) {
      console.error('로그인 중 오류가 발생했습니다.', error);
      return '로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      if (!supabase) {
        return;
      }

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Supabase 로그아웃 중 오류가 발생했습니다.', error);
      }

      await clearServerAuthCookies();
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error('로그아웃 중 오류가 발생했습니다.', error);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      authEnabled: supabaseConfigured,
      signUp,
      signIn,
      signOut,
    }),
    [user, session, loading, signUp, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return ctx;
}
