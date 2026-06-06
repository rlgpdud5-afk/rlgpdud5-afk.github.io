import { useMemo } from 'react';
import { useI18n, type Locale } from '../context/I18nContext';
import type { CrewUser } from '../lib/crew/types';
import type { Worker } from '../lib/types';

/** 데모 데이터 한글 표기 → 영문 UI 표기 (내부 ID/매칭은 한글 유지) */
const NAME_EN: Record<string, string> = {
  김서연: 'Seoyeon Kim',
  김민수: 'Minsu Kim',
  이준혁: 'Junhyuk Lee',
  박민수: 'Minsu Park',
  최유나: 'Yuna Choi',
  정하늘: 'Haneul Jung',
  한소희: 'Sohee Han',
  운영자: 'Admin',
  '(주)로컬테크': 'LocalTech Inc.',
  로컬테크: 'LocalTech',
};

const REGION_EN: Record<string, string> = {
  대전: 'Daejeon',
  세종: 'Sejong',
  청주: 'Cheongju',
  제주: 'Jeju',
  원격: 'Remote',
};

const PROJECT_EN: Record<string, string> = {
  '대전 스타트업 마케팅 데이터 분석': 'Daejeon startup · marketing analytics',
  '로컬푸드 쇼핑몰 리뉴얼': 'Local Food Mall Renewal',
  '세종시 관광 데이터 정리': 'Sejong Tourism Data Cleanup',
  '스타트업 IR 자료 디자인': 'Startup IR Deck Design',
  '마케팅 리서치 보고서': 'Marketing Research Report',
  '교육 앱 UX 리서치': 'Education App UX Research',
};

const MODULE_EN: Record<string, string> = {
  '랜딩페이지': 'Landing page',
  '상품 카드 UI': 'Product card UI',
  '검색 필터': 'Search filters',
  '데이터 수집': 'Data collection',
  정제: 'Cleaning',
  시각화: 'Visualization',
  '슬라이드 디자인': 'Slide design',
  인포그래픽: 'Infographic',
  컴포넌트: 'Components',
  반응형: 'Responsive',
  'UX 리서치': 'UX research',
  인터뷰: 'Interviews',
  '사용자 조사': 'User research',
  분석: 'Analysis',
  '데이터 분석': 'Data analysis',
  '데이터 정리': 'Data cleanup',
};

const TASK_EN: Record<string, string> = {
  '마케팅 데이터 분석·시각화': 'Marketing analytics · visualization',
  '메인 히어로 섹션 퍼블리싱': 'Main hero section publishing',
  '상품 카드 컴포넌트 제작': 'Product card component',
  '반응형 레이아웃 적용': 'Responsive layout',
  '검색 필터 UI 구현': 'Search filter UI',
  '설문 데이터 분석': 'Survey data analysis',
  '사용자 인터뷰 정리': 'User interview synthesis',
};

const COMPANY_EN: Record<string, string> = {
  '대전 헬스테크': 'Daejeon HealthTech',
  '서울 핀테크': 'Seoul Fintech',
  '충남대 산학협력단': 'Chungnam Univ. Industry-Academia',
  '(주)로컬테크': 'LocalTech Inc.',
  로컬테크: 'LocalTech',
  세종시청: 'Sejong City Hall',
  넥스트랩: 'NextLab',
  에듀플러스: 'EduPlus',
  '제주 카페 모모': 'Jeju Cafe Momo',
};

const GIG_EN: Record<string, string> = {
  '마케팅 데이터 분석 (4주)': 'Marketing analytics (4 wks)',
  '원격 계약직 (스킬 매칭)': 'Remote contract (skill match)',
  '지역 기업 UX 리서치 보조': 'Regional UX research support',
  '바리스타 2주 긱 (오전)': 'Barista gig · 2 weeks (morning)',
  '쇼핑몰 React UI 3주': 'Shopping mall React UI · 3 weeks',
  '바리스타': 'Barista',
  '영어 가능': 'English',
  'CS·응대': 'Customer service',
  '프론트엔드': 'Frontend',
  '데이터 정리': 'Data cleanup',
  '제주 카페 바리스타. 영어 가능 우대.': 'Jeju cafe barista. English preferred.',
  'React 컴포넌트·쇼핑몰 UI.': 'React components · shopping mall UI.',
  '2주': '2 weeks',
  '1개월': '1 month',
  '시급 1.2만': '₩12,000/hr',
  '300만': '₩3M',
  'React API 연동': 'React API integration',
  'LER 검증 스크립트': 'LER verification script',
  '상품 카드 UI': 'Product card UI',
  '1주': '1 week',
  협의: 'TBD',
  '데이터 분석': 'Data analysis',
  Figma: 'Figma',
  카피라이팅: 'Copywriting',
};

const NAME_ZH: Record<string, string> = {
  김서연: '金瑞妍',
  김민수: '金敏秀',
  이준혁: '李俊赫',
  박민수: '朴敏秀',
  최유나: '崔裕娜',
  정하늘: '郑天空',
  한소희: '韩素希',
  운영자: '管理员',
};

const REGION_ZH: Record<string, string> = {
  대전: '大田',
  세종: '世宗',
  청주: '清州',
  제주: '济州',
  원격: '远程',
};

const PROJECT_ZH: Record<string, string> = {
  '대전 스타트업 마케팅 데이터 분석': '大田初创企业营销数据分析',
  '로컬푸드 쇼핑몰 리뉴얼': '本地食品商城改版',
  '세종시 관광 데이터 정리': '世宗市旅游数据整理',
  '스타트업 IR 자료 디자인': '初创企业 IR 资料设计',
  '마케팅 리서치 보고서': '营销研究报告',
  '교육 앱 UX 리서치': '教育 App UX 研究',
};

const TASK_ZH: Record<string, string> = {
  '마케팅 데이터 분석·시각화': '营销数据分析·可视化',
  '메인 히어로 섹션 퍼블리싱': '主 Hero 区块发布',
  '상품 카드 컴포넌트 제작': '商品卡片组件',
  '반응형 레이아웃 적용': '响应式布局',
  '검색 필터 UI 구현': '搜索筛选 UI',
  '설문 데이터 분석': '问卷数据分析',
  '사용자 인터뷰 정리': '用户访谈整理',
};

const COMPANY_ZH: Record<string, string> = {
  '대전 헬스테크': '大田 HealthTech',
  '서울 핀테크': '首尔金融科技',
  '충남대 산학협력단': '忠南大学产学合作团',
  '(주)로컬테크': 'LocalTech 株式会社',
  로컬테크: 'LocalTech',
  세종시청: '世宗市政府',
  넥스트랩: 'NextLab',
  에듀플러스: 'EduPlus',
};

const GIG_ZH: Record<string, string> = {
  '마케팅 데이터 분석 (4주)': '营销数据分析（4周）',
  '원격 계약직 (스킬 매칭)': '远程合同（技能匹配）',
  '지역 기업 UX 리서치 보조': '地区企业 UX 研究辅助',
  '데이터 분석': '数据分析',
  Figma: 'Figma',
  카피라이팅: '文案',
};

const NAME_ES: Record<string, string> = {
  김서연: 'Seoyeon Kim',
  김민수: 'Minsu Kim',
  이준혁: 'Junhyuk Lee',
  박민수: 'Minsu Park',
  최유나: 'Yuna Choi',
  정하늘: 'Haneul Jung',
  한소희: 'Sohee Han',
  운영자: 'Administrador',
  '(주)로컬테크': 'LocalTech S.A.',
  로컬테크: 'LocalTech',
};

const REGION_ES: Record<string, string> = {
  대전: 'Daejeon',
  세종: 'Sejong',
  청주: 'Cheongju',
  제주: 'Jeju',
  원격: 'Remoto',
};

const PROJECT_ES: Record<string, string> = {
  '대전 스타트업 마케팅 데이터 분석': 'Startup regional · analítica de marketing',
  '로컬푸드 쇼핑몰 리뉴얼': 'Renovación tienda local food',
  '세종시 관광 데이터 정리': 'Datos turísticos Sejong',
  '스타트업 IR 자료 디자인': 'Diseño material IR startup',
  '마케팅 리서치 보고서': 'Informe de investigación de marketing',
  '교육 앱 UX 리서치': 'Investigación UX app educativa',
};

const TASK_ES: Record<string, string> = {
  '마케팅 데이터 분석·시각화': 'Analítica de marketing · visualización',
  '마케팅 데이터 시각화': 'Visualización de datos de marketing',
  '메인 히어로 섹션 퍼블리싱': 'Publicación sección hero principal',
  '상품 카드 컴포넌트 제작': 'Componente tarjeta de producto',
  '반응형 레이아웃 적용': 'Layout responsive',
  '검색 필터 UI 구현': 'UI de filtros de búsqueda',
  '설문 데이터 분석': 'Análisis de datos de encuestas',
  '사용자 인터뷰 정리': 'Síntesis de entrevistas',
  'React API 연동': 'Integración API React',
  'LER 검증 스크립트': 'Script de verificación LER',
  '워커 DB 마이그레이션': 'Migración BD workers',
  'REST API 스펙 검증': 'Validación especificación REST API',
};

const COMPANY_ES: Record<string, string> = {
  '대전 헬스테크': 'HealthTech Daejeon',
  '서울 핀테크': 'Fintech Seúl',
  '충남대 산학협력단': 'Univ. Chungnam · industria-academia',
  '(주)로컬테크': 'LocalTech S.A.',
  로컬테크: 'LocalTech',
  세종시청: 'Ayuntamiento de Sejong',
  넥스트랩: 'NextLab',
  에듀플러스: 'EduPlus',
  '제주 카페 모모': 'Café Momo Jeju',
};

const GIG_ES: Record<string, string> = {
  '마케팅 데이터 분석 (4주)': 'Analítica de marketing (4 sem.)',
  '원격 계약직 (스킬 매칭)': 'Contrato remoto (match por skills)',
  '지역 기업 UX 리서치 보조': 'Apoyo investigación UX regional',
  '바리스타 2주 긱 (오전)': 'Gig barista 2 sem. (mañana)',
  '쇼핑몰 React UI 3주': 'UI React e-commerce · 3 sem.',
  '데이터 분석': 'Análisis de datos',
  Figma: 'Figma',
  카피라이팅: 'Copywriting',
  '2주': '2 sem.',
  '1개월': '1 mes',
  협의: 'A convenir',
};

function mapForLocale(
  text: string,
  locale: Locale,
  en: Record<string, string>,
  zh: Record<string, string>,
  es: Record<string, string> = {},
): string {
  if (locale === 'ko' || !text) return text;
  if (locale === 'zh') return zh[text] ?? en[text] ?? text;
  if (locale === 'es') return es[text] ?? en[text] ?? text;
  return en[text] ?? text;
}

export function localizeName(name: string, locale: Locale): string {
  return mapForLocale(name, locale, NAME_EN, NAME_ZH, NAME_ES);
}

/** AI 요약 등에 박힌 한글 이름·업체명을 영문 UI용으로 치환 */
export function localizeEmbeddedText(text: string, locale: Locale): string {
  if (locale === 'ko' || !text) return text;
  let out = text;
  const keys = [
    ...Object.keys(NAME_EN),
    ...Object.keys(NAME_ZH),
    ...Object.keys(COMPANY_EN),
    ...Object.keys(COMPANY_ZH),
    ...Object.keys(PROJECT_EN),
    ...Object.keys(PROJECT_ZH),
    ...Object.keys(TASK_EN),
    ...Object.keys(TASK_ZH),
    ...Object.keys(MODULE_EN),
    ...Object.keys(GIG_EN),
    ...Object.keys(GIG_ZH),
  ]
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((a, b) => b.length - a.length);
  for (const key of keys) {
    const mapped = mapForLocale(
      key,
      locale,
      {
        ...NAME_EN,
        ...COMPANY_EN,
        ...PROJECT_EN,
        ...TASK_EN,
        ...MODULE_EN,
        ...GIG_EN,
      },
      {
        ...NAME_ZH,
        ...COMPANY_ZH,
        ...PROJECT_ZH,
        ...TASK_ZH,
        ...GIG_ZH,
      },
      {
        ...NAME_ES,
        ...COMPANY_ES,
        ...PROJECT_ES,
        ...TASK_ES,
        ...GIG_ES,
      },
    );
    if (mapped !== key) out = out.split(key).join(mapped);
  }
  return out;
}

export function localizeStatus(status: string, locale: Locale, t: (key: string) => string): string {
  if (locale === 'ko') return status;
  const key = `crew.status.${status}`;
  const translated = t(key);
  return translated !== key ? translated : status;
}

export function localizeRegion(region: string, locale: Locale): string {
  return mapForLocale(region, locale, REGION_EN, REGION_ZH, REGION_ES);
}

export function localizeCompany(name: string, locale: Locale): string {
  if (locale === 'ko' || !name) return name;
  if (locale === 'zh') return COMPANY_ZH[name] ?? NAME_ZH[name] ?? name;
  if (locale === 'es') return COMPANY_ES[name] ?? NAME_ES[name] ?? COMPANY_EN[name] ?? name;
  return COMPANY_EN[name] ?? NAME_EN[name] ?? name;
}

export function localizeUser(user: CrewUser, locale: Locale): CrewUser {
  return {
    ...user,
    name: localizeName(user.name, locale),
    region: user.region ? localizeRegion(user.region, locale) : user.region,
  };
}

export function localizeWorker(worker: Worker, locale: Locale): Worker {
  return {
    ...worker,
    name: localizeName(worker.name, locale),
    regions: (worker.regions || []).map((r) => localizeRegion(r, locale)),
  };
}

export function formatTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? `{${key}}`);
}

/** 검색: 한·영 이름 모두 매칭 */
export function nameMatchesQuery(name: string, query: string, _locale: Locale): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  if (name.toLowerCase().includes(q)) return true;
  const en = localizeName(name, 'en').toLowerCase();
  const zh = localizeName(name, 'zh').toLowerCase();
  const es = localizeName(name, 'es').toLowerCase();
  return en.includes(q) || zh.includes(q) || es.includes(q);
}

export function useLocalize() {
  const { locale } = useI18n();

  return useMemo(
    () => ({
      locale,
      name: (n: string) => localizeName(n, locale),
      region: (r: string) => localizeRegion(r, locale),
      company: (c: string) => localizeCompany(c, locale),
      text: (s: string) => localizeEmbeddedText(s, locale),
      status: (s: string, tr: (key: string) => string) => localizeStatus(s, locale, tr),
    }),
    [locale],
  );
}
