/* EV vs gas calculator */
(function () {
  'use strict';
  var HG = window.HG, form = HG.$('#ev-form');
  if (!form) return;
  var PUB = { USD: 0.48, CAD: 0.55, GBP: 0.75, EUR: 0.60, INR: 22, AUD: 0.60 };
  var MAINT = { USD: [900, 500], CAD: [1000, 550], GBP: [600, 350], EUR: [700, 400], INR: [15000, 8000], AUD: [1000, 550] };
  var PREM = { USD: 5000, CAD: 6000, GBP: 4000, EUR: 4500, INR: 300000, AUD: 7000 };
  function onCountry(c, f) {
    var us = c.units === 'us';
    HG.set(f, 'dist', us ? 12000 : 15000); HG.set(f, 'eff', us ? 28 : 8); HG.set(f, 'fuel', c.fuel);
    HG.set(f, 'rate', c.elec); HG.set(f, 'pub', PUB[c.cur]); HG.set(f, 'maint_gas', MAINT[c.cur][0]); HG.set(f, 'maint_ev', MAINT[c.cur][1]); HG.set(f, 'premium', PREM[c.cur]);
  }
  function compute(v) {
    var c = HG.COUNTRY[v.country] || HG.COUNTRY.US, us = c.units === 'us', cur = c.cur;
    HG.text('[data-dist]', us ? 'miles' : 'km'); HG.text('[data-eff]', us ? 'mpg' : 'L/100 km'); HG.text('[data-vol]', us ? 'gallon' : 'litre');
    HG.$('#e-home-out').textContent = v.home + '%';
    var km = us ? v.dist * 1.609 : v.dist;
    var litres = us ? (v.eff > 0 ? v.dist / v.eff * 3.785 : 0) : km / 100 * v.eff;
    var fuelCost = us ? (v.eff > 0 ? v.dist / v.eff * v.fuel : 0) : litres * v.fuel;
    var kwh = km / 100 * v.kwh100 * 1.1;
    var chargeCost = kwh * (v.home / 100 * v.rate + (1 - v.home / 100) * v.pub);
    var gasTotal = fuelCost + v.maint_gas, evTotal = chargeCost + v.maint_ev, save = gasTotal - evTotal;
    var co2Gas = litres * (v.fueltype === 'diesel' ? 2.68 : 2.31) / 1000, co2Ev = kwh * c.grid / 1000;
    HG.$('[data-out="save"]').textContent = save >= 0 ? HG.money(save, cur) : 'EV costs ' + HG.money(-save, cur) + ' more';
    HG.rows('#ev-rows', [
      ['Fuel for current car', HG.money(fuelCost, cur)],
      ['Charging the EV', HG.money(chargeCost, cur)],
      ['Total running cost, gas', HG.money(gasTotal, cur)],
      ['Total running cost, EV', HG.money(evTotal, cur)],
      ['Cost per ' + (us ? 'mile' : 'km') + ', gas', HG.money(gasTotal / Math.max(1, v.dist) * 100, cur) + ' per 100'],
      ['Cost per ' + (us ? 'mile' : 'km') + ', EV', HG.money(evTotal / Math.max(1, v.dist) * 100, cur) + ' per 100'],
      ['Years to recover the price gap', save > 0 ? HG.num(v.premium / save, 1) : 'Not on running costs'],
      ['CO₂ a year, gas', HG.num(co2Gas, 2) + ' t'],
      ['CO₂ a year, EV', HG.num(co2Ev, 2) + ' t']
    ]);
  }
  HG.tool(form, 'ev', compute, onCountry);
})();
