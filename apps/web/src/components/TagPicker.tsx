import { useLocalize } from '../i18n/localizeDisplay';

interface TagPickerProps {
  pool: string[];
  selected: string[];
  onToggle: (tag: string) => void;
  label: string;
}

export function TagPicker({ pool, selected, onToggle, label }: TagPickerProps) {
  const loc = useLocalize();
  return (
    <div className="field-block">
      <div className="muted label">{label}</div>
      <div className="tags">
        {pool.map((t) => (
          <span
            key={t}
            className={'tag' + (selected.includes(t) ? ' on' : '')}
            onClick={() => onToggle(t)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onToggle(t)}
          >
            {loc.text(t)}
          </span>
        ))}
      </div>
    </div>
  );
}
