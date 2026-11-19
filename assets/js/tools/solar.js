/* Solar savings calculator */
(function () {
  'use strict';
  var HG = window.HG, form = HG.$('#solar-form');
  if (!form) return;
  var PANEL_W = 430, PANEL_M2 = 2.0, DERATE = 0.8, DEGRADE = 0.005, SELF_USE = 0.4;

  function onCountry(c, f) {
    HG.set(f, 'rate', c.elec); HG.set(f, 'sun', c.sun); HG.set(f, 'cpw', c.solarW.toFixed(2)); HG.set(f, 'export', c.export);
    HG.set(f, 'bill', { USD: 160, CAD: 150, GBP: 110, EUR: 120, INR: 3000, AUD: 210 }[c.cur] || 150);
  }
  function inSubsidy(kw) {
    var s = Math.min(kw, 2) * 30000 + Math.max(0, Math.min(kw, 3) - 2) * 18000;
    return Math.min(s, 78000);
  }
  function compute(v) {
    var c = HG.COUNTRY[v.country] || HG.COUNTRY.US, cur = c.cur;
    HG.$$('[data-only]', form).forEach(function (el) { el.hidden = el.getAttribute('data-only') !== v.country; });
    HG.$('#s-offset-out').textContent = v.offset + '%';
    var rate = v.rate || c.elec, sun = v.sun || c.sun;
    var usage = rate > 0 ? (v.bill * 12) / rate : 0;
    var kw = usage * (v.offset / 100) / (sun * 365 * DERATE);
    var gross = kw * 1000 * v.cpw;
    var subsidy = (v.country === 'IN' && v.pmsg) ? inSubsidy(kw) : 0;
    var net = Math.max(0, gross - v.incentive - subsidy);
    var exp = v.export / 100, esc = v.esc / 100;
    var cum = 0, payback = null, total25 = 0, year1 = 0;
    for (var y = 1; y <= 25; y++) {
      var prod = kw * sun * 365 * DERATE * Math.pow(1 - DEGRADE, y - 1);
      var self = Math.min(prod * SELF_USE, usage);
      var save = (self + (prod - self) * exp) * rate * Math.pow(1 + esc, y - 1);
      if (y === 1) year1 = save;
      cum += save; total25 += save;
      if (payback === null && cum >= net) payback = y - 1 + (net - (cum - save)) / save;
    }
    var prod1 = kw * sun * 365 * DERATE;
    var panels = Math.ceil(kw * 1000 / PANEL_W);
    HG.$('[data-out="payback"]').textContent = net === 0 ? 'Immediate' : (payback === null ? '25+ years' : HG.num(payback, 1) + ' years');
    HG.rows('#solar-rows', [
      ['System size', HG.num(kw, 1) + ' kW (' + panels + ' panels)'],
      ['Roof area needed', 'about ' + HG.num(panels * PANEL_M2) + ' m² (' + HG.num(panels * PANEL_M2 * 10.764) + ' ft²)'],
      ['Price before incentives', HG.money(gross, cur)],
      subsidy ? ['PM Surya Ghar subsidy', '− ' + HG.money(subsidy, cur)] : ['Rebates and grants', '− ' + HG.money(v.incentive, cur)],
      ['Your cost', HG.money(net, cur)],
      ['First-year savings', HG.money(year1, cur)],
      ['25-year savings', HG.money(total25, cur)],
      ['Net gain after 25 years', HG.money(total25 - net, cur)],
      ['First-year output', HG.num(prod1) + ' kWh'],
      ['CO₂ avoided each year', HG.num(prod1 * c.grid / 1000, 1) + ' tonnes']
    ]);
    HG.$('[data-quote]').href = HG.root + 'quotes.html?project=solar&bill=' + Math.round(v.bill) + '&currency=' + cur;
  }
  HG.tool(form, 'solar', compute, onCountry);
})();
