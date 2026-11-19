/* Home page: the interactive power-bill card. */
(function () {
  'use strict';
  var HG = window.HG, card = HG && HG.$('[data-bill]');
  if (!card) return;
  var CUR = {
    USD: { min: 40, max: 600, step: 5, def: 160 },
    CAD: { min: 40, max: 600, step: 5, def: 150 },
    GBP: { min: 30, max: 400, step: 5, def: 110 },
    EUR: { min: 30, max: 450, step: 5, def: 120 },
    INR: { min: 500, max: 15000, step: 100, def: 3000 },
    AUD: { min: 50, max: 700, step: 5, def: 210 }
  };
  // Share of the annual electricity bill each upgrade typically offsets (rough, for illustration).
  var SHARE = { solar: 0.55, heat: 0.22, eff: 0.10 };
  var range = HG.$('#bill-range', card), out = HG.$('#bill-out', card), cta = HG.$('[data-bill-cta]', card);
  var saved = HG.store.get('bill', { cur: 'USD', v: 160 });
  var cur = CUR[saved.cur] ? saved.cur : 'USD';

  function setCur(c, keepValue) {
    cur = c;
    var cfg = CUR[c];
    range.min = cfg.min; range.max = cfg.max; range.step = cfg.step;
    if (!keepValue) range.value = cfg.def;
    HG.$$('[data-cur]', card).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-cur') === c)); });
    draw();
  }
  function draw() {
    var v = +range.value, annual = v * 12, total = 0;
    out.textContent = HG.money(v, cur);
    Object.keys(SHARE).forEach(function (k) {
      var val = annual * SHARE[k]; total += val;
      var line = HG.$('[data-v="' + k + '"]', card);
      line.textContent = HG.money(val, cur) + '/yr';
      var maxVal = CUR[cur].max * 12 * SHARE.solar;
      line.parentNode.querySelector('.bill-bar i').style.width = Math.max(3, Math.round(val / maxVal * 100)) + '%';
    });
    HG.$('[data-v="total"]', card).textContent = HG.money(total, cur);
    cta.href = HG.root + 'quotes.html?bill=' + v + '&currency=' + cur;
    HG.store.set('bill', { cur: cur, v: v });
  }
  range.addEventListener('input', draw);
  HG.$$('[data-cur]', card).forEach(function (b) { b.addEventListener('click', function () { setCur(b.getAttribute('data-cur')); }); });
  range.value = saved.v;
  setCur(cur, true);
})();
