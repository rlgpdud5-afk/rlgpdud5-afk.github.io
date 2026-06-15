import { useMemo, useState } from 'react';

type SecuritySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

interface SecurityEvent {
  id: string;
  type: string;
  severity: SecuritySeverity;
  message: string;
  response: string;
  at: string;
}

interface TrustEvent {
  id: string;
  delta: number;
  reason: string;
  ref: string;
  at: string;
}

interface IssuedCredential {
  id: string;
  verifyId: string;
  workerDid: string;
  sourceId: string;
  skills: string[];
  contentHash: string;
  at: string;
}

interface SecurityTrustState {
  trustScore: number;
  lockedAccounts: number;
  trustEvents: TrustEvent[];
  securityEvents: SecurityEvent[];
  credentials: IssuedCredential[];
}

const STORAGE_KEY = 'dgig-workspace-security-trust-v1';

const DEFAULT_STATE: SecurityTrustState = {
  trustScore: 87,
  lockedAccounts: 0,
  trustEvents: [],
  credentials: [],
  securityEvents: [
    {
      id: 'sec-seed',
      type: 'normal_access',
      severity: 'LOW',
      message: 'Workspace security stream ready',
      response: 'log only',
      at: new Date().toISOString(),
    },
  ],
};

function cloneDefault(): SecurityTrustState {
  return JSON.parse(JSON.stringify(DEFAULT_STATE)) as SecurityTrustState;
}

function loadState(): SecurityTrustState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SecurityTrustState) : cloneDefault();
  } catch {
    return cloneDefault();
  }
}

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
}

function classify(type: string): Pick<SecurityEvent, 'severity' | 'message' | 'response'> {
  if (type === 'mass_download') {
    return {
      severity: 'CRITICAL',
      message: 'Mass download threshold exceeded',
      response: 'account lock · IP block · Slack/email alert',
    };
  }
  if (type === 'login_fail') {
    return {
      severity: 'HIGH',
      message: '5 consecutive login failures detected',
      response: 'force MFA re-authentication',
    };
  }
  return {
    severity: 'MEDIUM',
    message: 'New IP/device access detected',
    response: 'record session · notify user',
  };
}

export function SecurityTrustPanel() {
  const [state, setState] = useState<SecurityTrustState>(loadState);

  const persist = (updater: (current: SecurityTrustState) => SecurityTrustState) => {
    setState((current) => {
      const next = updater(current);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const approveTask = () => {
    persist((current) => ({
      ...current,
      trustScore: Math.min(100, current.trustScore + 5),
      trustEvents: [
        {
          id: makeId('trust'),
          delta: 5,
          reason: 'task approved + QA pass + rating 4.8',
          ref: 'task:marketing-data-analysis',
          at: new Date().toISOString(),
        },
        ...current.trustEvents,
      ],
    }));
  };

  const issueCredential = () => {
    persist((current) => {
      const hasApproval = current.trustEvents.some((event) => event.ref === 'task:marketing-data-analysis');
      const trustEvents = hasApproval
        ? current.trustEvents
        : [
            {
              id: makeId('trust'),
              delta: 5,
              reason: 'task approved + QA pass + rating 4.8',
              ref: 'task:marketing-data-analysis',
              at: new Date().toISOString(),
            },
            ...current.trustEvents,
          ];

      return {
        ...current,
        trustScore: hasApproval ? current.trustScore : Math.min(100, current.trustScore + 5),
        trustEvents,
        credentials: [
          {
            id: makeId('cred'),
            verifyId: `VRF-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
            workerDid: 'did:dgig:worker:kim_daejeon_001',
            sourceId: 'task:marketing-data-analysis',
            skills: ['KSF-DAT-A001 Lv.3', 'Figma Lv.2', 'Copywriting Lv.2'],
            contentHash: `sha256:${Math.random().toString(16).slice(2, 18)}`,
            at: new Date().toISOString(),
          },
          ...current.credentials,
        ],
      };
    });
  };

  const pushSecurityEvent = (type: 'login_fail' | 'mass_download' | 'new_device') => {
    persist((current) => {
      const result = classify(type);
      return {
        ...current,
        lockedAccounts: result.severity === 'CRITICAL' ? current.lockedAccounts + 1 : current.lockedAccounts,
        securityEvents: [
          {
            id: makeId('sec'),
            type,
            severity: result.severity,
            message: result.message,
            response: result.response,
            at: new Date().toISOString(),
          },
          ...current.securityEvents,
        ],
      };
    });
  };

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(cloneDefault());
  };

  const stream = useMemo(() => {
    return [
      ...state.securityEvents.map((event) => ({ kind: 'security' as const, ...event })),
      ...state.trustEvents.map((event) => ({ kind: 'trust' as const, ...event })),
    ]
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 10);
  }, [state.securityEvents, state.trustEvents]);

  const credential = state.credentials[0];

  return (
    <div className="ws-tool-panel ws-security">
      <div className="ws-security-actions">
        <button type="button" onClick={approveTask}>
          <strong>① Approve task</strong>
          <span>Create trust_events delta and raise trust_score.</span>
        </button>
        <button type="button" onClick={issueCredential}>
          <strong>② Issue LER credential</strong>
          <span>Generate verify_id after QA pass and rating ≥ 4.0.</span>
        </button>
        <button type="button" onClick={() => pushSecurityEvent('login_fail')}>
          <strong>③ Login failure event</strong>
          <span>Classify as HIGH and require MFA.</span>
        </button>
        <button type="button" onClick={() => pushSecurityEvent('mass_download')}>
          <strong>④ Mass download event</strong>
          <span>Classify as CRITICAL and lock account.</span>
        </button>
        <button type="button" onClick={reset}>
          <strong>Reset demo state</strong>
          <span>Clear local trust, credential, and security events.</span>
        </button>
      </div>

      <div className="ws-security-main">
        <div className="ws-security-metrics">
          <div><b>{state.trustScore}</b><span>trust_score</span></div>
          <div><b>{state.credentials.length}</b><span>issued_credentials</span></div>
          <div><b>{state.securityEvents.length}</b><span>security_events</span></div>
          <div><b>{state.lockedAccounts}</b><span>locked accounts</span></div>
        </div>

        <div className="ws-security-stream">
          {stream.map((event) => (
            <div key={event.id} className={`ws-security-event ${event.kind === 'security' ? event.severity.toLowerCase() : 'trust'}`}>
              <span>{event.kind === 'security' ? event.severity : 'TRUST'}</span>
              <div>
                <strong>{event.kind === 'security' ? event.message : event.reason}</strong>
                <small>{event.kind === 'security' ? `${event.type} · ${event.response}` : `delta +${event.delta} · ${event.ref}`}</small>
              </div>
            </div>
          ))}
        </div>

        <pre className="ws-security-credential">
          {credential
            ? `$ ler-issue --source ${credential.sourceId}
✓ verify_id: ${credential.verifyId}
✓ subject: ${credential.workerDid}
✓ skills: ${credential.skills.join(' · ')}
✓ content_hash: ${credential.contentHash}
→ status: VALID · blockchain-ready`
            : '$ waiting for LER issuance\n조건: task approved + QA pass + rating ≥ 4.0'}
        </pre>
      </div>
    </div>
  );
}
