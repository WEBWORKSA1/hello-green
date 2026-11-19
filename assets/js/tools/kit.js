/* Shared tool helpers: country presets, form state, results rendering. */
(function () {
  'use strict';
  var HG = window.HG;
  // Editable defaults. Prices are typical household figures; users should replace them with their own bill.
  HG.COUNTRY = {
    US: { name: 'United States', cur: 'USD', elec: 0.18, grid: 0.37, units: 'us', fuel: 3.20, solarW: 3.00, sun: 4.5, export: 75, capita: 14.5, gas: 1.60, gasUnit: 'therm', oil: 3.80, propane: 2.80, liquidUnit: 'gal' },
    CA: { name: 'Canada', cur: 'CAD', elec: 0.14, grid: 0.11, units: 'metric', fuel: 1.55, solarW: 2.80, sun: 3.8, export: 100, capita: 14.0, gas: 0.50, gasUnit: 'm3', oil: 1.70, propane: 0.95, liquidUnit: 'L' },
    UK: { name: 'United Kingdom', cur: 'GBP', elec: 0.26, grid: 0.20, units: 'metric', fuel: 1.40, solarW: 1.50, sun: 2.8, export: 50, capita: 4.4, gas: 0.065, gasUnit: 'kWh', oil: 0.70, propane: 0.75, liquidUnit: 'L' },
    EU: { name: 'European Union', cur: 'EUR', elec: 0.28, grid: 0.25, units: 'metric', fuel: 1.75, solarW: 1.50, sun: 3.5, export: 40, capita: 5.8, gas: 0.10, gasUnit: 'kWh', oil: 1.10, propane: 0.90, liquidUnit: 'L' },
    IN: { name: 'India', cur: 'INR', elec: 7, grid: 0.71, units: 'metric', fuel: 100, solarW: 55, sun: 5.0, export: 100, capita: 2.1, gas: 50, gasUnit: 'm3', oil: 90, propane: 70, liquidUnit: 'L' },
    AU: { name: 'Australia', cur: 'AUD', elec: 0.32, grid: 0.62, units: 'metric', fuel: 1.95, solarW: 1.10, sun: 4.8, export: 25, capita: 14.5, gas: 0.13, gasUnit: 'kWh', oil: 1.90, propane: 1.40, liquidUnit: 'L' }
  };
  HG.WORLD_CAPITA = 4.7;

  HG.readForm = function (form) {
    var v = {};
    HG.$$('[name]', form).forEach(function (el) {
      if (el.type === 'radio') { if (el.checked) v[el.name] = el.value; return; }
      if (el.type === 'checkbox') { v[el.name] = el.checked; return; }
      v[el.name] = (el.type === 'number' || el.type === 'range') ? (parseFloat(el.value) || 0) : el.value;
    });
    return v;
  };
  HG.writeForm = function (form, v) {
    Object.keys(v || {}).forEach(function (k) {
      HG.$$('[name="' + k + '"]', form).forEach(function (el) {
        if (el.type === 'radio') el.checked = el.value === String(v[k]);
        else if (el.type === 'checkbox') el.checked = !!v[k];
        else el.value = v[k];
      });
    });
  };
  // Wire a calculator: restore saved inputs, recompute on every change, save again.
  HG.tool = function (form, key, compute, onCountry) {
    if (typeof form === 'string') form = HG.$(form);
    if (!form) return;
    var saved = HG.store.get('tool-' + key, null);
    if (saved) HG.writeForm(form, saved);
    function run() { var v = HG.readForm(form); compute(v); HG.store.set('tool-' + key, v); }
    form.addEventListener('input', run);
    form.addEventListener('change', function (e) {
      if (e.target.name === 'country' && onCountry) { onCountry(HG.COUNTRY[e.target.value] || HG.COUNTRY.US, form); }
      run();
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); run(); });
    var reset = HG.$('[data-reset]', form);
    if (reset) reset.addEventListener('click', function () { HG.store.set('tool-' + key, null); location.reload(); });
    if (!saved && onCountry) onCountry(HG.COUNTRY[(HG.$('[name="country"]', form) || {}).value] || HG.COUNTRY.US, form);
    run();
  };
  HG.set = function (form, name, value) { var el = HG.$('[name="' + name + '"]', form); if (el) el.value = value; };
  HG.text = function (sel, txt) { HG.$$(sel).forEach(function (el) { el.textContent = txt; }); };
  HG.bars = function (sel, rows, fmt) {
    var el = HG.$(sel); if (!el) return;
    var max = Math.max.apply(null, rows.map(function (r) { return r[1]; }).concat([0.0001]));
    el.innerHTML = rows.map(function (r) {
      return '<li><span>' + HG.esc(r[0]) + '</span><span>' + fmt(r[1]) + '</span><span class="bar"><i style="width:' + Math.max(1, Math.round(r[1] / max * 100)) + '%"></i></span></li>';
    }).join('');
  };
  HG.rows = function (sel, rows) {
    var el = HG.$(sel); if (!el) return;
    el.innerHTML = rows.map(function (r) { return '<li><span>' + HG.esc(r[0]) + '</span><span>' + r[1] + '</span></li>'; }).join('');
  };
})();
