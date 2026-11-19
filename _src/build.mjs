// Static site generator for Hello.Green.
// Usage: npm run build   (reads src/, writes HTML to the repository root)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import { layout } from './layout.mjs';
import { SITE } from './site.mjs';
import { esc, renderNews, renderVideos, renderPlanet, inject } from '../_scripts/render.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, '_src');
const out = (p) => path.join(ROOT, p);
const rootFor = (p) => '../'.repeat(p.split('/').length - 1);
const readJSON = (p, fallback) => { try { return JSON.parse(fs.readFileSync(out(p), 'utf8')); } catch { return fallback; } };
const slugify = (s) => s.toLowerCase().replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const pages = [];   // for sitemap + search index

// ---------- Guides (Markdown) ----------
function parseFrontMatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error('Missing front matter');
  const meta = {};
  m[1].split('\n').forEach((line) => {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  });
  return { meta, body: m[2] };
}

const CTAS = {
  solar: { h: 'See what solar would cost on your roof', p: 'Run the numbers in two minutes, then ask up to three vetted installers for real quotes. Free, and you choose who contacts you.', tool: 'tools/solar-savings.html', toolLabel: 'Open the solar calculator', project: 'solar', button: 'Get free solar quotes' },
  'heat-pump': { h: 'Price a heat pump for your home', p: 'Compare your current heating bill with a heat pump, then get quotes from installers who handle the grant paperwork.', tool: 'tools/heat-pump-savings.html', toolLabel: 'Open the heat pump calculator', project: 'heat-pump', button: 'Get heat pump quotes' },
  battery: { h: 'Find out if a battery pays off for you', p: 'Tell us about your home and outage worries. Vetted installers will size a battery and quote it, with no pressure.', tool: 'tools/solar-savings.html', toolLabel: 'Check solar + storage savings', project: 'battery', button: 'Get battery quotes' },
  'ev-charger': { h: 'Get a home charger installed properly', p: 'Compare running costs first, then get quotes from licensed electricians for a Level 2 charger and any panel work.', tool: 'tools/ev-vs-gas.html', toolLabel: 'Compare EV and gas costs', project: 'ev-charger', button: 'Get EV charger quotes' },
  insulation: { h: 'Stop paying to heat the outdoors', p: 'Insulation and air sealing usually pay back faster than any other upgrade. Get quotes from local pros.', tool: 'tools/home-energy.html', toolLabel: 'Try the quick-wins calculator', project: 'insulation', button: 'Get insulation quotes' },
  audit: { h: 'Book a professional energy audit', p: 'A blower-door test finds the leaks you cannot see. Request a quote from a certified energy auditor near you.', tool: 'tools/home-energy.html', toolLabel: 'Start with quick wins', project: 'audit', button: 'Get an energy audit quote' },
  none: { h: 'Know your number', p: 'Measure your household footprint in five minutes and see which changes matter most for your home.', tool: 'tools/carbon-footprint.html', toolLabel: 'Calculate my footprint', project: '', button: 'Get free home upgrade quotes' }
};

function buildGuides() {
  const dir = path.join(SRC, 'guides');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort();
  const guides = files.map((f) => {
    const { meta, body } = parseFrontMatter(fs.readFileSync(path.join(dir, f), 'utf8'));
    const words = body.split(/\s+/).length;
    return { ...meta, slug: f.replace(/\.md$/, ''), body, words, read: Math.max(3, Math.round(words / 220)), order: Number(meta.order || 99) };
  }).sort((a, b) => a.order - b.order);

  for (const g of guides) {
    const p = `guides/${g.slug}.html`;
    const root = rootFor(p);
    let html = marked.parse(g.body);
    const toc = [];
    html = html.replace(/<h2>(.*?)<\/h2>/g, (_, inner) => {
      const id = slugify(inner);
      toc.push({ id, text: inner.replace(/<[^>]+>/g, '') });
      return `<h2 id="${id}">${inner}</h2>`;
    });
    html = html.replace(/href="(?:\{root\}|%7Broot%7D)/g, `href="${root}`).replace(/<table>/g, '<div class="table-scroll"><table>').replace(/<\/table>/g, '</table></div>');
    const facts = (g.facts || '').split('|').map((s) => s.trim()).filter(Boolean);
    const cta = CTAS[g.cta || 'none'];
    const related = (g.related || '').split(',').map((s) => s.trim()).filter(Boolean)
      .map((s) => guides.find((x) => x.slug === s)).filter(Boolean);
    const body = `
<article class="guide">
  <header class="guide-head wrap">
    <p class="crumbs"><a href="${root}guides/">Guides</a> <span aria-hidden="true">/</span> ${esc(g.category)}</p>
    <h1>${esc(g.title)}</h1>
    <p class="dek">${esc(g.description)}</p>
    <p class="byline">Hello.Green editorial team. Updated ${esc(g.updated)}. ${g.read} minute read.</p>
  </header>
  <div class="guide-grid wrap">
    <aside class="guide-aside">
      ${facts.length ? `<div class="facts"><h2>Quick facts</h2><ul>${facts.map((f) => `<li>${esc(f)}</li>`).join('')}</ul></div>` : ''}
      <nav class="toc" aria-label="On this page"><h2>On this page</h2><ol>${toc.map((t) => `<li><a href="#${t.id}">${t.text}</a></li>`).join('')}</ol></nav>
    </aside>
    <div class="prose">
      ${html}
      <section class="guide-cta" aria-labelledby="cta-${g.slug}">
        <h2 id="cta-${g.slug}">${cta.h}</h2>
        <p>${cta.p}</p>
        <div class="btn-row">
          <a class="btn btn-sun" href="${root}quotes.html${cta.project ? `?project=${cta.project}` : ''}">${cta.button}</a>
          <a class="btn btn-ghost" href="${root}${cta.tool}">${cta.toolLabel}</a>
        </div>
      </section>
    </div>
  </div>
  ${related.length ? `<section class="related wrap" aria-labelledby="rel-h"><h2 id="rel-h">Keep reading</h2><ul class="guide-list">${related.map((r) => `<li><a href="${root}guides/${r.slug}.html"><span class="gl-cat">${esc(r.category)}</span><span class="gl-title">${esc(r.title)}</span><span class="gl-dek">${esc(r.description)}</span></a></li>`).join('')}</ul></section>` : ''}
</article>`;
    const schema = {
      '@context': 'https://schema.org', '@type': 'Article', headline: g.title, description: g.description,
      dateModified: g.isoDate, datePublished: g.isoDate, author: { '@type': 'Organization', name: 'Hello.Green editorial team' },
      publisher: { '@type': 'Organization', name: 'Hello.Green', url: SITE.domain }, mainEntityOfPage: `${SITE.domain}/${p}`
    };
    write(p, layout({ root, path: p, title: g.title, description: g.description, section: 'guides', body, schema, ogType: 'article', bodyClass: 'is-guide' }));
    pages.push({ path: p, title: g.title, description: g.description, tags: `${g.category} guide ${g.tags || ''}` });
  }
  return guides;
}

function guideListHTML(guides, root, limit = 99) {
  return guides.slice(0, limit).map((g) => `<li><a href="${root}guides/${g.slug}.html"><span class="gl-cat">${esc(g.category)}</span><span class="gl-title">${esc(g.title)}</span><span class="gl-dek">${esc(g.description)}</span><span class="gl-read">${g.read} min read</span></a></li>`).join('');
}

// ---------- HTML pages ----------
function walk(dir, base = '') {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const rel = base ? `${base}/${e.name}` : e.name;
    return e.isDirectory() ? walk(path.join(dir, e.name), rel) : (e.name.endsWith('.html') ? [rel] : []);
  });
}

function write(p, html) {
  fs.mkdirSync(path.dirname(out(p)), { recursive: true });
  fs.writeFileSync(out(p), html);
}

function buildPages(guides) {
  const news = readJSON('data/news.json', { items: [] });
  const videos = readJSON('data/videos.json', { items: [] });
  const planet = readJSON('data/planet.json', {});
  for (const rel of walk(path.join(SRC, 'pages'))) {
    const raw = fs.readFileSync(path.join(SRC, 'pages', rel), 'utf8');
    const m = raw.match(/^<!--meta\s*([\s\S]*?)-->\s*([\s\S]*)$/);
    if (!m) throw new Error(`Missing meta block in ${rel}`);
    const meta = JSON.parse(m[1]);
    const root = rootFor(rel);
    let body = m[2]
      .replace(/\{\{root\}\}/g, root)
      .replace(/\{\{guides\}\}/g, guideListHTML(guides, root))
      .replace(/\{\{guides_latest\}\}/g, guideListHTML(guides, root, 6))
      .replace(/\{\{last_checked\}\}/g, SITE.lastChecked)
      .replace(/\{\{glossary\}\}/g, () => JSON.parse(fs.readFileSync(path.join(SRC, 'data', 'glossary.json'), 'utf8'))
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([t, d]) => `<li id="${slugify(t)}"><dfn>${esc(t)}</dfn>${esc(d)}</li>`).join(''));
    body = inject(body, 'NEWS', renderNews(news.items, meta.newsLimit || 12));
    body = inject(body, 'VIDEOS', renderVideos(videos.items, meta.videoLimit || 8));
    body = inject(body, 'PLANET', renderPlanet(planet));
    write(rel, layout({ root, path: rel, body, ...meta }));
    if (!meta.noindex) pages.push({ path: rel, title: meta.title, description: meta.description, tags: meta.tags || '' });
  }
}

function buildIndexes() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = pages.map((p) => {
    const loc = `${SITE.domain}/${p.path.replace(/index\.html$/, '')}`;
    const pri = p.path === 'index.html' ? '1.0' : (p.path.startsWith('tools/') || p.path === 'quotes.html') ? '0.9' : '0.7';
    return `  <url><loc>${loc}</loc><lastmod>${today}</lastmod><priority>${pri}</priority></url>`;
  }).join('\n');
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  const index = pages.map((p) => ({ t: p.title.replace(/ \| Hello\.Green$/, ''), d: p.description, u: p.path.replace(/index\.html$/, ''), k: p.tags }));
  write('data/search-index.json', JSON.stringify(index));
}

const guides = buildGuides();
buildPages(guides);
buildIndexes();
console.log(`Built ${pages.length} pages.`);
