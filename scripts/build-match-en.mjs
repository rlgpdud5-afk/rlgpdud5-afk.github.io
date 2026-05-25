import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'sources', 'en');
mkdirSync(outDir, { recursive: true });

const repl = [
  ['lang="ko"', 'lang="en"'],
  ['역할 매칭 체험 — GigCareer', 'Role matching demo — GigCareer'],
  ['역할 태그 매칭 · v0 (데이터 흐름 데모)', 'Role tags · matching v0 (live data demo)'],
  ['LER 전에도 굴러가는 매칭', 'Matching without waiting for LER'],
  ['태그 + 지역 + 기간으로 매칭하고, 완료 후 리뷰로 신뢰를 쌓습니다.', 'Match on tags, region, and duration; build trust with post-gig reviews.'],
  ['(STEP 1~3 프로토타입 · Supabase 연동 전)', '(Steps 1–3 prototype · before Supabase)'],
  ['긱워커로 체험', 'Try as Talent'],
  ['고용주로 체험', 'Try as Employer'],
  ['← 기존 LER 플로우 데모', '← LER flow demo'],
  ['데이터 초기화', 'Reset data'],
  ['역할 다시 선택', 'Switch role'],
  ['초기화', 'Reset'],
  ['LER 없이 동작하는 신뢰 레이어', 'Trust layer without LER'],
  ['데이터는 이 브라우저에 저장됩니다 (localStorage).', 'Data persists in this browser (localStorage).'],
  ['긱워커 · ', 'Talent · '],
  ['평점 ', 'Rating '],
  ['완료 ', 'Done '],
  ['건', ' gigs'],
  ['매칭 공고', 'Matched gigs'],
  ['내 프로필', 'My profile'],
  ['지원 현황', 'Applications'],
  ['역할 태그 · 지역 · 기간', 'Role tags · region · duration'],
  ['역할 태그 (예: 바리스타 + 영어 가능)', 'Role tags (e.g. barista + English)'],
  ['가능 지역', 'Available regions'],
  ['가능 기간', 'Availability'],
  ['태그 매칭 순 공고 (AI 없음 — 겹치는 태그 점수)', 'Gigs ranked by tag overlap (no AI yet)'],
  ['매칭도', 'Match'],
  ['지원', 'Apply'],
  ['내 지원 · 리뷰', 'My applications'],
  ['아직 지원한 공고가 없습니다.', 'No applications yet.'],
  ['완료 + 리뷰 반영', 'Completed + reviewed'],
  ['고용주', 'Employer'],
  ['공고 등록 → 지원자는 태그 매칭 점수 순 · 수락 후 완료 시 양방향 리뷰로 평판 축적.', 'Post gigs → applicants ranked by tags → accept → bilateral reviews.'],
  ['긱 공고 올리기', 'Post a gig'],
  ['공고 제목', 'Job title'],
  ['업체명', 'Company'],
  ['급여 (예: 시급 1.2만)', 'Pay (e.g. hourly rate)'],
  ['필요 역할 태그', 'Required role tags'],
  ['지역 (1개)', 'Region'],
  ['기간', 'Duration'],
  ['공고 등록', 'Publish'],
  ['내 공고', 'My postings'],
  ['명 지원', ' applicants'],
  ['지원자 보기', 'View applicants'],
  ['지원자 (매칭순) — ', 'Applicants (by match) — '],
  ['지원자 없음. 긱워커 탭에서 지원해 보세요.', 'No applicants yet. Apply from the Talent view.'],
  ['수락', 'Accept'],
  ['완료 + 리뷰', 'Complete + review'],
  ['완료', 'Done'],
  ['닫기', 'Close'],
  ['김서연', 'Sarah Kim'],
  ['박민수', 'Min Park'],
  ['이하은', 'Ha-neul Lee'],
  ['제주 카페 모모', 'Jeju Cafe Momo'],
  ['로컬테크', 'LocalTech'],
  ['부산 페스티벌', 'Busan Festival'],
  ['바리스타 2주 긱 (오전)', 'Barista 2-week gig (AM)'],
  ['쇼핑몰 React UI 3주', 'Mall React UI · 3 weeks'],
  ['현장 스태프 1주', 'Event staff · 1 week'],
  ['영어 가능', 'English OK'],
  ['시급 1.2만', '₩12k/hr'],
  ['일당 12만', '₩120k/day'],
  ['300만', '₩3M'],
];

let html = readFileSync(path.join(root, 'gig-match.html'), 'utf8');
const sorted = [...repl].sort((a, b) => b[0].length - a[0].length);
for (const [from, to] of sorted) html = html.split(from).join(to);
writeFileSync(path.join(outDir, 'gig-match.html'), html, 'utf8');
console.log('English gig-match written to sources/en/');
