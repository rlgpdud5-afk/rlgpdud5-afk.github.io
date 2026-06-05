export function DocsPanel({ content, onChange, previewLabel, editLabel }: {
  content: string;
  onChange: (v: string) => void;
  previewLabel: string;
  editLabel: string;
}) {
  return (
    <div className="ws-tool-panel">
      <div className="ws-tool-split">
        <div className="ws-tool-col">
          <h4>{editLabel}</h4>
          <textarea className="ws-input-area ws-md" rows={16} value={content} onChange={(e) => onChange(e.target.value)} />
        </div>
        <div className="ws-tool-col ws-md-preview">
          <h4>{previewLabel}</h4>
          <div className="ws-md-render">
            {content.split('\n').map((line, i) => {
              if (line.startsWith('# ')) return <h1 key={i}>{line.slice(2)}</h1>;
              if (line.startsWith('## ')) return <h2 key={i}>{line.slice(3)}</h2>;
              if (line.startsWith('- ')) return <li key={i}>{line.slice(2)}</li>;
              if (!line.trim()) return <br key={i} />;
              return <p key={i}>{line}</p>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
