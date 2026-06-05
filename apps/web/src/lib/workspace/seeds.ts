import type { Locale } from '../../context/I18nContext';
import { en } from '../../i18n/en';
import { es } from '../../i18n/es';
import { ko, type Messages } from '../../i18n/ko';
import { zh } from '../../i18n/zh';
import type { WorkspaceFile } from './store';

const MESSAGES: Record<Locale, Messages> = { ko, en, zh, es };

const LEGACY_KO_CLIENT = '폐쇄망 — 외부 전송 금지';
const LEGACY_KO_README = 'VS Code 단축키';

export function buildDefaultFiles(locale: Locale): WorkspaceFile[] {
  const s = MESSAGES[locale].workspace.seeds;
  return [
    { id: 'f1', name: 'api/client.ts', content: s.clientTs, taskId: 'st2' },
    { id: 'f2', name: 'scripts/verify-ler.ts', content: s.verifyLerTs, taskId: 'st3' },
    { id: 'f3', name: 'README.local.md', content: s.readmeLocal, taskId: undefined },
    { id: 'f4', name: 'migrations/001.sql', content: s.sqlMigration, taskId: 'st5' },
  ];
}

export function getBrowserSeedMap(locale: Locale): Record<string, Record<string, string>> {
  const s = MESSAGES[locale].workspace.seeds;
  return {
    st2: { 'api/client.ts': s.clientTs },
    st3: { 'scripts/verify-ler.ts': s.verifyLerTs },
    st5: { 'migrations/001.sql': s.sqlMigration },
  };
}

export function migrateSeedFiles(files: WorkspaceFile[], locale: Locale): WorkspaceFile[] {
  const byName = Object.fromEntries(buildDefaultFiles(locale).map((f) => [f.name, f.content]));
  return files.map((file) => {
    if (locale !== 'ko' && file.name === 'api/client.ts' && file.content.includes(LEGACY_KO_CLIENT)) {
      return { ...file, content: byName['api/client.ts'] };
    }
    if (locale !== 'ko' && file.name === 'README.local.md' && file.content.includes(LEGACY_KO_README)) {
      return { ...file, content: byName['README.local.md'] };
    }
    return file;
  });
}

export function clearLegacyVfs(locale: Locale) {
  if (locale === 'ko' || typeof localStorage === 'undefined') return;
  try {
    const raw = localStorage.getItem('dgig-code-vfs-st2');
    if (raw?.includes(LEGACY_KO_CLIENT)) {
      localStorage.removeItem('dgig-code-vfs-st2');
    }
  } catch {
    /* ignore */
  }
}
