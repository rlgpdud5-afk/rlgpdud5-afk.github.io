export function Breadcrumb({
  filePath,
  onNavigate,
}: {
  filePath: string | null;
  onNavigate: (folderPath: string) => void;
}) {
  if (!filePath) {
    return (
      <div className="ce-breadcrumb">
        <span className="ce-breadcrumb-muted">파일 없음</span>
      </div>
    );
  }

  const parts = filePath.replace(/\\/g, '/').split('/');
  const segments: { label: string; path: string }[] = [{ label: 'workspace', path: '.' }];
  let acc = '';
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    acc = acc ? `${acc}/${part}` : part;
    const isFile = i === parts.length - 1;
    segments.push({
      label: part,
      path: isFile ? parts.slice(0, -1).join('/') || '.' : acc,
    });
  }

  return (
    <nav className="ce-breadcrumb" aria-label="File path">
      {segments.map((seg, i) => (
        <span key={`${seg.label}-${i}`} className="ce-breadcrumb-seg">
          {i > 0 && <span className="ce-breadcrumb-sep">/</span>}
          {i < segments.length - 1 ? (
            <button type="button" onClick={() => onNavigate(seg.path === '' ? '.' : seg.path)}>
              {seg.label}
            </button>
          ) : (
            <span className="ce-breadcrumb-file">{seg.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
