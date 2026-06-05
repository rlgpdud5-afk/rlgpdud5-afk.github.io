import type { WorkspaceFile } from '../../../lib/workspace/store';

export function CodePanel({
  files,
  activeFileId,
  terminalOpen,
  terminalHint,
  onSelectFile,
  onChangeContent,
}: {
  files: WorkspaceFile[];
  activeFileId: string;
  terminalOpen: boolean;
  terminalHint: string;
  onSelectFile: (id: string) => void;
  onChangeContent: (id: string, content: string) => void;
}) {
  const active = files.find((f) => f.id === activeFileId) || files[0];
  const lineCount = (active?.content || '').split('\n').length;

  return (
    <>
      <div className="ws-tabs">
        {files.map((f) => (
          <div
            key={f.id}
            className={'ws-tab' + (f.id === activeFileId ? ' on' : '')}
            onClick={() => onSelectFile(f.id)}
            role="button"
            tabIndex={0}
          >
            {f.name}
          </div>
        ))}
      </div>
      <div className="ws-editor-wrap">
        <div className="ws-editor-gutter">
          {Array.from({ length: Math.max(lineCount, 12) }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <textarea
          className="ws-editor"
          value={active?.content || ''}
          spellCheck={false}
          onChange={(e) => onChangeContent(active.id, e.target.value)}
        />
      </div>
      {terminalOpen && (
        <div className="ws-terminal">
          <div>$ dgig secure-shell</div>
          <div>{terminalHint}</div>
        </div>
      )}
    </>
  );
}
