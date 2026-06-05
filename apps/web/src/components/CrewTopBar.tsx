import { Link } from 'react-router-dom';
import { BackButton } from './BackButton';
import { LangSwitch } from './LangSwitch';
import { useI18n } from '../context/I18nContext';

export function CrewTopBar({
  title,
  onBack,
}: {
  title?: string;
  onBack: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="crew-topbar">
      <BackButton onBack={onBack} className="crew-back-btn" />
      {title ? <span className="crew-topbar-title">{title}</span> : <span />}
      <div className="crew-topbar-end">
        <LangSwitch />
        <Link to="/" className="crew-topbar-home">
          {t('common.home')}
        </Link>
      </div>
    </div>
  );
}
