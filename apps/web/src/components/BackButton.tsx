import { useNavigate } from 'react-router-dom';
import { useI18n } from '../context/I18nContext';

type BackButtonProps = {
  /** 라우트 뒤로가기 불가일 때 이동할 경로 */
  fallback?: string;
  label?: string;
  /** LocalCrew 등 내부 상태 뒤로가기 */
  onBack?: () => void;
  className?: string;
};

export function BackButton({
  fallback = '/',
  label,
  onBack,
  className = 'app-back',
}: BackButtonProps) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const text = label ?? t('common.back');

  const handleClick = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  return (
    <button type="button" className={className} onClick={handleClick}>
      ← {text}
    </button>
  );
}
