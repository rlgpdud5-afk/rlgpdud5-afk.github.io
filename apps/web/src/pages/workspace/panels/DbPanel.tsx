import { DB_TABLES } from '../../../lib/workspace/store';

export function DbPanel({
  query,
  onQuery,
  onRun,
  runLabel,
  tablesLabel,
}: {
  query: string;
  onQuery: (q: string) => void;
  onRun: () => void;
  runLabel: string;
  tablesLabel: string;
}) {
  const mockRows = [
    ['w1', 'Seoyeon Kim', '4.7'],
    ['w2', 'Minsu Park', '4.5'],
  ];

  return (
    <div className="ws-tool-panel ws-db">
      <div className="ws-api-side">
        <h4>{tablesLabel}</h4>
        {DB_TABLES.map((t) => (
          <div key={t} className="ws-file">
            {t}
          </div>
        ))}
      </div>
      <div className="ws-api-main">
        <textarea className="ws-input-area ws-sql" rows={5} value={query} onChange={(e) => onQuery(e.target.value)} />
        <button type="button" className="ws-action-btn" onClick={onRun}>
          {runLabel} (F5)
        </button>
        <table className="ws-table">
          <thead>
            <tr>
              <th>id</th>
              <th>name</th>
              <th>rating</th>
            </tr>
          </thead>
          <tbody>
            {mockRows.map((row) => (
              <tr key={row[0]}>
                {row.map((cell) => (
                  <td key={cell}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
