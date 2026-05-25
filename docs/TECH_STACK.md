# GigCareer — 기술 스택 (역할 매칭 MVP → 프로덕션)

## 현재 (GitHub Pages 데모)

| 레이어 | 선택 | 이유 |
|--------|------|------|
| 호스팅 | GitHub Pages + `gigcareer.kr` | 비용 0, 정적 배포 |
| UI | React 18 (CDN) + 단일 HTML | MVP 빠른 반복 |
| 데이터 (데모) | `localStorage` + 시드 JSON | 서버 없이 “데이터가 흐르는” 체험 |
| 매칭 v1 | 태그·지역·기간 겹침 점수 | AI 없이 STEP 2 충족 |
| 신뢰 v1 | 긱 완료 후 양방향 리뷰 | LER 전 신뢰 레이어 |

**체험 URL:** `/ko/gig-match.html` (역할 태그 매칭 · 리뷰 · 공고)

---

## 프로덕션 추천 (4~8주)

| 레이어 | 추천 | 대안 |
|--------|------|------|
| 프론트 | **Vite + React + TypeScript** | Next.js (SEO·라우팅 필요 시) |
| 스타일 | Tailwind CSS | 기존 Barlow 디자인 토큰 이식 |
| API | **Supabase** (Postgres + Auth + RLS) | Firebase, 자체 Node |
| 매칭 v2 | Postgres + 태그 GIN 인덱스 | — |
| 매칭 v3 | OpenAI Embeddings + `pgvector` | 시맨틱 “바리스타 ≈ 카페 스태프” |
| 파일 | Supabase Storage | S3 |
| 배포 | Vercel (프론트) + Supabase (백엔드) | Cloudflare Pages |

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
```

---

## 구현 순서

1. **지금** — `gig-match.html` 로컬 저장 + 태그 매칭 (완료)
2. **2주** — Supabase 스키마 + Auth (카카오/이메일)
3. **3주** — 매칭 API + Client 공고 CRUD
4. **2주** — 완료·양방향 리뷰 + 평판 집계
5. **이후** — LER를 “검증 배지” 프리미엄 레이어로 optional 연동

LER는 **필수 인프라가 아니라 업그레이드 레이어**로 두는 것이 맞습니다.
