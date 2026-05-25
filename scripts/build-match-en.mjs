import { copyFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const enSource = path.join(root, 'sources', 'en', 'gig-match.html');
const outDir = path.join(root, 'sources', 'en');
const enDir = path.join(root, 'en');

mkdirSync(outDir, { recursive: true });
mkdirSync(enDir, { recursive: true });

if (!existsSync(enSource)) {
  throw new Error('Missing sources/en/gig-match.html — maintain English gig-match there');
}

copyFileSync(enSource, path.join(outDir, 'gig-match.html'));
copyFileSync(enSource, path.join(enDir, 'gig-match.html'));

const storeEn = path.join(root, 'js', 'gig-match-store.en.js');
if (existsSync(storeEn)) {
  mkdirSync(path.join(enDir, 'js'), { recursive: true });
  copyFileSync(storeEn, path.join(enDir, 'js', 'gig-match-store.en.js'));
}

console.log('English gig-match deployed to en/ and sources/en/');
