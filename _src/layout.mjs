import { SITE, NAV, INVOLVED, TOOLS } from './site.mjs';
import { esc } from '../_scripts/render.mjs';

const VERSION = '20261119';

function brand(root) {
  return `<a class="brand" href="${root || './'}" aria-label="Hello.Green home"><span>hello</span><i class="brand-dot" aria-hidden="true"></i><span>green</span></a>`;
}

function header(root, section) {
  const links = NAV.map((n) => `<li><a href="${root}${n.href}"${n.section === section ? ' aria-current="page"' : ''}>${n.label}</a></li>`).join('');
  const involved = INVOLVED.map((n) => `<li><a href="${root}${n.href}"><span>${n.label}</span><small>${n.note}</small></a></li>`).join('');
  return `
<div class="topbar"><a href="${SITE.interestLink}" target="_blank" rel="noopener">${SITE.interestText}</a></div>
<header class="site-header">
  <div class="wrap header-inner">
    ${brand(root)}
    <nav class="main-nav" id="main-nav" aria-label="Main">
      <ul class="nav-list">
        ${links}
        <li class="has-menu">
          <button class="menu-btn" type="button" aria-expanded="false" aria-controls="involved-menu">Get involved</button>
          <ul class="sub-menu" id="involved-menu">${involved}</ul>
        </li>
      </ul>
    </nav>
    <div class="header-actions">
      <button class="icon-btn" type="button" data-search-open aria-label="Search the site"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></button>
      <button class="icon-btn" type="button" data-theme-toggle aria-label="Switch dark or light mode"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg></button>
      <a class="btn btn-sun btn-sm header-cta" href="${root}quotes.html">Get free quotes</a>
      <button class="icon-btn nav-toggle" type="button" aria-expanded="false" aria-controls="main-nav" aria-label="Open menu"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
    </div>
  </div>
</header>`;
}

function footer(root) {
  const tools = TOOLS.map((t) => `<li><a href="${root}${t.href}">${t.label}</a></li>`).join('');
  const involved = INVOLVED.map((t) => `<li><a href="${root}${t.href}">${t.label}</a></li>`).join('');
  return `
<footer class="site-footer">
  <div class="wrap footer-top">
    <div class="footer-about">
      ${brand(root)}
      <p>Free tools and plain-English guides that help households cut energy bills and carbon, plus a no-pressure way to get quotes from vetted local pros.</p>
      <form class="footer-news" data-hg-form="newsletter" novalidate>
        <label for="ft-email">Get the weekly savings email</label>
        <div class="inline-field">
          <input id="ft-email" type="email" name="email" autocomplete="email" placeholder="you@example.com" required>
          <button class="btn btn-sun" type="submit">Subscribe</button>
        </div>
        <input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
        <p class="form-msg" role="status" aria-live="polite"></p>
      </form>
    </div>
    <div class="footer-cols">
      <div><h2>Save money</h2><ul>${tools}<li><a href="${root}quotes.html">Get free quotes</a></li></ul></div>
      <div><h2>Learn</h2><ul>
        <li><a href="${root}guides/">Guides</a></li>
        <li><a href="${root}incentives.html">Incentives by country</a></li>
        <li><a href="${root}glossary.html">Green glossary</a></li>
        <li><a href="${root}news.html">Green news</a></li>
        <li><a href="${root}videos.html">Videos</a></li>
        <li><a href="${root}planet.html">Planet Pulse</a></li>
      </ul></div>
      <div><h2>Get involved</h2><ul>${involved}</ul></div>
      <div><h2>Hello.Green</h2><ul>
        <li><a href="${root}about.html">About &amp; methodology</a></li>
        <li><a href="${root}contact.html">Contact</a></li>
        <li><a href="${root}privacy.html">Privacy policy</a></li>
        <li><a href="${root}terms.html">Terms of use</a></li>
        <li><a href="${root}disclosure.html">Trademark &amp; copyright disclosure</a></li>
      </ul></div>
    </div>
  </div>
  <div class="wrap footer-legal">
    <p>© <span data-year>${SITE.year}</span> Hello.Green. All rights reserved. Hello.Green is an independent publication and is not affiliated with, endorsed by or connected to any company, product or trademark named “Hello Green”, “HelloGreen” or similar. Third-party names and marks belong to their owners. <a href="${root}disclosure.html">Read the full disclosure</a>.</p>
    <p>Estimates on this site are for information only and are not financial, tax or legal advice. Check incentives with the official program before you buy.</p>
  </div>
</footer>
<div class="search-overlay" data-search hidden>
  <div class="search-box" role="dialog" aria-modal="true" aria-label="Search Hello.Green">
    <div class="search-head">
      <label class="sr" for="site-search">Search</label>
      <input id="site-search" type="search" placeholder="Search tools, guides and topics" autocomplete="off">
      <button class="icon-btn" type="button" data-search-close aria-label="Close search"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
    </div>
    <ul class="search-results" id="search-results"></ul>
  </div>
</div>
<div class="cookie-note" data-cookie hidden>
  <p>We use cookies for ads and local storage to remember your calculator inputs. <a href="${root}privacy.html">Privacy policy</a></p>
  <button class="btn btn-ghost btn-sm" type="button" data-cookie-ok>Got it</button>
</div>`;
}

export function layout(page) {
  const { root, path, title, description, section = '', body, scripts = [], schema = null, ogType = 'website', noindex = false, bodyClass = '', headStart = '' } = page;
  const canonicalPath = path.replace(/index\.html$/, '');
  const canonical = `${SITE.domain}/${canonicalPath}`;
  const fullTitle = title.includes('Hello.Green') ? title : `${title} | Hello.Green`;
  const ld = schema ? `<script type="application/ld+json">${JSON.stringify(schema)}</script>` : '';
  const extra = scripts.map((s) => `<script src="${root}${s}?v=${VERSION}" defer></script>`).join('\n');
  return `<!doctype html>
<html lang="en" data-root="${root}">
<head>
<meta charset="utf-8">
${headStart}
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">' : ''}
<link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#0f3d2e">
<meta property="og:site_name" content="Hello.Green">
<meta property="og:type" content="${ogType}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE.domain}/assets/img/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${root}assets/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${root}assets/img/icon-192.png">
<link rel="manifest" href="${root}manifest.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap">
<link rel="stylesheet" href="${root}assets/css/site.css?v=${VERSION}">
<script>try{var t=localStorage.getItem('hg-theme');if(t)document.documentElement.dataset.theme=t;}catch(e){}</script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE.adsenseClient}" crossorigin="anonymous"></script>
${ld}
</head>
<body class="sec-${section} ${bodyClass}">
<a class="skip" href="#main">Skip to content</a>
${header(root, section)}
<main id="main">
${body}
</main>
${footer(root)}
<script src="${root}assets/js/config.js?v=${VERSION}"></script>
<script src="${root}assets/js/site.js?v=${VERSION}" defer></script>
${extra}
</body>
</html>
`;
}
