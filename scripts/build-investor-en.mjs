import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const enSourceDir = path.join(root, 'sources', 'en');
mkdirSync(enSourceDir, { recursive: true });

const linkMap = [
  ['index.html', 'index-en.html'],
  ['about.html', 'about-en.html'],
  ['service.html', 'service-en.html'],
  ['insights.html', 'insights-en.html'],
  ['contact.html', 'contact-en.html'],
  ['experience.html', 'experience.html'],
  ['localcrew-mvp.html', 'localcrew-mvp.html'],
];

function fixLinks(html) {
  for (const [ko, en] of linkMap) {
    html = html.split(`href="${ko}"`).join(`href="${en}"`);
    html = html.split(`href='${ko}'`).join(`href='${en}'`);
  }
  return html;
}

function injectNav(html, isEn) {
  html = html.replace(/contact\.html""/g, 'contact.html"');
  const langItem = isEn
    ? '<li><a href="index.html">KO</a></li>'
    : '<li><a href="index-en.html">EN</a></li>';
  if (html.includes('index-en.html">EN') || html.includes('index.html">KO')) return html;
  return html.replace(
    /(<li><a href="contact[^"]*\.html"[^>]*>Contact<\/a><\/li>)/,
    `${langItem}\n    $1`
  );
}

const common = [
  ['lang="ko"', 'lang="en"'],
  ['서비스 사전 신청', 'Partner with us'],
  ['이용약관', 'Terms'],
  ['개인정보처리방침', 'Privacy'],
  ['contact@gigcareer.kr', 'rlgpdud5@gmail.com'],
];

const indexRepl = [
  ['<title>GigCareer — Opportunity beyond Seoul</title>', '<title>GigCareer — Verified Regional Talent Infrastructure</title>'],
  ['GigCareer × D-GIG Platform — 대전·충청권', 'GigCareer × D-GIG — Regional Talent Infrastructure'],
  ['<span class="italic">Seoul.</span>', '<span class="italic">by geography.</span>'],
  ['      beyond<br>', '      isn\'t limited<br>'],
  ['      Opportunity<br>', '      Opportunity<br>'],
  ['물리적 거리가 기회의 한계가 되지 않도록.<br>\n      지역의 잠재력과 청년의 역량을 데이터로 증명하는<br>새로운 생태계를 엽니다.', 'GigCareer builds proof-of-work infrastructure that turns regional project experience into portable, employer-trusted credentials — enabling remote-ready talent pipelines beyond capital-city hubs.'],
  ['은 AI가 대체합니다.<br>\n      이제 시장이 요구하는 것은&nbsp;', 'are being automated.<br>\n      What employers need now:&nbsp;'],
  ['data-suffix="명"', 'data-suffix="×"'],
  ['D-GIG 서비스 알아보기', 'Explore the platform'],
  ['인구 유출 심층 리포트 보기 →', 'View market thesis →'],
  ['대전 대졸자 타 지역 유출률', 'Pilot: graduate outflow rate'],
  ['인문·사회계열 일자리당 경쟁자', 'Pilot: jobs per candidate'],
  ['학습·고용 기록 자산화', 'LER credential layer'],
  ['인프라는 충분하지만,<br>기회는 <span class="italic">엇갈리고</span> 있습니다.', 'Strong regional assets.<br><span class="italic">Misaligned</span> opportunity.'],
  ['충분한 연구 인프라와 대학 자원에도 불구하고, 청년 인재의 절반 이상이 초기 경력 단계에서 수도권으로 이탈합니다. 지역 생태계는 인재 배출 기지로만 기능합니다.', 'In our pilot market (Korea\'s Daejeon–Chungcheong region), a majority of university graduates leave for capital cities early in their careers — despite strong R&D and university density. The region exports talent instead of retaining verified work history.'],
  ['인문·사회계열 일자리 1개당 경쟁자 수', 'Applicants per role (non-STEM cohorts)'],
  ['이공계(구인배수 1.08)와 달리 인문·사회계열 구직자는 극심한 초과공급 상태에 놓여 있습니다. 미스매치는 학과가 아닌 구조적 시스템의 문제입니다.', 'This is not a major-specific issue — it is a structural verification gap. Employers cannot assess proof-of-work; candidates cannot prove capability without capital-city networks.'],
  ['청년들은 성장할 수 있는 일자리를 원하고, 지역 기업은 실무에 투입할 인재를 찾지 못합니다. 단순한 \'매칭\' 플랫폼으로는 이 구조적 미스매치를 해결할 수 없습니다. 문제의 핵심은 <strong style="color:var(--black); font-weight:600;">검증 시스템의 부재</strong>입니다.', 'Youth want pathways to build capability; regional employers need deployable talent. Job boards optimize for credentials, not verified outcomes. The missing layer is <strong style="color:var(--black); font-weight:600;">trusted proof-of-work infrastructure</strong> — which we call LER (Learning & Employment Records).'],
  ['AI 시대, \'이력서\'보다<br>\'실무 경험\'이 <span class="italic">생존의 기준</span>입니다.', 'In the AI economy,<br><span class="italic">proof beats pedigree.</span>'],
  ['단순 행정 보조', 'Routine admin tasks'],
  ['기초 자료 조사', 'Basic research'],
  ['반복 데이터 입력', 'Data entry'],
  ['비정형 문제 해결 경험', 'Non-routine problem solving'],
  ['검증된 실무 데이터', 'Verified work records'],
  ['LER 포트폴리오', 'LER portfolios'],
  ['주니어 직무의 소멸', 'Junior tasks are automating'],
  ['생성형 AI의 도입으로 기초 행정, 단순 지식 노동 등 주니어가 경험을 쌓던 직무가 빠르게 소멸하고 있습니다. 실무를 배우며 성장하던 사수-신입 시스템이 붕괴했습니다.', 'Generative AI is compressing entry-level knowledge work. The traditional apprentice model for building experience is breaking — increasing demand for verifiable, project-based proof.'],
  ['스펙 → 증명의 시대', 'Credentials → proof'],
  ['학위와 자격증으로는 채용 리스크를 낮출 수 없습니다. 기업은 텍스트로 된 이력서가 아닌, 실제 문제를 해결해 본 데이터를 요구합니다.', 'Degrees alone no longer de-risk hiring. Employers increasingly require evidence of outcomes — not self-reported resumes.'],
  ['지역 청년의 이중 불평등', 'Regional double bind'],
  ['기회의 부재와 검증 시스템의 공백. 지역 청년들은 경험을 쌓을 로컬 생태계조차 없이 수도권 인재들과 동일 선상에서 경쟁합니다.', 'Without local proof-of-work rails, regional talent competes globally with no portable evidence — a pattern repeated in secondary cities worldwide.'],
  ['로컬에서의 경험을<br><span class="italic">글로벌 커리어</span>로 자산화하다.', 'Turn regional work into<br><span class="italic">global credentials.</span>'],
  ['D-GIG는 지역 기업과 청년을 연결하는 로컬 긱 플랫폼입니다. 크몽이나 잡코리아가 해결하지 못한 \'포트폴리오 부재\'와 \'스펙 중심 필터링\'의 한계를 넘어섭니다.', 'D-GIG is a three-layer infrastructure: local project marketplace, LER verification, and skills-based matching. It is designed to scale across regions — Korea is our controlled pilot.'],
  ['로컬 긱 매칭', 'Local Gig'],
  ['지역 기업 및 대학의 단기 실무 프로젝트를 수행하며 진짜 경험을 쌓습니다. 실제 비즈니스 문제를 해결한 결과물이 만들어집니다.', 'Short-cycle regional projects produce real deliverables — not simulated coursework — creating auditable work history.'],
  ['경험의 자산화', 'LER layer'],
  ['프로젝트 수행 과정과 결과가 신뢰할 수 있는 학습·고용 기록(LER) 데이터로 저장됩니다. 스킬을 수치화하고 검증된 포트폴리오가 자동 생성됩니다.', 'Outcomes, skills, and reviewer signals are encoded as Learning & Employment Records — portable across employers and markets.'],
  ['글로벌 연계', 'Global match'],
  ['검증된 실무 데이터를 바탕으로 수도권 및 글로벌 기업의 스킬 기반 채용과 연결됩니다. 지역에 머물면서 글로벌 커리어를 시작할 수 있습니다.', 'Verified records unlock remote and skills-based hiring — decoupling opportunity from relocation.'],
  ['대전 스타트업 마케팅 데이터 분석 (4주)', 'Regional startup · marketing analytics (4 wks)'],
  ['서울 핀테크 스타트업 (원격 계약직)', 'Fintech startup · remote contract (matched)'],
  ['누구를 위한<br><span class="italic">플랫폼</span>인가.', 'Built for<br><span class="italic">who scales.</span>'],
  ['For Youth — 청년', 'For Workforce Partners'],
  ['첫 커리어의 시작,<br>D-GIG에서 <span class="italic">증명하세요.</span>', 'Pipeline infrastructure<br>for <span class="italic">regional talent.</span>'],
  ['포트폴리오가 없는 초기 진입자도 로컬 프로젝트를 통해 <strong>확실한 실무 레퍼런스</strong>를 구축할 수 있습니다. 이력서 한 줄이 아닌, 검증된 LER 데이터로 글로벌 채용 시장의 문을 여세요. 수도권으로 이주하지 않아도 세계와 연결됩니다.', 'Municipal workforce programs, universities, and regional employers gain a shared verification layer — reducing friction between training spend and hireable outcomes.'],
  ['For Business — 기업', 'For Enterprise & Investors'],
  ['학위보다 확실한<br><span class="italic">실무 데이터</span>로 채용하세요.', 'De-risk hiring with<br><span class="italic">verified work data.</span>'],
  ['채용 실패 리스크를 줄이고, 즉시 투입 가능한 인재를 <strong>LER 기반으로 매칭</strong>받으세요. 실무 역량 검증 신뢰도 상승은 채용 비용 절감과 온보딩 성공률 향상으로 직결됩니다.', 'Enterprises reduce screening cost; investors gain exposure to infrastructure with measurable unit economics in a large, repeatable labor-market inefficiency.'],
  ['지역의 가치를<br>재발견하는 여정에<br><span class="italic">함께하세요.</span>', 'Partner with us to<br>scale verified regional<br><span class="italic">talent rails.</span>'],
  ['D-GIG 플랫폼 도입, 지자체 협력, B2B 제휴 문의를 받고 있습니다. 대전·충청 지역 노동시장 심층 분석 리포트도 무료로 받아보실 수 있습니다.', 'We are raising pilot partnerships with enterprises, workforce agencies, and strategic investors. Request the investor deck, pilot metrics, or a partnership call.'],
  ['D-GIG 파트너십 문의하기', 'Request investor deck'],
  ['노동시장 분석 리포트 →', 'Book a partnership call →'],
  ['Opportunity beyond Seoul.', 'Verified regional talent infrastructure.'],
  ['(주)GigCareer &nbsp;|&nbsp; 대전광역시 유성구 [상세 주소]<br>\n      대표자: 김트리 &nbsp;|&nbsp; 사업자등록번호: 000-00-00000<br>\n      이메일: contact@gigcareer.kr', 'GigCareer Inc. &nbsp;|&nbsp; Pilot HQ: Daejeon, Korea<br>\n      Founder: Hye-Young Kim &nbsp;|&nbsp; contact@gigcareer.kr'],
  ['© 2025 GigCareer Inc. All rights reserved.', '© 2026 GigCareer Inc. All rights reserved.'],
];

const aboutRepl = [
  ['<title>About Us — GigCareer</title>', '<title>About — GigCareer | Investor Brief</title>'],
  ['(주)GigCareer — 대전광역시 · 2026 설립', 'GigCareer Inc. — Founded 2026 · Pilot market: Korea'],
  ['우리는 지역의<br>가치를 재발견합니다.', 'Building rails for<br>regional talent.'],
  ['지방 소멸과 청년 일자리 미스매치 문제를 데이터와 기술로 해결합니다. 누구나 자신이 머무는 곳에서 최고의 글로벌 커리어를 쌓을 수 있는 생태계를 만들어갑니다.', 'We are building infrastructure that converts regional project work into verified, portable credentials — starting with a controlled pilot in Korea, designed to scale globally.'],
  ['우리가 <span class="it">존재하는 이유</span>', 'Why we <span class="it">exist</span>'],
  ['Mission — 미션', 'Mission'],
  ['데이터와 기술로<br><span class="it">미스매치를 해결한다.</span>', 'Close the verification gap<br><span class="it">with data rails.</span>'],
  ['지방 소멸과 청년 일자리 미스매치 문제를 <strong>데이터와 기술로 해결</strong>합니다. 단순한 일자리 중개가 아닌, 구조적 문제의 근본 원인인 \'검증 시스템의 부재\'를 LER 기술로 채웁니다.', 'Labor markets fail when work cannot be verified. We encode project outcomes as Learning & Employment Records (LER) — infrastructure, not another job board.'],
  ['Vision — 비전', 'Vision'],
  ['머무는 곳에서<br><span class="it">글로벌 커리어를.</span>', 'Global careers<br><span class="it">without relocation.</span>'],
  ['누구나 <strong>자신이 머무는 곳에서 최고의 글로벌 커리어</strong>를 쌓을 수 있는 생태계를 구축합니다. 물리적 거리가 기회의 한계가 되지 않는 세상을 만듭니다.', 'A world where geography does not cap opportunity — because proof-of-work travels.'],
  ['왜 <span class="it">시작했는가</span>', 'Why we <span class="it">started</span>'],
  ['자산화의 사다리,<br><span class="it">LER을 만들다.</span>', 'The missing layer:<br><span class="it">verified work rails.</span>'],
  ['대전에서 공부하고, 대전에서 성장하고 싶었던 청년들이 있습니다. 그들은 열심히 공부했고, 역량도 있었습니다. 그러나 이를 증명할 방법이 없었습니다.', 'Our founder saw a repeatable pattern: capable people in secondary cities with no portable proof-of-work — filtered out by credential-centric platforms built for capital hubs.'],
  ['크몽에서는 레퍼런스가 없어 일을 받지 못했고, 잡코리아에서는 지방 출신이라는 이유로 필터링됐습니다. 청년일자리 사업에 참여했지만 이력서 한 줄도 남지 않았습니다.', 'Gig marketplaces require existing portfolios. National job boards optimize for pedigree. Public programs often leave no durable hireable record.'],
  ['GigCareer는 이 문제를 해결하기 위해 설립됐습니다. <strong>단순한 일자리 중개가 아닌, 청년들이 로컬에서 주도적으로 경험을 쌓고 성장할 수 있는 \'자산화의 사다리(LER)\'</strong>를 제공하기 위해서입니다.', 'GigCareer exists to own the verification layer: <strong>local projects → LER records → skills-based matching</strong>. Korea is the pilot; the model is region-agnostic.'],
  ['로컬에서 쌓은 모든 경험은 데이터가 되고, 그 데이터는 글로벌 커리어로 이어집니다. 우리는 그 연결고리를 만듭니다.', 'We connect workforce agencies, enterprises, and capital around a shared data standard for employability.'],
  ['설립 연도', 'Founded'],
  ['대전광역시를 거점으로, 지역 청년 일자리 문제 해결을 목표로 창업.', 'Incorporated to validate the model in a dense university + industry corridor.'],
  ['핵심 플랫폼', 'Core product'],
  ['Local Gig × LER Data × Global Match 3단계 생태계. MVP 개발 진행 중.', 'D-GIG: Local Gig → LER → Global Match. MVP live with role-based demo.'],
  ['핵심 기술 철학', 'Core IP'],
  ['Learning & Employment Record. 비정형 경험을 검증 가능한 커리어 자산으로 전환.', 'LER protocol turns project outcomes into portable, auditable credentials.'],
  ['우리가 믿는 <span class="it">원칙들</span>', 'Operating <span class="it">principles</span>'],
  ['데이터로 증명한다', 'Proof over claims'],
  ['주장이 아닌 데이터로 말합니다. 모든 실무 경험은 측정되고 기록되며, 그 기록이 신뢰의 근거가 됩니다.', 'Every outcome is measurable, reviewable, and portable — the basis for B2B and institutional trust.'],
  ['로컬에서 시작한다', 'Pilot locally, scale globally'],
  ['글로벌을 꿈꾸되, 로컬에서 시작합니다. 지역의 문제를 해결하는 과정이 곧 글로벌 커리어의 출발점입니다.', 'We validate in a controlled regional pilot before expanding to additional labor markets.'],
  ['구조를 바꾼다', 'Fix the rails, not symptoms'],
  ['증상이 아닌 구조를 바꿉니다. 일회성 지원이 아닌, 지속 가능한 생태계를 설계합니다.', 'We build durable infrastructure — not one-off programs with no hireable artifact.'],
  ['대전에서 <span class="it">시작합니다</span>', 'Pilot market: <span class="it">Korea</span>'],
  ['본사 & 오시는 길', 'Headquarters'],
  ['주소', 'Address'],
  ['대전광역시 유성구 [상세 주소]<br>(카이스트·충남대 인근)', 'Daejeon, Republic of Korea<br>(University & industry corridor)'],
  ['대표', 'Founder'],
  ['김트리', 'Hye-Young Kim'],
  ['사업자', 'Business ID'],
  ['이메일', 'Email'],
  ['운영시간', 'Hours'],
  ['평일 09:00 — 18:00<br>(주말·공휴일 휴무)', 'Mon–Fri 09:00–18:00 KST'],
  ['지도 API 연동 예정<br>카카오맵 / 네이버지도 연동 후 실제 위치가 표시됩니다.', 'Map integration planned'],
  ['함께하고 싶으신가요?<br><span class="it">파트너십 문의를 남겨주세요.</span>', 'Investor or enterprise partner?<br><span class="it">Let\'s talk.</span>'],
  ['파트너십 문의하기 →', 'Request deck →'],
];

const serviceRepl = [
  ['<title>D-GIG Service — GigCareer</title>', '<title>D-GIG Platform — GigCareer</title>'],
  ['실무 경험이<br>스펙이 되는<br><span class="it">로컬 긱 플랫폼,</span><br>D-GIG', 'Proof-of-work<br>infrastructure<br><span class="it">for regions,</span><br>D-GIG'],
  ['크몽도, 잡코리아도 해결하지 못한 \'포트폴리오 부재\'와 \'스펙 중심 필터링\'의 한계를 넘어섭니다. 로컬에서 쌓은 실무 경험이 글로벌 커리어 자산이 됩니다.', 'A three-layer stack for investors: marketplace (Local Gig), verification (LER), and distribution (Global Match). Built to integrate with workforce agencies and enterprise hiring workflows.'],
  ['현재 매칭된 Gig', 'Active gig (demo)'],
  ['대전 스타트업 · 마케팅 데이터 분석', 'Regional startup · analytics project'],
  ['LER 인증 스킬', 'Verified skills'],
  ['LER 신뢰 점수', 'LER trust score'],
  ['매칭 추천 포지션', 'Matched role (demo)'],
  ['누구를 위한 <span class="it">플랫폼</span>인가.', 'Platform <span class="it">architecture</span>'],
  ['D-GIG는 구직자(청년)와 구인자(기업) 양측 모두에게 기존 플랫폼이 해결하지 못했던 문제를 해결합니다.', 'Dual-sided value: supply (regional talent) and demand (enterprises + institutions) connected through verified records.'],
  ['For Youth — 청년', 'Supply side'],
  ['For Business — 기업', 'Demand side'],
  ['로컬 Gig<br>탐색 & 매칭', 'Local gig<br>marketplace'],
  ['지역 내 숨어 있는 단기 실무 프로젝트를 조건별로 탐색하고 매칭합니다. 업종·기간·보상 조건을 필터링해 나에게 맞는 첫 Gig를 찾아보세요.', 'Project intake from regional employers and institutions — scoped, short-cycle, outcome-defined.'],
  ['LER 인증<br>배지 획득', 'LER<br>verification'],
  ['업무 수행 후 블록체인/데이터 기반의 LER(학습·고용 기록) 인증 배지가 발급됩니다. 프로젝트 결과물, 평가, 스킬 레벨이 모두 기록으로 남습니다.', 'Reviewer signals, deliverables, and skill tags become portable credentials — the core IP moat.'],
  ['글로벌 포트폴리오<br>자동 완성', 'Matching<br>layer'],
  ['누적된 LER 데이터를 기반으로 글로벌·수도권 원격 근무용 포트폴리오가 자동으로 완성됩니다. 이력서 한 줄이 아닌, 검증된 데이터로 지원하세요.', 'Skills-based matching for remote and contract roles — API-ready for HR systems.'],
  ['실무 데이터<br>기반 인재 검색', 'LER-based<br>talent search'],
  ['학력·자격증이 아닌 \'실제 수행한 유사 프로젝트(LER)\' 데이터를 기반으로 인재를 검색합니다. 채용 전 검증이 끝난 인재만 만납니다.', 'Search by verified project similarity — reducing screening cost and mis-hire risk.'],
  ['로컬 인재<br>유연 조달', 'Flexible<br>regional staffing'],
  ['검증된 로컬 인재를 필요한 기간만큼 유연하게 조달합니다. 정규직 부담 없이 단기·프로젝트 단위 채용으로 비용을 최적화하세요.', 'Project-based talent deployment for enterprises and agencies — measurable utilization.'],
  ['채용 리스크<br>제로화', 'Risk<br>reduction'],
  ['긱 워커의 이전 평가 및 업무 완수율 데이터를 통해 채용 리스크를 최소화합니다. LER 신뢰 점수 기반의 객관적 검증 시스템을 제공합니다.', 'Trust scores aggregate completion, review, and skill verification — auditable for compliance.'],
  ['D-GIG <span class="it">이용 방법</span>', 'Go-to-market <span class="it">flywheel</span>'],
  ['4단계의 간단한 과정으로 첫 번째 LER을 기록하세요.', 'Four steps from pilot project to portable credential.'],
  ['프로필 등록', 'Onboard supply'],
  ['기술 스택, 관심 분야, 가용 시간을 입력해 D-GIG 프로필을 생성합니다. 처음이어도 괜찮습니다.', 'Talent and enterprise profiles with skills, availability, and project constraints.'],
  ['조건 맞춤형 긱 매칭', 'Match projects'],
  ['AI 매칭 알고리즘이 나의 스킬과 관심사에 맞는 로컬 Gig를 추천합니다. 업종·기간·보상 조건 필터링 가능.', 'Matching engine ranks fit by skills, geography, and outcome history.'],
  ['스마트 계약 & 업무 수행', 'Execute & record'],
  ['스마트 계약 기반의 투명한 계약 후 업무를 수행합니다. 진행 상황과 결과물이 모두 플랫폼에 기록됩니다.', 'Work artifacts and milestones captured on-platform — source data for LER.'],
  ['정산 및 LER 기록', 'Verify & match'],
  ['프로젝트 완료 후 즉시 정산되며, 검증된 LER 인증 배지가 자동 발급됩니다. 내 커리어 자산이 하나씩 쌓입니다.', 'Completion triggers LER issuance and unlocks downstream matching — network effects.'],
  ['지금 바로 D-GIG MVP에서<br>당신의 첫 <span class="it">LER을 기록하세요.</span>', 'MVP is live.<br><span class="it">Request a walkthrough.</span>'],
  ['포트폴리오가 없어도 됩니다. 첫 번째 로컬 Gig가 당신의 커리어 자산의 시작이 됩니다.', 'Book a demo for investors and enterprise partners — including role-based MVP flows.'],
  ['D-GIG 시작하기 →', 'View MVP demo →'],
];

const contactRepl = [
  ['<title>Contact — GigCareer</title>', '<title>Partnership & Investment — GigCareer</title>'],
  ['청년과 로컬,<br>그리고 글로벌을 잇는<br><span class="it">여정에 함께하세요.</span>', 'Investors &<br>enterprise partners<br><span class="it">welcome.</span>'],
  ['D-GIG 플랫폼 도입, 지자체 협력, B2B 제휴 문의를 받고 있습니다. 어떤 형태의 협력이든 환영합니다.', 'Request the investor deck, pilot metrics, or a partnership discussion. We respond within 1–2 business days.'],
  ['빠른 <span class="it">문의</span>', 'Get in <span class="it">touch</span>'],
  ['회사 / 기관명', 'Company / Organization'],
  ['(주)회사명 또는 기관명', 'Company or fund name'],
  ['담당자 성함', 'Contact name'],
  ['홍길동', 'Jane Doe'],
  ['연락처', 'Phone'],
  ['이메일', 'Email'],
  ['문의 유형', 'Inquiry type'],
  ['문의 유형을 선택해주세요', 'Select inquiry type'],
  ['로컬 프로젝트 구인 문의 (기업 → D-GIG)', 'Enterprise pilot partnership'],
  ['B2B 채용 파트너십 (수도권·글로벌 기업)', 'B2B / HR integration'],
  ['지자체 및 대학 제휴', 'Government / university partnership'],
  ['투자 및 기타 문의', 'Investment & other'],
  ['문의 내용', 'Message'],
  ['문의하실 내용을 자유롭게 작성해주세요.', 'Tell us about your interest — investment, pilot, or partnership.'],
  ['개인정보 수집 및 이용', 'Privacy policy'],
  ['에 동의합니다. 수집된 정보는 문의 처리 목적으로만 사용되며, 처리 완료 후 즉시 파기됩니다.', ' — I agree. Data is used only to respond to this inquiry.'],
  ['문의 제출하기', 'Submit inquiry'],
  ['문의가 접수되었습니다.', 'Inquiry received.'],
  ['영업일 기준 1-2일 내로 담당자가 연락드리겠습니다.', 'We will respond within 1–2 business days.'],
  ['전화', 'Phone'],
  ['기업', 'Enterprise'],
  ['로컬 인재 채용 · D-GIG 플랫폼 도입', 'Hiring pilots · platform adoption'],
  ['지자체', 'Government'],
  ['청년 일자리 사업 · LER 생태계 구축', 'Workforce programs · LER rails'],
  ['대학', 'University'],
  ['산학협력 · 학생 LER 인증 프로그램', 'LER credential programs'],
  ['투자', 'Investment'],
  ['IR 자료 요청 · 미팅 문의', 'Deck request · meeting'],
  ['법인명', 'Legal entity'],
  ['(주)GigCareer', 'GigCareer Inc.'],
  ['주소', 'Address'],
  ['대전광역시 유성구 [상세 주소]', 'Daejeon, Republic of Korea'],
  ['자주 묻는 <span class="it">질문</span>', 'FAQ'],
];

const insightsRepl = [
  ['<title>Insights — GigCareer</title>', '<title>Market Thesis — GigCareer</title>'],
  ['인사이트', 'Thesis'],
  ['노동시장', 'Labor market'],
  ['데이터로 읽는', 'Data-driven'],
  ['대전·충청권', 'Pilot market'],
];

function applyReplacements(html, list) {
  const sorted = [...list].sort((a, b) => b[0].length - a[0].length);
  for (const [from, to] of sorted) html = html.split(from).join(to);
  return html;
}

function buildEn(src, dest, extra) {
  let html = readFileSync(path.join(root, src), 'utf8');
  html = applyReplacements(html, [...common, ...extra]);
  html = fixLinks(html);
  html = injectNav(html, true);
  html = html.replace('<li><a href="index-en.html">EN</a></li>', '<li><a href="index.html">KO</a></li>');
  html = html.replace(
    /물리적 거리가 기회의 한계가 되지 않도록\.<br>\s*지역의 잠재력과 청년의 역량을 데이터로 증명하는<br>새로운 생태계를 엽니다\./g,
    'GigCareer builds proof-of-work infrastructure that turns regional project experience into portable, employer-trusted credentials — enabling remote-ready talent pipelines beyond capital-city hubs.'
  );
  html = html.replace(/은 AI가 대체합니다\.<br>\s*이제 시장이 요구하는 것은&nbsp;/g, ' are being automated.<br>\n      What employers need now:&nbsp;');
  html = html.replace(/LER portfolios<\/span>입니다\./g, 'LER portfolios</span>.');
  html = html.replace(
    /\(주\)GigCareer &nbsp;\|&nbsp; 대전광역시 유성구 \[상세 주소\]<br>\s*대표자: 김트리 &nbsp;\|&nbsp; 사업자등록번호: 000-00-00000<br>\s*이메일: rlgpdud5@gmail\.com/g,
    'GigCareer Inc. &nbsp;|&nbsp; Pilot HQ: Daejeon, Korea<br>\n      Founder: Hye-Young Kim &nbsp;|&nbsp; rlgpdud5@gmail.com'
  );
  writeFileSync(path.join(enSourceDir, dest), html, 'utf8');
  console.log('wrote sources/en/' + dest);
}

buildEn('ko/index.html', 'index.html', indexRepl);
buildEn('about.html', 'about.html', aboutRepl);
buildEn('service.html', 'service.html', serviceRepl);
buildEn('insights.html', 'insights.html', insightsRepl);
buildEn('contact.html', 'contact.html', contactRepl);
console.log('investor EN sources ready');
