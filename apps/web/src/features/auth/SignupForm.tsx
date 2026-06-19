import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { SocialButtons } from './SocialButtons';
import { isValidEmail, toKoreanAuthError } from './authMessages';

export function SignupForm() {
  const { signUp } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setInfo('');

    const trimmedEmail = email.trim();
    const trimmedDisplayName = displayName.trim() || '긱워커';

    if (!isValidEmail(trimmedEmail)) {
      setError('올바른 이메일 주소를 입력해주세요.');
      return;
    }

    if (password.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    setBusy(true);

    try {
      const nextError = await signUp(trimmedEmail, password, trimmedDisplayName);

      if (nextError) {
        setError(toKoreanAuthError(nextError, '회원가입에 실패했습니다. 입력값을 확인해주세요.'));
        return;
      }

      setInfo('회원가입이 완료되었습니다. 이메일 인증 메일을 확인한 뒤 로그인해주세요.');
      setPassword('');
    } catch (unexpectedError) {
      console.error('회원가입 폼 처리 중 오류가 발생했습니다.', unexpectedError);
      setError('회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-panel">
      <form onSubmit={submit} className="card auth-card">
        <label className="auth-field">
          <span>표시 이름</span>
          <input
            className="input"
            placeholder="홍길동"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            autoComplete="name"
          />
        </label>
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
            placeholder="8자 이상"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        {info && <p className="notice ok">{info}</p>}
        <button type="submit" className="btn btn-p block" disabled={busy}>
          {busy ? '가입 중...' : '이메일로 회원가입'}
        </button>
      </form>
      <SocialButtons />
      <p className="muted center auth-link-row">
        이미 계정이 있나요? <Link to="/login">로그인</Link>
      </p>
    </div>
  );
}
