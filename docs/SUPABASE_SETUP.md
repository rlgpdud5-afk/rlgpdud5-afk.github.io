# Supabase 연동 (5분)

1. [supabase.com](https://supabase.com)에서 프로젝트 생성
2. SQL Editor에서 `supabase/schema.sql` 실행
3. (선택) `supabase/seed.sql` 실행 — 샘플 워커·공고
4. `config.example.js` → `config.js` 복사 후 URL·anon key 입력
5. `gig-match.html`을 `/ko/gig-match.html`에서 열기 → 상단 **☁ Supabase** 표시 확인

프로덕션 전에는 RLS를 Auth 기반으로 잠그세요. 현재 schema는 **데모용 전체 공개** 정책입니다.
