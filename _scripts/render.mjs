// Shared HTML renderers for self-updating blocks. Used by src/build.mjs and scripts/update-data.mjs
// so the pre-rendered (crawlable) HTML and the live JavaScript render look the same.

export const esc = (s = '') => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const fmtDate = (iso) => {
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
};

export function renderNews(items = [], limit = 12) {
  if (!items.length) {
    return '<li class="news-empty">Headlines refresh every six hours. Check back shortly.</li>';
  }
  return items.slice(0, limit).map((n) => `
<li class="news-item" data-cat="${esc(n.category)}">
  <a href="${esc(n.link)}" target="_blank" rel="noopener nofollow">${esc(n.title)}</a>
  <span class="news-meta"><span class="news-src">${esc(n.source)}</span><span class="news-cat">${esc(n.category)}</span><time datetime="${esc(n.published)}">${fmtDate(n.published)}</time></span>
</li>`).join('');
}

export function renderVideos(items = [], limit = 8) {
  if (!items.length) {
    return '<li class="video-empty">New videos load every six hours.</li>';
  }
  return items.slice(0, limit).map((v) => `
<li class="video-item">
  <button class="yt-lite" type="button" data-yt="${esc(v.id)}" aria-label="Play: ${esc(v.title)}">
    <img src="https://i.ytimg.com/vi/${esc(v.id)}/hqdefault.jpg" alt="" loading="lazy" width="480" height="360">
    <span class="yt-play" aria-hidden="true"></span>
  </button>
  <h3 class="video-title">${esc(v.title)}</h3>
  <p class="video-meta">${esc(v.channel)} <time datetime="${esc(v.published)}">${fmtDate(v.published)}</time></p>
</li>`).join('');
}

export function renderPlanet(p = {}) {
  const co2 = p.co2 && p.co2.latest;
  const ago = p.co2 && p.co2.yearAgo;
  const temp = p.temp && p.temp.latestYear;
  const rows = [];
  if (co2) {
    const diff = ago ? (co2.ppm - ago.ppm).toFixed(2) : null;
    rows.push(`<div class="pulse-stat"><dt>CO₂ at Mauna Loa</dt><dd><strong>${co2.ppm.toFixed(2)}</strong> ppm</dd><dd class="pulse-note">Week of ${fmtDate(co2.date)}${diff ? `, ${diff > 0 ? '+' : ''}${diff} ppm on a year earlier` : ''}</dd></div>`);
  }
  if (temp) {
    rows.push(`<div class="pulse-stat"><dt>Global temperature, ${esc(temp.year)}</dt><dd><strong>${temp.anomaly > 0 ? '+' : ''}${temp.anomaly.toFixed(2)}</strong> °C</dd><dd class="pulse-note">Versus the 1951–1980 average (NASA GISTEMP)</dd></div>`);
  }
  if (!rows.length) {
    return '<div class="pulse-stat"><dt>Planet Pulse</dt><dd>Live readings refresh every six hours.</dd></div>';
  }
  return rows.join('');
}

// Replace content between <!--HG:KEY:START--> and <!--HG:KEY:END--> markers.
export function inject(html, key, content) {
  const re = new RegExp(`(<!--HG:${key}:START-->)[\\s\\S]*?(<!--HG:${key}:END-->)`, 'g');
  return html.replace(re, `$1${content}$2`);
}
