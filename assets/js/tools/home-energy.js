/* Home energy quick wins */
(function () {
  'use strict';
  var HG = window.HG, form = HG.$('#he-form');
  if (!form) return;
  var HVAC = { USD: 1400, CAD: 1600, GBP: 1000, EUR: 1100, INR: 15000, AUD: 900 };
  var WH = { USD: 450, CAD: 450, GBP: 300, EUR: 350, INR: 5000, AUD: 400 };
  function onCountry(c, f) { HG.set(f, 'rate', c.elec); HG.set(f, 'hvac', HVAC[c.cur]); HG.set(f, 'wh_cost', WH[c.cur]); }
  function compute(v) {
    var c = HG.COUNTRY[v.country] || HG.COUNTRY.US, cur = c.cur;
    var ledKWh = v.bulbs * Math.max(0, v.oldw - 9) * v.hours * 365 / 1000;
    var sbKWh = v.devices * v.standby_w * 24 * 365 / 1000 * 0.8;
    var setback = v.hvac * Math.min(0.10, v.setback * 0.02);
    var wh = v.wh_cost * Math.min(0.15, v.wh_deg * 0.007);
    var laundryKWh = v.loads * 52 * 1.5;
    var parts = [
      ['LED bulbs', ledKWh * v.rate],
      ['Standby power', sbKWh * v.rate],
      ['Thermostat setback', setback],
      ['Water heater', wh],
      ['Cold-water laundry', laundryKWh * v.rate]
    ];
    var total = parts.reduce(function (s, p) { return s + p[1]; }, 0);
    var kwh = ledKWh + sbKWh + laundryKWh;
    HG.$('[data-out="total"]').textContent = HG.money(total, cur);
    HG.bars('#he-bars', parts.slice().sort(function (a, b) { return b[1] - a[1]; }), function (x) { return HG.money(x, cur); });
    HG.rows('#he-rows', [
      ['Electricity saved', HG.num(kwh) + ' kWh a year'],
      ['CO₂ avoided from electricity', HG.num(kwh * c.grid / 1000, 2) + ' t a year'],
      ['Typical upfront cost', 'LEDs ' + HG.money(v.bulbs * ({ INR: 150 }[cur] || 3), cur) + ', smart strip ' + HG.money({ INR: 1200 }[cur] || 25, cur)]
    ]);
  }
  HG.tool(form, 'homeenergy', compute, onCountry);
})();
