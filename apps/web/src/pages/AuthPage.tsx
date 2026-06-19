import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { LoginForm } from '../features/auth/LoginForm';
import { SignupForm } from '../features/auth/SignupForm';

export function LoginPage() {
  const { authEnabled } = useAuth();
  const { t } = useI18n();

  if (!authEnabled) {
    return (
      <div className="wrap auth">
        <h1>{t('auth.login')}</h1>
        <p className="muted">
          Supabase가 설정되지 않았습니다. .env.example을 .env.local로 복사한 뒤 dev 서버를 다시
          시작하세요. 로컬 모드는 <Link to="/match">매칭</Link>에서 바로 사용할 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="wrap auth">
      <h1>로그인</h1>
      <LoginForm />
    </div>
  );
}

export function SignupPage() {
  const { authEnabled } = useAuth();
  const { t } = useI18n();

  if (!authEnabled) {
    return (
      <div className="wrap auth">
        <h1>{t('auth.signup')}</h1>
        <p className="muted">Supabase 설정 후 이용 가능합니다. README를 참고하세요.</p>
      </div>
    );
  }

  return (
    <div className="wrap auth">
      <h1>회원가입</h1>
      <p className="muted">클라우드에 프로필·지원 내역을 저장합니다.</p>
      <SignupForm />
    </div>
  );
}
