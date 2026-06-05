import { useI18n } from '../../context/I18nContext';
import { useLocalize } from '../../i18n/localizeDisplay';
import type { CrewUser, Credential } from '../../lib/crew/types';
import type { PortTemplateKey } from '../../lib/crew/portfolioSeed';

function Stars({ v }: { v: number }) {
  return <span style={{ color: '#F59E0B', fontWeight: 600 }}>★ {v}</span>;
}

export function PortDocProject({ user, creds }: { user: CrewUser; creds: Credential[] }) {
  const { locale } = useI18n();
  const loc = useLocalize();
  const heroSub =
    locale === 'en'
      ? 'LER-verified project portfolio'
      : locale === 'zh'
        ? '经 LER 验证的实务作品集'
        : locale === 'es'
          ? 'Portafolio de proyectos verificado por LER'
          : '검증된 LER 기반 실무 포트폴리오';
  return (
    <div className="port-doc port-doc--project">
      <div className="port-doc-inner">
        <div className="pd-hero">
          <div style={{ fontSize: 10, letterSpacing: 2, color: '#d4a574', marginBottom: 8 }}>
            PROJECT PORTFOLIO · GigCareer LER
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>{user.name}</div>
          <div style={{ fontSize: 13, color: 'rgba(232,234,239,.65)', maxWidth: 420 }}>
            {heroSub} · {user.region} · Trust {user.trustScore}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            {(user.skills || []).map((s) => (
              <span
                key={s}
                style={{
                  fontSize: 11,
                  padding: '4px 10px',
                  borderRadius: 6,
                  background: 'rgba(212,165,116,.2)',
                  color: '#E8D5B5',
                }}
              >
                {loc.text(s)}
              </span>
            ))}
          </div>
        </div>
        <div className="pd-grid">
          {creds.map((c) => (
            <div key={c.id} className="pd-card">
              <div style={{ fontSize: 10, color: '#d4a574', marginBottom: 6 }}>CASE · {c.verifyId}</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{loc.text(c.project)}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.55)', marginBottom: 10 }}>{loc.text(c.task)}</div>
              <div
                style={{
                  height: 4,
                  background: 'rgba(255,255,255,.08)',
                  borderRadius: 2,
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: `${c.rating * 20}%`,
                    height: '100%',
                    background: '#d4a574',
                    borderRadius: 2,
                  }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 11,
                }}
              >
                <Stars v={c.rating} />
                <span style={{ color: '#34d399' }}>QA Pass</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PortDocResume({ user, creds }: { user: CrewUser; creds: Credential[] }) {
  return (
    <div className="port-doc port-doc--resume">
      <div className="port-doc-inner pd-split">
        <div className="pd-side">
          <div className="pd-photo">{user.name?.[0]}</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{user.name}</div>
          <div style={{ fontSize: 11, opacity: 0.75, marginBottom: 20 }}>
            Talent · {user.region}
          </div>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.6, marginBottom: 8 }}>
            Contact
          </div>
          <div style={{ fontSize: 11, marginBottom: 16 }}>
            demo@gigcareer.kr
            <br />
            Verified LER
          </div>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.6, marginBottom: 8 }}>
            Skills
          </div>
          {(user.skills || []).map((s) => (
            <div key={s} style={{ fontSize: 11, marginBottom: 4 }}>
              · {s}
            </div>
          ))}
          <div style={{ marginTop: 20, fontSize: 10, opacity: 0.6 }}>
            Trust {user.trustScore} · On-time {user.deadlineRate}%
          </div>
        </div>
        <div className="pd-main">
          <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>지원 동기 / 요약</div>
          <p style={{ marginBottom: 20, color: '#333' }}>
            LER로 검증된 프로젝트 수행 이력을 바탕으로, <b>{creds[0]?.project}</b> 등{' '}
            {user.completedProjects}건의 실무를 완료했습니다. 협업·마감 준수율 {user.deadlineRate}
            %.
          </p>
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              borderBottom: '2px solid #1a1d24',
              paddingBottom: 6,
              marginBottom: 12,
            }}
          >
            경력 · 프로젝트
          </div>
          {creds.map((c) => (
            <div key={c.id} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <b>{c.project}</b>
                <span style={{ color: '#666', fontSize: 11 }}>{c.period}</span>
              </div>
              <div style={{ color: '#444', fontSize: 12, margin: '4px 0 6px' }}>
                {c.task} · {c.role}
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, color: '#333', fontSize: 12 }}>
                <li>담당 업무 수행 후 Reviewer 검수 통과 (VRF {c.verifyId})</li>
                <li>
                  핵심 스킬: {c.skills.join(', ')} · 평점 {c.rating}
                </li>
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PortDocCareer({ user, creds }: { user: CrewUser; creds: Credential[] }) {
  return (
    <div className="port-doc port-doc--career">
      <div className="port-doc-inner">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 800 }}>경 력 기 술 서</div>
          <div style={{ fontSize: 14, marginTop: 8 }}>
            성 명 : {user.name} &nbsp;&nbsp; 작성일 : {new Date().toISOString().slice(0, 10)}
          </div>
        </div>
        <table>
          <tbody>
            <tr>
              <th style={{ width: 100 }}>성명</th>
              <td>{user.name}</td>
              <th style={{ width: 80 }}>지역</th>
              <td>{user.region}</td>
            </tr>
            <tr>
              <th>핵심역량</th>
              <td colSpan={3}>{(user.skills || []).join(' · ')}</td>
            </tr>
            <tr>
              <th>신뢰지표</th>
              <td colSpan={3}>
                신뢰도 {user.trustScore} · 마감준수 {user.deadlineRate}% · 평균평점 {user.avgRating}{' '}
                (LER 검증)
              </td>
            </tr>
          </tbody>
        </table>
        <div style={{ fontWeight: 700, margin: '20px 0 8px' }}>1. 경력 요약</div>
        <table>
          <thead>
            <tr>
              <th>기간</th>
              <th>프로젝트/기관</th>
              <th>담당업무</th>
              <th>성과·검증</th>
            </tr>
          </thead>
          <tbody>
            {creds.map((c) => (
              <tr key={c.id}>
                <td>{c.period}</td>
                <td>{c.project}</td>
                <td>
                  {c.task}
                  <br />
                  <span style={{ fontSize: 11, color: '#555' }}>{c.skills.join(', ')}</span>
                </td>
                <td>
                  평점 {c.rating} · {c.verifyId}
                  <br />
                  {c.qaPass ? 'QA 통과' : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ fontWeight: 700, margin: '16px 0 8px' }}>2. 자기소개 (실무 중심)</div>
        <p style={{ margin: 0, textAlign: 'justify' }}>
          지역 프로젝트 플랫폼 D-GIG / LocalCrew를 통해 {user.completedProjects}건의 과업을
          수행하였으며, 모든 이력은 Learning & Employment Record(LER)로 검증됩니다.
        </p>
      </div>
    </div>
  );
}

export function PortDocProposal({ user, creds }: { user: CrewUser; creds: Credential[] }) {
  const total = creds.length * 850000;
  return (
    <div className="port-doc port-doc--proposal">
      <div className="port-doc-inner">
        <div className="pp-cover">
          <div style={{ fontSize: 11, color: '#666', letterSpacing: 2 }}>PROJECT PROPOSAL</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8 }}>
            실무 인력 제안서 — {user.name}
          </div>
          <div style={{ fontSize: 13, color: '#444', marginTop: 8 }}>
            제안 대상: 프로젝트 의뢰사 · GigCareer 검증 Talent
          </div>
        </div>
        <div className="pp-sec">
          <h4>1. 제안 개요</h4>
          <p>
            본 제안서는 LER(검증 이력) 기반 Talent {user.name}의 투입을 제안합니다. 신뢰도{' '}
            {user.trustScore}, 완료 프로젝트 {user.completedProjects}건.
          </p>
        </div>
        <div className="pp-sec">
          <h4>2. 검증된 수행 이력</h4>
          {creds.map((c) => (
            <div
              key={c.id}
              style={{ marginBottom: 10, paddingLeft: 12, borderLeft: '3px solid #D4A574' }}
            >
              <b>{c.project}</b> — {c.task} ({c.period})
              <br />
              <span style={{ fontSize: 12, color: '#555' }}>
                검증 ID {c.verifyId} · {c.skills.join(', ')}
              </span>
            </div>
          ))}
        </div>
        <div className="pp-sec">
          <h4>4. 제안 금액 (참고)</h4>
          <p style={{ fontSize: 18, fontWeight: 700 }}>
            ₩ {total.toLocaleString()}{' '}
            <span style={{ fontSize: 12, fontWeight: 400, color: '#666' }}>(VAT 별도 · 데모)</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export function PortPreview({
  tpl,
  user,
  creds,
}: {
  tpl: PortTemplateKey;
  user: CrewUser;
  creds: Credential[];
}) {
  if (tpl === 'resume') return <PortDocResume user={user} creds={creds} />;
  if (tpl === 'career') return <PortDocCareer user={user} creds={creds} />;
  if (tpl === 'proposal') return <PortDocProposal user={user} creds={creds} />;
  return <PortDocProject user={user} creds={creds} />;
}
