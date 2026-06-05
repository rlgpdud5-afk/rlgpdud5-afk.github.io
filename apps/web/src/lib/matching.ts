import type { Gig, Worker } from './types';

export function matchScore(worker: Worker, gig: Gig): number {
  let s = 0;
  const overlap = (worker.tags || []).filter((t) =>
    (gig.tags || []).some((gt) => gt.includes(t) || t.includes(gt)),
  );
  s += overlap.length * 22;
  if (
    (worker.regions || []).includes(gig.region) ||
    gig.region === '원격' ||
    (worker.regions || []).includes('원격')
  ) {
    s += 28;
  }
  if (worker.duration === gig.duration || gig.duration === '협의' || worker.duration === '협의') {
    s += 12;
  }
  s += (worker.rating || 0) * 5 + Math.min((worker.completed || 0) * 2, 14);
  return Math.round(Math.min(s, 100));
}

function extractKeywords(text: string): string[] {
  const pool = [
    '바리스타',
    '프론트엔드',
    'React',
    'UX',
    '리서치',
    '번역',
    '이벤트',
    '데이터',
    '영상',
    'CS',
    '마케팅',
    '영어',
    '카페',
    'UI',
    '컴포넌트',
  ];
  return pool.filter((k) => text.includes(k) || text.toLowerCase().includes(k.toLowerCase()));
}

export function tailorSummary(worker: Worker, gig: Gig, jdExtra = ''): string {
  const jd = [gig.jdText, jdExtra, gig.title, (gig.tags || []).join(' ')].filter(Boolean).join(' ');
  const keys = extractKeywords(jd);
  const top = [...(worker.tags || [])].sort((a, b) => {
    const sa = keys.some((k) => a.includes(k) || k.includes(a)) ? 1 : 0;
    const sb = keys.some((k) => b.includes(k) || k.includes(b)) ? 1 : 0;
    return sb - sa;
  });
  const hit = top.filter((t) => keys.some((k) => t.includes(k) || k.includes(t)));
  return (
    `[AI 맞춤 · ${gig.employer}] ${worker.name} — ` +
    (hit.length
      ? `${hit.join(', ')} 역량을 공고 키워드(${keys.slice(0, 4).join(', ')})에 맞게 상단 배치. `
      : '') +
    `${gig.title}에 ${worker.completed || 0}건의 검증된 긱 수행·평점 ${worker.rating}으로 지원합니다.`
  );
}
