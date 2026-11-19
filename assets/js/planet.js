/* Planet Pulse charts: single-series SVG line charts with a crosshair tooltip and a table view. */
(function () {
  'use strict';
  var HG = window.HG;
  if (!HG || !HG.$('.chart-host')) return;
  var NS = 'http://www.w3.org/2000/svg';
  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(n);
    return n;
  }
  function color(kind) {
    var dark = document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
    return kind === 'temp' ? (dark ? '#e2692a' : '#c2410c') : (dark ? '#3aa771' : '#1f7a49');
  }
  function ticks(min, max, n) {
    var step = Math.pow(10, Math.floor(Math.log10((max - min) / n)));
    var err = (max - min) / n / step;
    step *= err >= 7.5 ? 10 : err >= 3 ? 5 : err >= 1.5 ? 2 : 1;
    var out = [];
    for (var v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) out.push(+v.toFixed(6));
    return out;
  }
  function draw(host, pts, opts) {
    host.innerHTML = '';
    if (!pts.length) { host.innerHTML = '<p class="muted">Data refreshes every six hours.</p>'; return; }
    var W = 640, H = 300, m = { t: 16, r: 16, b: 34, l: 52 };
    var xs = pts.map(function (p) { return p.x; }), ys = pts.map(function (p) { return p.y; });
    var xmin = Math.min.apply(null, xs), xmax = Math.max.apply(null, xs);
    var ymin = Math.min.apply(null, ys), ymax = Math.max.apply(null, ys), pad = (ymax - ymin) * 0.08 || 1;
    ymin -= pad; ymax += pad;
    if (opts.zero && ymin > 0) ymin = Math.min(ymin, 0);
    var sx = function (x) { return m.l + (x - xmin) / (xmax - xmin || 1) * (W - m.l - m.r); };
    var sy = function (y) { return H - m.b - (y - ymin) / (ymax - ymin) * (H - m.t - m.b); };
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'chart', role: 'img', 'aria-label': opts.label });
    var grid = el('g', { stroke: 'currentColor', 'stroke-opacity': '0.12' }, svg);
    var axis = el('g', { fill: 'currentColor', 'font-size': '12', 'font-family': 'inherit', opacity: '0.75' }, svg);
    ticks(ymin, ymax, 5).forEach(function (t) {
      el('line', { x1: m.l, x2: W - m.r, y1: sy(t), y2: sy(t) }, grid);
      var tx = el('text', { x: m.l - 8, y: sy(t) + 4, 'text-anchor': 'end' }, axis); tx.textContent = opts.fmtY(t);
    });
    if (opts.zero && ymin < 0 && ymax > 0) el('line', { x1: m.l, x2: W - m.r, y1: sy(0), y2: sy(0), stroke: 'currentColor', 'stroke-opacity': '0.45' }, svg);
    ticks(xmin, xmax, 6).forEach(function (t) {
      var tx = el('text', { x: sx(t), y: H - 10, 'text-anchor': 'middle' }, axis); tx.textContent = opts.fmtX(t);
    });
    var c = color(opts.kind);
    var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + sx(p.x).toFixed(1) + ' ' + sy(p.y).toFixed(1); }).join(' ');
    el('path', { d: d, fill: 'none', stroke: c, 'stroke-width': '2', 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, svg);
    var last = pts[pts.length - 1];
    el('circle', { cx: sx(last.x), cy: sy(last.y), r: 4.5, fill: c, stroke: 'var(--paper)', 'stroke-width': '2' }, svg);
    // Hover layer: crosshair + tooltip
    var cross = el('line', { y1: m.t, y2: H - m.b, stroke: 'currentColor', 'stroke-opacity': '0.4', visibility: 'hidden' }, svg);
    var dot = el('circle', { r: 5, fill: c, stroke: 'var(--paper)', 'stroke-width': '2', visibility: 'hidden' }, svg);
    var tipG = el('g', { visibility: 'hidden' }, svg);
    var tipBg = el('rect', { rx: 4, fill: 'var(--paper)', stroke: 'currentColor', 'stroke-opacity': '0.25' }, tipG);
    var tipT = el('text', { 'font-size': '13', fill: 'currentColor', 'font-family': 'inherit' }, tipG);
    var hit = el('rect', { x: m.l, y: m.t, width: W - m.l - m.r, height: H - m.t - m.b, fill: 'transparent' }, svg);
    function move(evt) {
      var r = svg.getBoundingClientRect(), x = (evt.clientX - r.left) / r.width * W;
      var xv = xmin + (x - m.l) / (W - m.l - m.r) * (xmax - xmin), best = pts[0];
      pts.forEach(function (p) { if (Math.abs(p.x - xv) < Math.abs(best.x - xv)) best = p; });
      var px = sx(best.x), py = sy(best.y);
      [cross, dot, tipG].forEach(function (n) { n.setAttribute('visibility', 'visible'); });
      cross.setAttribute('x1', px); cross.setAttribute('x2', px); dot.setAttribute('cx', px); dot.setAttribute('cy', py);
      tipT.textContent = best.label + ': ' + opts.fmtVal(best.y);
      var bw = tipT.getComputedTextLength ? tipT.getComputedTextLength() + 16 : 150;
      var tx = Math.min(Math.max(px - bw / 2, m.l), W - m.r - bw), ty = Math.max(py - 40, m.t);
      tipBg.setAttribute('x', tx); tipBg.setAttribute('y', ty); tipBg.setAttribute('width', bw); tipBg.setAttribute('height', 26);
      tipT.setAttribute('x', tx + 8); tipT.setAttribute('y', ty + 18);
    }
    hit.addEventListener('pointermove', move);
    hit.addEventListener('pointerleave', function () { [cross, dot, tipG].forEach(function (n) { n.setAttribute('visibility', 'hidden'); }); });
    host.appendChild(svg);
  }
  function table(id, head, rows) {
    var t = HG.$('#' + id); if (!t) return;
    t.innerHTML = '<thead><tr><th>' + head[0] + '</th><th>' + head[1] + '</th></tr></thead><tbody>' + rows.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>'; }).join('') + '</tbody>';
  }
  HG.getJSON('planet.json').then(function (p) {
    var co2 = (p.co2 && p.co2.monthly) || [], temp = (p.temp && p.temp.annual) || [];
    function render() {
      draw(HG.$('#chart-co2'), co2.map(function (r) { var a = r.d.split('-'); return { x: +a[0] + (+a[1] - 0.5) / 12, y: r.v, label: r.d }; }),
        { kind: 'co2', label: 'Monthly CO₂ concentration at Mauna Loa', fmtY: function (v) { return v.toFixed(0); }, fmtX: function (v) { return String(Math.floor(v)); }, fmtVal: function (v) { return v.toFixed(2) + ' ppm'; } });
      draw(HG.$('#chart-temp'), temp.map(function (r) { return { x: r.y, y: r.v, label: String(r.y) }; }),
        { kind: 'temp', zero: true, label: 'Global temperature anomaly by year', fmtY: function (v) { return (v > 0 ? '+' : '') + v.toFixed(1); }, fmtX: function (v) { return String(Math.round(v)); }, fmtVal: function (v) { return (v > 0 ? '+' : '') + v.toFixed(2) + ' °C'; } });
    }
    render();
    table('table-co2', ['Month', 'CO₂ (ppm)'], co2.slice().reverse().map(function (r) { return [r.d, r.v.toFixed(2)]; }));
    table('table-temp', ['Year', 'Anomaly (°C)'], temp.slice().reverse().map(function (r) { return [r.y, (r.v > 0 ? '+' : '') + r.v.toFixed(2)]; }));
    HG.$$('[data-theme-toggle]').forEach(function (b) { b.addEventListener('click', function () { setTimeout(render, 0); }); });
  }).catch(function () {
    HG.$$('.chart-host').forEach(function (h) { h.innerHTML = '<p class="muted">Data refreshes every six hours.</p>'; });
  });
})();
