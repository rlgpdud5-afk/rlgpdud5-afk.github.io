# GigCareer — 기술 스택 (D-GIG Phase 0 → Phase 1)

## 현재 (GitHub Pages 데모)

| 레이어 | 선택 | 이유 |
|--------|------|------|
| 호스팅 | GitHub Pages + `gigcareer.kr` | 비용 0, 정적 배포 |
| UI | React 18 (CDN) + 단일 HTML | MVP 빠른 반복 |
| 데이터 (데모) | `localStorage` + 시드 JSON | 서버 없이 “데이터가 흐르는” 체험 |
| 매칭 v1 | 태그·지역·기간 겹침 점수 | AI 없이 STEP 2 충족 |
| 신뢰 v1 | 긱 완료 후 양방향 리뷰 | LER 전 신뢰 레이어 |

**체험 URL**

- `/ko/gig-match.html` — 역할 태그 매칭 · 리뷰 · 공고
- `/ko/localcrew-mvp.html` — LocalCrew / LER UX 블루프린트
- `/ko/dgig-demo.html?view=workspace` — D-GIG 작업공간 첫 화면 · 아키텍처 보드

---

## 제품 구조: Two Entry Points → One Trust Graph

| 진입점 | 역할 | 산출물 |
|--------|------|--------|
| Gig Match | 1~4주 단기 공고 · 태그/지역/기간 매칭 | completion + review |
| LocalCrew / WBS | Project → module → task · Maker/Reviewer 검수 | WBS deliverables + QA |
| Trust Graph | review · SLA · QA · trust_score 집계 | LER credential seed |

LER는 v1 필수 인프라가 아니라, 신뢰 데이터가 쌓인 뒤 붙는 **업그레이드 레이어**입니다.

---

## 프로덕션 추천

| 레이어 | 추천 | 대안 |
|--------|------|------|
| 프론트 | **Vite + React + TypeScript** | Next.js (admin/security dashboard 필요 시) |
| 스타일 | Tailwind CSS | 기존 Barlow 디자인 토큰 이식 |
| API | **Supabase** (Postgres + Auth + RLS) | Firebase, 자체 Node |
| 매칭 v2 | Postgres + 태그 GIN 인덱스 | — |
| 매칭 v3 | OpenAI Embeddings + `pgvector` | 시맨틱 “바리스타 ≈ 카페 스태프” |
| 파일 | Supabase Storage | S3 |
| 배포 | Vercel (프론트) + Supabase (백엔드) | Cloudflare Pages |
| Security | Supabase Realtime + Edge Functions | SIEM 연동 |

### 왜 Supabase?

- GitHub Pages만으로는 **쓰기·매칭·리뷰 영속화** 불가
- Postgres로 `workers`, `gigs`, `applications`, `reviews` 관계형 모델 그대로 구현
- Row Level Security로 Maker/Client/Admin 권한 분리
- 나중에 LER 레이어는 `credentials` 테이블 + 외부 VRF ID 컬럼만 추가

---

## 데이터 모델 (STEP 1)

```
workers
  id, name, role_tags[], regions[], availability, rating_avg, completed_count

gigs
  id, employer_id, title, role_tags[], region, duration, pay, status

applications
  id, gig_id, worker_id, match_score, status (applied|accepted|completed)

reviews
  id, application_id, from_role, to_role, rating, comment

trust_events
  id, subject_type, subject_id, delta, reason, ref_type, ref_id

issued_credentials
  id, source_type, source_id, worker_did, verify_id, credential_data, content_hash, skills, status

security_events
  id, event_type, severity, user_id, ip, location, device, metadata, response_status
```

---

## Security Monitoring Seed

보안 설계 문서의 “Push, not Pull” 원칙을 Phase 1 씨앗으로 반영합니다.

1. 클라이언트 이벤트 생성: login_fail, new_device, mass_download, unauth_api
2. `security_events` INSERT
3. Supabase Realtime broadcast
4. Edge Function severity classifier
5. Admin dashboard subscription + Slack/email alert

---

## 구현 순서

1. **지금** — `gig-match.html` 로컬 저장 + 태그 매칭 (완료)
2. **다음** — Supabase Auth + RLS 잠금, `security_events` Realtime 활성화
3. **다음** — 매칭 API + Client 공고 CRUD
4. **다음** — 완료·양방향 리뷰 + `trust_events` 평판 집계
5. **이후** — LER를 “검증 배지” 프리미엄 레이어로 optional 연동

현재 저장소는 Phase 0입니다. `supabase/schema.sql`과 `gig-match-store.js`는 Phase 1 씨앗이고, `localcrew-mvp.html`은 Phase 2 UX 블루프린트입니다.
