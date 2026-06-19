import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { SocialButtons } from './SocialButtons';
import { isValidEmail, toKoreanAuthError } from './authMessages';

export function LoginForm() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const trimmedEmail = email.trim();

    if (!isValidEmail(trimmedEmail)) {
      setError('올바른 이메일 주소를 입력해주세요.');
      return;
    }

    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    setBusy(true);

    try {
      const nextError = await signIn(trimmedEmail, password);

      if (nextError) {
        setError(toKoreanAuthError(nextError, '로그인에 실패했습니다. 입력값을 확인해주세요.'));
        return;
      }

      navigate('/dashboard');
    } catch (unexpectedError) {
      console.error('로그인 폼 처리 중 오류가 발생했습니다.', unexpectedError);
      setError('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-panel">
      <form onSubmit={submit} className="card auth-card">
        <label className="auth-field">
          <span>이메일</span>
          <input
            className="input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label className="auth-field">
          <span>비밀번호</span>
          <input
            className="input"
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        <div className="auth-form-row">
          <Link to="/forgot-password">비밀번호 찾기</Link>
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn btn-p block" disabled={busy}>
          {busy ? '로그인 중...' : '이메일로 로그인'}
        </button>
      </form>
      <SocialButtons />
      <p className="muted center auth-link-row">
        계정이 없나요? <Link to="/signup">회원가입</Link>
      </p>
    </div>
  );
}
