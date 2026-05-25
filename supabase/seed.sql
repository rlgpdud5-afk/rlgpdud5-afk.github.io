-- Optional seed after schema.sql (clears demo tables)
truncate applications, gigs, workers cascade;

insert into workers (id, name, role_tags, regions, duration, rating, completed_count, bio) values
  ('11111111-1111-1111-1111-111111111101', '김서연', array['바리스타','영어 가능','CS·응대'], array['제주','원격'], '2주', 4.7, 6, '제주·원격 바리스타·CS'),
  ('11111111-1111-1111-1111-111111111102', '박민수', array['프론트엔드','React','데이터 정리'], array['대전','세종'], '1개월', 4.5, 4, 'React UI·데이터'),
  ('11111111-1111-1111-1111-111111111103', '이하은', array['번역·통역','마케팅 보조'], array['부산','원격'], '1주', 4.8, 9, '번역·마케팅');

insert into gigs (id, employer, title, role_tags, region, duration, pay, status, employer_rating, jd_text) values
  ('22222222-2222-2222-2222-222222222201', '제주 카페 모모', '바리스타 2주 긱 (오전)', array['바리스타','CS·응대'], '제주', '2주', '시급 1.2만', 'open', 4.6, '제주 카페 오픈 지원. 바리스타 경험, 영어 가능 우대.'),
  ('22222222-2222-2222-2222-222222222202', '로컬테크', '쇼핑몰 React UI 3주', array['프론트엔드','React'], '대전', '1개월', '300만', 'open', 4.4, '로컬 커머스 프론트. React, 컴포넌트 제작.'),
  ('22222222-2222-2222-2222-222222222203', '부산 페스티벌', '현장 스태프 1주', array['이벤트 스태프','CS·응대'], '부산', '1주', '일당 12만', 'open', 4.2, '페스티벌 현장 안내·CS.');
