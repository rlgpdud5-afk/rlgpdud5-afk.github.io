import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const koDir = path.join(root, 'ko');
const enSourceDir = path.join(root, 'sources', 'en');
const enDir = path.join(root, 'en');

const koPages = ['index', 'about', 'service', 'insights', 'contact', 'experience', 'localcrew-mvp'];
const enPages = ['index', 'about', 'service', 'insights', 'contact'];

const LANG_CSS = `
    .lang-switch{display:flex;align-items:center;align-items:center;gap:8px;margin-left:18px;flex-shrink:0;font-family:var(--f-body,var(--fb));font-size:.72rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;}
    .lang-switch a{color:var(--mid);text-decoration:none;opacity:.45;transition:opacity .16s,color .16s;}
    .lang-switch a:hover,.lang-switch a.is--on{opacity:1;color:var(--black);}
    .lang-switch span{opacity:.25;font-size:.62rem;}
    nav.site-nav .nav-links, nav.site-nav .gnav-links{flex:1;min-width:0;}
`;

mkdirSync(koDir, { recursive: true });
mkdirSync(enDir, { recursive: true });

function getKoSource(page) {
  const koFile = path.join(koDir, `${page}.html`);
  if (page === 'index' && existsSync(koFile) && readFileSync(koFile, 'utf8').includes('hero-inner')) {
    return koFile;
  }
  const rootFile = path.join(root, `${page}.html`);
  if (existsSync(rootFile)) return rootFile;
  throw new Error(`Missing Korean source for ${page}`);
}

function getEnSource(page) {
  const sourceFile = path.join(enSourceDir, `${page}.html`);
  if (!existsSync(sourceFile)) {
    throw new Error(`Missing English source: sources/en/${page}.html — run build-investor-en.mjs first`);
  }
  return sourceFile;
}

function stripOldLangLinks(html) {
  return html
    .replace(/\s*<li><a href="[^"]*">(?:EN|KO|KR)<\/a><\/li>\n?/g, '')
    .replace(/\s*<(?:nav|div) class="lang-switch"[\s\S]*?<\/(?:nav|motion\.div|div)>\n?/g, '');
}

function injectLangCss(html) {
  if (html.includes('.lang-switch{')) return html;
  return html.replace('</style>', `${LANG_CSS}</style>`);
}

function fixNavSelector(html) {
  if (html.includes('class="site-nav"') || html.includes('class="gnav site-nav"')) return html;
  return html
    .replace(/<nav class="gnav">/g, '<nav class="gnav site-nav">')
    .replace(/<nav>/g, '<nav class="site-nav">')
    .replace(/\n    nav \{/g, '\n    nav.site-nav {')
    .replace(/\nnav \{/g, '\nnav.site-nav {');
}

function langSwitchHtml(lang, page) {
  const otherBase = `../${lang === 'ko' ? 'en' : 'ko'}/${page}.html`;
  if (lang === 'ko') {
    return `<div class="lang-switch" aria-label="Language"><a href="${page}.html" class="is--on">KR</a><span>|</span><a href="${otherBase}">EN</a></div>`;
  }
  return `<div class="lang-switch" aria-label="Language"><a href="${otherBase}">KR</a><span>|</span><a href="${page}.html" class="is--on">EN</a></div>`;
}

function injectLangSwitch(html, lang, page) {
  html = stripOldLangLinks(html);
  html = injectLangCss(html);
  html = fixNavSelector(html);
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
  let html = readFileSync(getEnSource(page), 'utf8');
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
</head>
<body>
  <script>location.replace('/ko/');</script>
  <p><a href="/ko/">KR</a> · <a href="/en/">EN</a></p>
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

console.log('ko/en structure generated');
