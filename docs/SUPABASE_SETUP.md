# Supabase 연동

1. [supabase.com](https://supabase.com)에서 프로젝트 생성
2. SQL Editor에서 `supabase/schema.sql` 실행
3. (선택) `supabase/seed.sql` 실행 — 샘플 워커·공고
4. `config.example.js` → `config.js` 복사 후 URL·anon key 입력
5. `gig-match.html`을 `/ko/gig-match.html`에서 열기 → 상단 **☁ Supabase** 표시 확인

프로덕션 전에는 RLS를 Auth 기반으로 잠그세요. 현재 schema는 **데모용 전체 공개** 정책입니다.

## D-GIG Phase 1 테이블

`supabase/schema.sql`에는 기존 Gig Match 테이블 외에 설계 문서의 Phase 1 씨앗이 포함됩니다.

| 테이블 | 목적 |
|--------|------|
| `reviews` | Gig / Task 검수 결과 저장 |
| `trust_events` | review · SLA · QA 기반 trust_score 변화 기록 |
| `issued_credentials` | LER/VC 발급 메타데이터와 verify_id 저장 |
| `security_events` | 로그인 실패, 새 기기, 대량 다운로드, 미인가 API 호출 등 보안 이벤트 |

## Security Realtime 활성화

보안 이벤트는 “Push, not Pull” 원칙으로 운영합니다. SQL Editor에서 schema 실행 후 필요 시 아래 명령을 실행하세요.

```sql
alter publication supabase_realtime add table security_events;
```

관리자 대시보드는 `security_events` INSERT를 구독해 최신 이벤트를 위로 쌓습니다.

```ts
supabase
  .channel('security-monitor')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'security_events'
  }, payload => {
    setEvents(prev => [payload.new, ...prev])
  })
  .subscribe()
```

## 프로덕션 전 필수 잠금

- Supabase Auth 적용
- Role별 RLS 정책 적용: client, maker, reviewer, worker, admin
- CRITICAL 이벤트용 Edge Function classifier + Slack/email alert
- 기밀 프로젝트는 별도 Supabase 프로젝트 또는 테넌트 격리 정책 적용
