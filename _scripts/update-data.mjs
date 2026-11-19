// Hello.Green auto-refresh: news headlines, YouTube uploads, CO₂ and temperature data.
// Runs in GitHub Actions every 6 hours. A failing source never wipes existing data.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { XMLParser } from 'fast-xml-parser';
import { renderNews, renderVideos, renderPlanet } from './render.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'data');
const UA = 'Mozilla/5.0 (compatible; HelloGreenBot/1.0; +https://hello.green/about.html)';
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_', processEntities: true, htmlEntities: true, trimValues: true });
const log = (...a) => console.log('[update]', ...a);
const readJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8')); } catch { return d; } };
const writeJSON = (f, obj) => { fs.mkdirSync(DATA, { recursive: true }); fs.writeFileSync(path.join(DATA, f), JSON.stringify(obj, null, 1) + '\n'); };

async function get(url, { timeout = 20000, type = 'text' } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: '*/*', 'Accept-Language': 'en-US,en;q=0.9' }, signal: ctrl.signal, redirect: 'follow' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return type === 'json' ? await res.json() : await res.text();
  } finally { clearTimeout(t); }
}

const text = (v) => {
  if (v == null) return '';
  if (typeof v === 'object') return text(v['#text'] ?? v['@_href'] ?? '');
  return String(v).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
};
const asArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);

// ---------- News ----------
const FEEDS = [
  ['Grist', 'https://grist.org/feed/'],
  ['Inside Climate News', 'https://insideclimatenews.org/feed/'],
  ['CleanTechnica', 'https://cleantechnica.com/feed/'],
  ['Electrek', 'https://electrek.co/feed/'],
  ['Carbon Brief', 'https://www.carbonbrief.org/feed/'],
  ['Yale Climate Connections', 'https://yaleclimateconnections.org/feed/'],
  ['The Guardian', 'https://www.theguardian.com/environment/rss'],
  ['BBC News', 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml'],
  ['pv magazine', 'https://www.pv-magazine.com/feed/'],
  ['Canary Media', 'https://www.canarymedia.com/rss.rss'],
  ['Earth911', 'https://earth911.com/feed/'],
  ['Mongabay', 'https://news.mongabay.com/feed/'],
  ['Inhabitat', 'https://inhabitat.com/feed/'],
  ['Renewable Energy World', 'https://www.renewableenergyworld.com/feed/']
];
const CATS = [
  ['Solar', /\bsolar|photovoltaic|\bpv\b|rooftop panel/i],
  ['EVs & transport', /\bev\b|\bevs\b|electric (car|vehicle|truck|bus|bike)|charging|tesla|byd|rivian|e-bike|transit|railway|aviation|airline/i],
  ['Home energy', /heat pump|insulation|efficien|appliance|induction|retrofit|home energy|thermostat|water heater|building/i],
  ['Clean energy', /wind|battery|storage|grid|renewable|hydro|nuclear|geothermal|hydrogen|clean energy|power plant|utility|electricity/i],
  ['Policy', /congress|senate|\bepa\b|\blaw\b|bill|policy|regulat|cop\d|government|tax credit|lawsuit|court|election|minister|parliament|trump/i],
  ['Nature', /forest|wildlife|ocean|species|biodiversity|river|coral|bird|animal|conservation|wetland|reef|whale/i],
  ['Low-waste living', /plastic|recycl|waste|compost|fashion|food|diet|zero waste/i]
];
const categorize = (title) => (CATS.find(([, re]) => re.test(title)) || ['Climate'])[0];

function parseFeed(xml, source) {
  const doc = parser.parse(xml);
  const items = doc?.rss?.channel?.item ?? doc?.['rdf:RDF']?.item ?? doc?.feed?.entry ?? [];
  return asArray(items).map((it) => {
    let link = it.link;
    if (Array.isArray(link)) link = (link.find((l) => !l['@_rel'] || l['@_rel'] === 'alternate') || link[0]);
    link = typeof link === 'object' ? link['@_href'] || link['#text'] : link;
    const date = it.pubDate || it.published || it.updated || it['dc:date'];
    const title = text(it.title);
    return { title, link: text(link) || '', source, published: new Date(date || Date.now()).toISOString(), category: categorize(title) };
  }).filter((n) => n.title && /^https?:\/\//.test(n.link));
}

async function updateNews() {
  const old = readJSON('news.json', { items: [] });
  const cutoff = Date.now() - 21 * 86400000;
  const all = [];
  await Promise.all(FEEDS.map(async ([name, url]) => {
    try {
      const items = parseFeed(await get(url), name)
        .filter((n) => new Date(n.published).getTime() > cutoff && new Date(n.published).getTime() < Date.now() + 86400000)
        .sort((a, b) => b.published.localeCompare(a.published)).slice(0, 8);
      all.push(...items); log(`news ok: ${name} (${items.length})`);
    } catch (e) { log(`news FAIL: ${name}: ${e.message}`); }
  }));
  const seen = new Set();
  const items = all.sort((a, b) => b.published.localeCompare(a.published)).filter((n) => {
    const k = n.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60);
    if (seen.has(k)) return false; seen.add(k); return true;
  }).slice(0, 72);
  if (items.length < 5) { log('news: too few items, keeping previous data'); return old; }
  const out = { updated: new Date().toISOString(), items };
  writeJSON('news.json', out);
  return out;
}

// ---------- Videos ----------
const CHANNELS = [
  { name: 'Undecided with Matt Ferrell', handle: 'UndecidedMF', id: 'UCjtUS7-SZTi6pXjUbzGHQCg' },
  { name: 'Just Have a Think', handle: 'JustHaveaThink', id: 'UCRBwLPbXGsI2cJe9W1zfSjQ' },
  { name: 'Technology Connections', handle: 'TechnologyConnections', id: 'UCy0tKL1T7wFoYcxCe0xjN6Q' },
  { name: 'Climate Town', handle: 'ClimateTown', id: 'UCuVLG9pThvBABcYCm7pkNkA' },
  { name: 'Our Changing Climate', handle: 'OurChangingClimate', id: 'UCNXvxXpDJXp-mZu3pFMzYHQ' },
  { name: 'DW Planet A', handle: 'DWPlanetA', id: 'UCb72Gn5LXaLEcsOuPKGfQOg' },
  { name: 'Fully Charged Show', handle: 'fullychargedshow', id: 'UCzz4CoEgSgWNs9ZAvRMhW2A' },
  { name: 'Engineering with Rosie', handle: 'EngineeringwithRosie', id: '' },
  { name: 'Simon Clark', handle: 'SimonClark', id: '' },
  { name: 'Shelbizleee', handle: 'Shelbizleee', id: '' }
];

async function resolveChannel(ch, cache) {
  if (cache[ch.handle]) return cache[ch.handle];
  const html = await get(`https://www.youtube.com/@${ch.handle}`);
  const m = html.match(/"(?:externalId|channelId)":"(UC[\w-]{22})"/) || html.match(/channel\/(UC[\w-]{22})/);
  if (!m) throw new Error('channel id not found');
  return m[1];
}

async function updateVideos() {
  const old = readJSON('videos.json', { items: [], channels: {} });
  const cache = { ...(old.channels || {}) };
  const all = [];
  for (const ch of CHANNELS) {
    let ids = [cache[ch.handle], ch.id].filter(Boolean);
    let got = false;
    for (let attempt = 0; attempt < 2 && !got; attempt++) {
      if (!ids.length || attempt === 1) {
        try { ids = [await resolveChannel(ch, {})]; } catch (e) { log(`video resolve FAIL: ${ch.name}: ${e.message}`); break; }
      }
      for (const id of ids) {
        try {
          const doc = parser.parse(await get(`https://www.youtube.com/feeds/videos.xml?channel_id=${id}`));
          const entries = asArray(doc?.feed?.entry).map((e) => ({
            id: text(e['yt:videoId']), title: text(e.title), channel: ch.name, published: new Date(e.published).toISOString(),
            link: text(asArray(e.link)[0]?.['@_href'])
          })).filter((v) => v.id && !/\/shorts\//.test(v.link) && !/#shorts/i.test(v.title));
          if (!entries.length) throw new Error('empty feed');
          all.push(...entries.slice(0, 4).map(({ link, ...v }) => v));
          cache[ch.handle] = id; got = true; log(`video ok: ${ch.name} (${Math.min(4, entries.length)})`);
          break;
        } catch (e) { log(`video FAIL: ${ch.name} ${id}: ${e.message}`); }
      }
    }
  }
  const items = all.sort((a, b) => b.published.localeCompare(a.published)).slice(0, 36);
  if (items.length < 3) { log('videos: too few items, keeping previous data'); return old; }
  const out = { updated: new Date().toISOString(), channels: cache, items };
  writeJSON('videos.json', out);
  return out;
}

// ---------- Planet ----------
async function updatePlanet() {
  const old = readJSON('planet.json', {});
  const out = { ...old };
  try {
    const weekly = (await get('https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_weekly_mlo.txt'))
      .split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => l.trim().split(/\s+/).map(Number))
      .filter((r) => r[4] > 0);
    const last = weekly[weekly.length - 1];
    const date = `${last[0]}-${String(last[1]).padStart(2, '0')}-${String(last[2]).padStart(2, '0')}`;
    const monthly = (await get('https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_mm_mlo.csv'))
      .split('\n').filter((l) => l.trim() && !l.startsWith('#') && /^\d/.test(l)).map((l) => l.split(','))
      .map((r) => ({ d: `${r[0]}-${String(r[1]).padStart(2, '0')}`, v: +(+r[3]).toFixed(2) })).filter((r) => r.v > 0);
    out.co2 = {
      latest: { date, ppm: last[4] },
      yearAgo: last[6] > 0 ? { ppm: last[6] } : (old.co2 && old.co2.yearAgo) || null,
      monthly: monthly.slice(-120),
      source: 'NOAA Global Monitoring Laboratory, Mauna Loa'
    };
    log(`co2 ok: ${last[4]} ppm week of ${date}`);
  } catch (e) { log(`co2 FAIL: ${e.message}`); }
  try {
    const rows = (await get('https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv')).split('\n');
    const hi = rows.findIndex((r) => r.startsWith('Year,'));
    const head = rows[hi].split(',');
    const jd = head.indexOf('J-D');
    const annual = rows.slice(hi + 1).map((r) => r.split(',')).filter((r) => /^\d{4}$/.test(r[0]) && r[jd] && !r[jd].includes('*'))
      .map((r) => ({ y: +r[0], v: +r[jd] }));
    const lastY = annual[annual.length - 1];
    out.temp = { latestYear: { year: lastY.y, anomaly: lastY.v }, annual: annual.filter((r) => r.y >= 1950), source: 'NASA GISTEMP v4' };
    log(`temp ok: ${lastY.y} ${lastY.v}`);
  } catch (e) { log(`temp FAIL: ${e.message}`); }
  if (out.co2 || out.temp) { out.updated = new Date().toISOString(); writeJSON('planet.json', out); }
  return out;
}

// ---------- Inject into HTML + sitemap ----------
function htmlFiles(dir) {
  const skip = new Set(['node_modules', '_src', '_scripts', '_project', '.git', '.github', 'data', 'assets']);
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (skip.has(e.name)) return [];
    const p = path.join(dir, e.name);
    return e.isDirectory() ? htmlFiles(p) : e.name.endsWith('.html') ? [p] : [];
  });
}
function injectAll(news, videos, planet) {
  for (const file of htmlFiles(ROOT)) {
    let html = fs.readFileSync(file, 'utf8');
    const before = html;
    html = html.replace(/(data-limit="(\d+)"[^>]*>)<!--HG:NEWS:START-->[\s\S]*?<!--HG:NEWS:END-->/g, (_, open, n) => `${open}<!--HG:NEWS:START-->${renderNews(news.items, +n)}<!--HG:NEWS:END-->`);
    html = html.replace(/(data-limit="(\d+)"[^>]*>)<!--HG:VIDEOS:START-->[\s\S]*?<!--HG:VIDEOS:END-->/g, (_, open, n) => `${open}<!--HG:VIDEOS:START-->${renderVideos(videos.items, +n)}<!--HG:VIDEOS:END-->`);
    html = html.replace(/<!--HG:PLANET:START-->[\s\S]*?<!--HG:PLANET:END-->/g, `<!--HG:PLANET:START-->${renderPlanet(planet)}<!--HG:PLANET:END-->`);
    if (html !== before) { fs.writeFileSync(file, html); log('injected', path.relative(ROOT, file)); }
  }
  const sm = path.join(ROOT, 'sitemap.xml');
  if (fs.existsSync(sm)) {
    const today = new Date().toISOString().slice(0, 10);
    const xml = fs.readFileSync(sm, 'utf8').replace(/(<loc>https:\/\/hello\.green\/(?:|news\.html|videos\.html|planet\.html)<\/loc><lastmod>)[^<]+/g, `$1${today}`);
    fs.writeFileSync(sm, xml);
  }
}

const [news, videos, planet] = await Promise.all([updateNews(), updateVideos(), updatePlanet()]);
injectAll(news, videos, planet);
log('done');
