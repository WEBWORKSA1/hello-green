/* Carbon footprint calculator (quick and detailed modes) */
(function () {
  'use strict';
  var HG = window.HG, form = HG.$('#carbon-form');
  if (!form) return;
  var F = { gasKWh: 0.184, therm: 5.3, m3: 1.9, oilL: 2.68, oilGal: 10.15, petrolL: 2.31, dieselL: 2.68, flyH: 95, busH: 2.5 };
  var DIET = { heavy: 3.3, average: 2.5, low: 1.9, veg: 1.7, vegan: 1.5 };
  var SHOP = { low: 0.6, average: 1.2, high: 2.2 };
  var HOME = { small: { base: 3000, heat: 5000 }, average: { base: 6000, heat: 15000 }, large: { base: 9000, heat: 25000 } };

  HG.$$('[data-mode-btn]', form).forEach(function (b) {
    b.addEventListener('click', function () {
      var m = b.getAttribute('data-mode-btn');
      HG.$('[name="mode"]', form).value = m;
      form.dispatchEvent(new Event('input'));
    });
  });

  function compute(v) {
    var c = HG.COUNTRY[v.country] || HG.COUNTRY.US, imperial = c.units === 'us';
    var km = imperial ? 1.609 : 1;
    HG.text('[data-dist]', imperial ? 'miles' : 'km');
    HG.text('[data-eff]', v.car_fuel === 'ev' ? 'kWh/100 km' : (imperial ? 'mpg' : 'L/100 km'));
    HG.$$('[data-mode-btn]', form).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-mode-btn') === v.mode)); });
    HG.$$('[data-mode]', form).forEach(function (s) { s.hidden = s.getAttribute('data-mode') !== v.mode; });
    var people = Math.max(1, v.people || 1), home = 0, car = 0, flights = 0, transit = 0, waste = 0.3;

    if (v.mode === 'quick') {
      var h = HOME[v.home] || HOME.average, heatKg = 0;
      if (v.heat === 'gas') heatKg = h.heat / 0.9 * F.gasKWh;
      else if (v.heat === 'oil') heatKg = h.heat / 0.85 * 0.25;
      else if (v.heat === 'electric') heatKg = h.heat * c.grid;
      else if (v.heat === 'hp') heatKg = h.heat / 3 * c.grid;
      home = (h.base * c.grid + heatKg) / 1000 / people;
      var perKm = { petrol: 0.075 * F.petrolL, diesel: 0.062 * F.dieselL, hybrid: 0.045 * F.petrolL, ev: 0.18 * c.grid, none: 0 }[v.car] || 0;
      car = v.drive_week * 52 * km * perKm / 1000;
      flights = (v.flights_short * 2 * 1.5 + v.flights_long * 2 * 8) * F.flyH / 1000;
    } else {
      var elecKg = v.green_power ? 0 : v.kwh_month * 12 * c.grid;
      var gasKg = v.gas_month * 12 * (v.gas_unit === 'therm' ? F.therm : v.gas_unit === 'm3' ? F.m3 : F.gasKWh);
      var oilKg = v.oil_year * (v.oil_unit === 'gal' ? F.oilGal : F.oilL);
      home = (elecKg + gasKg + oilKg) / 1000 / people;
      var dist = v.drive_year * km, kg = 0;
      if (v.car_fuel === 'ev') kg = dist / 100 * v.car_eff * c.grid;
      else {
        var lPer100 = imperial ? (v.car_eff > 0 ? 235.215 / v.car_eff : 0) : v.car_eff;
        kg = dist / 100 * lPer100 * (v.car_fuel === 'diesel' ? F.dieselL : F.petrolL);
      }
      car = kg / 1000;
      transit = v.transit_week * 52 * F.busH / 1000;
      flights = (v.fly_short_h + v.fly_long_h) * F.flyH / 1000;
      waste = 0.3 - (v.recycle ? 0.1 : 0) - (v.compost ? 0.1 : 0);
    }
    var food = DIET[v.diet] || 2.5, shop = SHOP[v.shop] || 1.2;
    var parts = [['Home energy', home], ['Driving', car], ['Flights', flights], ['Bus and train', transit], ['Food', food], ['Shopping', shop], ['Waste', waste]];
    var total = parts.reduce(function (s, p) { return s + p[1]; }, 0);

    HG.$('[data-out="total"]').textContent = HG.num(total, 1) + ' t';
    var ratio = total / c.capita;
    HG.$('[data-out="compare"]').textContent = 'tonnes CO₂e per person a year. The average in ' + c.name + ' is about ' + HG.num(c.capita, 1) + ' t, the world about ' + HG.num(HG.WORLD_CAPITA, 1) + ' t. You are at ' + HG.num(total / 2, 1) + '× the 2-tonne climate goal' + (ratio < 1 ? ', below your national average.' : '.');
    HG.bars('#carbon-bars', parts.filter(function (p) { return p[1] > 0.01; }).sort(function (a, b) { return b[1] - a[1]; }), function (x) { return HG.num(x, 1) + ' t'; });

    var TIPS = {
      'Home energy': ['Seal drafts and top up attic insulation, then price a heat pump.', 'tools/heat-pump-savings.html'],
      'Driving': ['Run your numbers on an EV or a hybrid, and batch errands into one trip.', 'tools/ev-vs-gas.html'],
      'Flights': ['Swap one flight a year for rail or a closer trip. It is often your largest single cut.', 'guides/household-carbon-footprint.html'],
      'Bus and train': ['Already a low-carbon choice. Keep it up.', 'guides/household-carbon-footprint.html'],
      'Food': ['Cut beef and lamb first and waste less food. Both shrink this bar fast.', 'guides/zero-waste-kitchen.html'],
      'Shopping': ['Buy second-hand first and repair before replacing.', 'guides/spot-greenwashing.html'],
      'Waste': ['Start composting food scraps and check what your city recycles.', 'tools/recycling-sorter.html']
    };
    var top = parts.slice().sort(function (a, b) { return b[1] - a[1]; }).slice(0, 3);
    HG.$('#carbon-actions').innerHTML = top.map(function (p) { var t = TIPS[p[0]]; return '<li><strong>' + p[0] + ':</strong> ' + t[0] + ' <a href="' + HG.root + t[1] + '">Learn how</a></li>'; }).join('');
    var q = top[0][0] === 'Home energy' ? 'heat-pump' : top[0][0] === 'Driving' ? 'ev-charger' : 'audit';
    HG.$('[data-quote]').href = HG.root + 'quotes.html?project=' + q;
  }
  HG.tool(form, 'carbon', compute, function (c, f) {
    if (c.units === 'us') { HG.set(f, 'drive_week', 125); HG.set(f, 'drive_year', 11000); HG.set(f, 'car_eff', 28); HG.set(f, 'gas_unit', 'therm'); HG.set(f, 'oil_unit', 'gal'); }
    else { HG.set(f, 'drive_week', 200); HG.set(f, 'drive_year', 15000); HG.set(f, 'car_eff', 8); HG.set(f, 'gas_unit', c.gasUnit === 'therm' ? 'therm' : c.gasUnit); HG.set(f, 'oil_unit', 'L'); }
  });
})();
