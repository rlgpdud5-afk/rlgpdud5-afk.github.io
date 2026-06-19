import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';

export function LoginPage() {
  const { signIn, authEnabled } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

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

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const err = await signIn(email, password);
    setBusy(false);
    if (err) setError(err);
    else navigate('/match');
  };

  return (
    <div className="wrap auth">
      <h1>로그인</h1>
      <form onSubmit={submit} className="card">
        <input
          className="input"
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="input"
          type="password"
          placeholder="비밀번호 (6자 이상)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn btn-p block" disabled={busy}>
          {t('auth.login')}
        </button>
      </form>
      <p className="muted center">
        계정이 없나요? <Link to="/signup">회원가입</Link>
      </p>
    </div>
  );
}

export function SignupPage() {
  const { signUp, authEnabled } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  if (!authEnabled) {
    return (
      <div className="wrap auth">
        <h1>{t('auth.signup')}</h1>
        <p className="muted">Supabase 설정 후 이용 가능합니다. README를 참고하세요.</p>
      </div>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setInfo('');
    const err = await signUp(email, password, name || '긱워커');
    setBusy(false);
    if (err) setError(err);
    else {
      setInfo('가입 완료! 이메일 확인이 켜져 있으면 메일을 확인한 뒤 로그인하세요.');
      setTimeout(() => navigate('/login'), 2000);
    }
  };

  return (
    <div className="wrap auth">
      <h1>회원가입</h1>
      <p className="muted">클라우드에 프로필·지원 내역을 저장합니다.</p>
      <form onSubmit={submit} className="card">
        <input
          className="input"
          placeholder="이름 (표시명)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="input"
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="input"
          type="password"
          placeholder="비밀번호 (6자 이상)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        {error && <p className="error">{error}</p>}
        {info && <p className="notice ok">{info}</p>}
        <button type="submit" className="btn btn-p block" disabled={busy}>
          가입하기
        </button>
      </form>
      <p className="muted center">
        이미 계정이 있나요? <Link to="/login">로그인</Link>
      </p>
    </div>
  );
}
