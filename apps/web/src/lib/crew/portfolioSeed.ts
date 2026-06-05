export type PortTemplateKey = 'project' | 'resume' | 'career' | 'proposal';

export const PORT_TEMPLATES: {
  k: PortTemplateKey;
  name: string;
  desc: string;
}[] = [
  {
    k: 'project',
    name: '프로젝트형',
    desc: 'Behance·노션 스타일 케이스 스터디. 시각적 프로젝트 카드 중심.',
  },
  {
    k: 'resume',
    name: '지원서형',
    desc: '잡코리아·원티드형 1페이지 이력서. 요약·경력 bullet.',
  },
  {
    k: 'career',
    name: '경력기술서형',
    desc: '공공·대기업 제출용 경력기술서. 표·담당업무·성과 구조.',
  },
  {
    k: 'proposal',
    name: '제안서형',
    desc: '프리랜서·B2B 제안서. 과업·일정·검증 이력·견적.',
  },
];

export interface ApplyJob {
  id: string;
  company: string;
  title: string;
  keywords: string[];
  summary: string;
  reorder: string[];
  emphasis: string;
}

export const MOCK_APPLY_JOBS: ApplyJob[] = [
  {
    id: 'j1',
    company: '(주)로컬테크',
    title: '프론트엔드 개발 (React)',
    keywords: ['React', 'HTML/CSS', '컴포넌트', '반응형'],
    summary:
      '로컬 커머스 리뉴얼 프로젝트의 상품 UI·반응형 구현 경험을 최상단에 배치하고, React 기반 퍼블리싱 역량을 강조합니다.',
    reorder: ['c-demo', 'c1', 'c2'],
    emphasis: '프론트엔드 · UI 구현',
  },
  {
    id: 'j2',
    company: '에듀플러스',
    title: 'UX 리서치·기획 보조',
    keywords: ['UX 리서치', '인터뷰', '사용자 조사', '분석'],
    summary:
      '교육 앱 UX 리서치·인터뷰 정리 경험을 lead로 올리고, 정성·정량 분석 스킬을 키워드에 맞게 재작성합니다.',
    reorder: ['c3', 'c2', 'c1'],
    emphasis: 'UX 리서치 · 사용자 인사이트',
  },
  {
    id: 'j3',
    company: '세종시청',
    title: '데이터 정리·시각화 인턴',
    keywords: ['데이터 분석', 'Excel', '리서치', '보고서'],
    summary:
      '마케팅 리서치·설문 분석 프로젝트를 강조하고, 공공 데이터 정제·보고서 작성 적합성을 부각합니다.',
    reorder: ['c2', 'c3', 'c1'],
    emphasis: '데이터 · 리서치',
  },
];
