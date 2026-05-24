import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const koDir = path.join(root, 'ko');
const enDir = path.join(root, 'en');

const koPages = ['index', 'about', 'service', 'insights', 'contact', 'experience', 'localcrew-mvp'];
const enPages = ['index', 'about', 'service', 'insights', 'contact'];

const LANG_CSS = `
    .lang-switch{display:flex;align-items:center;gap:8px;margin-left:18px;font-family:var(--f-body,var(--fb));font-size:.72rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;}
    .lang-switch a{color:var(--mid);text-decoration:none;opacity:.45;transition:opacity .16s,color .16s;}
    .lang-switch a:hover,.lang-switch a.is--on{opacity:1;color:var(--black);}
    .lang-switch span{opacity:.25;font-size:.62rem;}
`;

mkdirSync(koDir, { recursive: true });
mkdirSync(enDir, { recursive: true });

function getKoSource(page) {
  if (page === 'index') {
    const koIndex = path.join(koDir, 'index.html');
    if (existsSync(koIndex) && readFileSync(koIndex, 'utf8').includes('hero-inner')) {
      return koIndex;
    }
    throw new Error('Korean index source missing in ko/index.html');
  }
  return path.join(root, `${page}.html`);
}

function stripOldLangLinks(html) {
  return html
    .replace(/\s*<li><a href="[^"]*">(?:EN|KO)<\/a><\/li>\n?/g, '')
    .replace(/\s*<nav class="lang-switch"[\s\S]*?<\/nav>\n?/g, '');
}

function injectLangCss(html) {
  if (html.includes('.lang-switch{')) return html;
  return html.replace('</style>', `${LANG_CSS}</style>`);
}

function langSwitchHtml(lang, page) {
  const otherBase = `../${lang === 'ko' ? 'en' : 'ko'}/${page}.html`;
  if (lang === 'ko') {
    return `<nav class="lang-switch" aria-label="Language"><a href="${page}.html" class="is--on">KR</a><span>|</span><a href="${otherBase}">EN</a></nav>`;
  }
  return `<nav class="lang-switch" aria-label="Language"><a href="${otherBase}">KR</a><span>|</span><a href="${page}.html" class="is--on">EN</a></nav>`;
}

function injectLangSwitch(html, lang, page) {
  html = stripOldLangLinks(html);
  html = injectLangCss(html);
  const switcher = langSwitchHtml(lang, page);
  if (html.includes('class="gnav-logo"')) {
    return html.replace(
      /(<a href="index\.html" class="gnav-logo">[\s\S]*?<\/a>)/,
      `$1\n  ${switcher}`
    );
  }
  return html.replace(
    /(<a href="index\.html" class="logo">[\s\S]*?<\/a>)/,
    `$1\n  ${switcher}`
  );
}

function rewriteInternalLinks(html, lang) {
  if (lang === 'en') {
    return html
      .replaceAll('href="index-en.html"', 'href="index.html"')
      .replaceAll('href="about-en.html"', 'href="about.html"')
      .replaceAll('href="service-en.html"', 'href="service.html"')
      .replaceAll('href="insights-en.html"', 'href="insights.html"')
      .replaceAll('href="contact-en.html"', 'href="contact.html"');
  }
  return html
    .replaceAll('href="index-en.html"', 'href="../en/index.html"')
    .replaceAll('href="about-en.html"', 'href="../en/about.html"')
    .replaceAll('href="service-en.html"', 'href="../en/service.html"')
    .replaceAll('href="insights-en.html"', 'href="../en/insights.html"')
    .replaceAll('href="contact-en.html"', 'href="../en/contact.html"');
}

for (const page of koPages) {
  let html = readFileSync(getKoSource(page), 'utf8');
  html = rewriteInternalLinks(html, 'ko');
  html = injectLangSwitch(html, 'ko', page);
  writeFileSync(path.join(koDir, `${page}.html`), html, 'utf8');
}

for (const page of enPages) {
  const src = path.join(root, `${page}-en.html`);
  if (!existsSync(src)) throw new Error(`Missing ${src}`);
  let html = readFileSync(src, 'utf8');
  html = rewriteInternalLinks(html, 'en');
  html = injectLangSwitch(html, 'en', page);
  writeFileSync(path.join(enDir, `${page}.html`), html, 'utf8');
}

for (const asset of ['experience.html', 'localcrew-mvp.html']) {
  copyFileSync(path.join(root, asset), path.join(koDir, asset));
  copyFileSync(path.join(root, asset), path.join(enDir, asset));
}

writeFileSync(
  path.join(root, 'index.html'),
  `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="refresh" content="0; url=/ko/" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>GigCareer</title>
  <link rel="canonical" href="https://www.gigcareer.kr/ko/" />
</head>
<body>
  <script>location.replace('/ko/');</script>
  <p>Redirecting to <a href="/ko/">Korean home</a> · <a href="/en/">English home</a></p>
</body>
</html>
`,
  'utf8'
);

writeFileSync(path.join(root, '.nojekyll'), '', 'utf8');

const legacyRedirects = {
  'index-en.html': '/en/',
  'about-en.html': '/en/about.html',
  'service-en.html': '/en/service.html',
  'insights-en.html': '/en/insights.html',
  'contact-en.html': '/en/contact.html',
};

for (const [file, target] of Object.entries(legacyRedirects)) {
  writeFileSync(
    path.join(root, file),
    `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${target}"><script>location.replace('${target}');</script></head><body><a href="${target}">Continue</a></body></html>`,
    'utf8'
  );
}

console.log('ko/en structure generated with KR | EN switcher');
