/* Heat pump savings calculator */
(function () {
  'use strict';
  var HG = window.HG, form = HG.$('#hp-form');
  if (!form) return;
  var CONTENT = { therm: 29.31, m3: 10.55, kWh: 1, L: { oil: 10.6, propane: 7.0 }, gal: { oil: 40.6, propane: 26.8 } };
  var FACTOR = { gas: 0.184, oil: 0.25, propane: 0.215 };
  var COST = { USD: 15000, CAD: 16000, GBP: 12000, EUR: 13000, INR: 250000, AUD: 9000 };
  var SPEND = { USD: 1200, CAD: 1500, GBP: 900, EUR: 1100, INR: 10000, AUD: 800 };

  function content(fuel, unit) {
    var c = CONTENT[unit];
    if (typeof c === 'object') return c[fuel] || c.oil;
    return c || 1;
  }
  function onCountry(c, f) {
    HG.set(f, 'elec', c.elec); HG.set(f, 'cost', COST[c.cur]); HG.set(f, 'spend', SPEND[c.cur]);
    HG.set(f, 'grant', c.cur === 'GBP' ? 7500 : 0);
    fuelDefaults(c, f, HG.$('[name="fuel"]', f).value);
  }
  function fuelDefaults(c, f, fuel) {
    if (fuel === 'gas') { HG.set(f, 'unit', c.gasUnit); HG.set(f, 'price', c.gas); HG.set(f, 'eff', 90); }
    else if (fuel === 'oil') { HG.set(f, 'unit', c.liquidUnit); HG.set(f, 'price', c.oil); HG.set(f, 'eff', 85); }
    else if (fuel === 'propane') { HG.set(f, 'unit', c.liquidUnit); HG.set(f, 'price', c.propane); HG.set(f, 'eff', 90); }
    else { HG.set(f, 'eff', 100); }
  }
  form.addEventListener('change', function (e) {
    if (e.target.name === 'fuel') { fuelDefaults(HG.COUNTRY[HG.$('[name="country"]', form).value] || HG.COUNTRY.US, form, e.target.value); }
  }, true);

  function compute(v) {
    var c = HG.COUNTRY[v.country] || HG.COUNTRY.US, cur = c.cur, electric = v.fuel === 'electric';
    HG.$$('[data-fuel-only]', form).forEach(function (el) { el.hidden = el.getAttribute('data-fuel-only').split(',').indexOf(v.fuel) === -1; });
    HG.text('[data-unit-label]', { therm: 'therm', m3: 'm³', kWh: 'kWh', L: 'litre', gal: 'US gallon' }[v.unit] || v.unit);
    var price = electric ? v.elec : v.price;
    var units = price > 0 ? v.spend / price : 0;
    var fuelKWh = electric ? units : units * content(v.fuel, v.unit);
    var heat = fuelKWh * (v.eff / 100);
    var hpKWh = v.cop > 0 ? heat / v.cop : 0;
    var hpCost = hpKWh * v.elec;
    var save = v.spend - hpCost;
    var co2Old = electric ? fuelKWh * c.grid : fuelKWh * FACTOR[v.fuel];
    var co2New = hpKWh * c.grid;
    var net = Math.max(0, v.cost - v.grant);
    HG.$('[data-out="save"]').textContent = (save >= 0 ? '' : '+') + HG.money(Math.abs(save), cur) + (save >= 0 ? ' saved' : ' more');
    HG.rows('#hp-rows', [
      ['Heat your home uses', HG.num(heat) + ' kWh a year'],
      ['Heating cost today', HG.money(v.spend, cur)],
      ['Heat pump electricity', HG.num(hpKWh) + ' kWh'],
      ['Heat pump running cost', HG.money(hpCost, cur)],
      ['Cost after grants', HG.money(net, cur)],
      ['Simple payback', save > 0 ? HG.num(net / save, 1) + ' years' : 'No payback on running cost alone'],
      ['CO₂ today', HG.num(co2Old / 1000, 2) + ' t a year'],
      ['CO₂ with a heat pump', HG.num(co2New / 1000, 2) + ' t a year'],
      ['CO₂ cut', HG.num(Math.max(0, co2Old - co2New) / 1000, 2) + ' t a year']
    ]);
  }
  HG.tool(form, 'heatpump', compute, onCountry);
})();
