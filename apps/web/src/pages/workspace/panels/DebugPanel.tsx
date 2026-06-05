export function DebugPanel({
  consoleLines,
  watchLabel,
  consoleLabel,
  breakpointsLabel,
}: {
  consoleLines: string[];
  watchLabel: string;
  consoleLabel: string;
  breakpointsLabel: string;
}) {
  return (
    <div className="ws-tool-panel">
      <div className="ws-tool-split">
        <div className="ws-tool-col">
          <h4>{watchLabel}</h4>
          <div className="ws-debug-row">workerId: &quot;w1&quot;</div>
          <div className="ws-debug-row">matchScore: 87</div>
          <h4 style={{ marginTop: 16 }}>{breakpointsLabel}</h4>
          <div className="ws-debug-row">api/client.ts:12</div>
          <div className="ws-debug-row">verify-ler.ts:4</div>
        </div>
        <div className="ws-tool-col">
          <h4>{consoleLabel}</h4>
          <div className="ws-terminal" style={{ height: '100%', minHeight: 200 }}>
            {consoleLines.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
