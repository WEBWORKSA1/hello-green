/* 30-day challenge tracker, stored on this device. */
(function () {
  'use strict';
  var HG = window.HG, list = HG && HG.$('#challenge-list');
  if (!list) return;
  var DAYS = [
    'Switch your washing machine to cold for every load', 'Find your price per kWh on your power bill', 'Swap your three most-used bulbs to LEDs',
    'Put the TV and console on a power strip and switch it off at night', 'Carry a reusable bottle and bag all day', 'Plan five dinners before you shop',
    'Turn the thermostat down 1°C (or up 1°C in summer)', 'Check your fridge door seal with the paper test', 'Have a meat-free day',
    'Walk, cycle or take transit for one trip you would drive', 'Set your water heater to 49°C (120°F)', 'Unsubscribe from five marketing emails or catalogues',
    'Take five-minute showers all day', 'Seal one drafty door or window with weatherstripping', 'Start a scrap bowl for compost',
    'Do the toilet dye test for leaks', 'Air-dry one load of laundry', 'Cook a “use it up” meal from leftovers',
    'Check tyre pressure on your car or bike', 'Repair something instead of replacing it', 'Run your numbers in the carbon footprint calculator',
    'Fit a tap aerator or low-flow showerhead', 'Buy something second-hand instead of new', 'Look for a green electricity tariff or community solar',
    'Do the 30-minute DIY energy audit', 'Insulate the first two metres of hot water pipe', 'Program a thermostat setback for nights',
    'Run the solar or heat pump calculator', 'Share one tip with a friend or neighbour', 'Pick your next big upgrade and request quotes'
  ];
  var done = HG.store.get('challenge', []);
  list.innerHTML = DAYS.map(function (d, i) {
    return '<li><label><input type="checkbox" data-day="' + i + '"' + (done.indexOf(i) > -1 ? ' checked' : '') + '><span class="day">Day ' + (i + 1) + '</span><span>' + d + '</span></label></li>';
  }).join('');
  function update() {
    done = HG.$$('input[data-day]:checked', list).map(function (c) { return +c.getAttribute('data-day'); });
    HG.store.set('challenge', done);
    HG.$('[data-done]').textContent = done.length;
    HG.$('[data-bar]').style.width = (done.length / DAYS.length * 100) + '%';
  }
  list.addEventListener('change', update);
  HG.$('[data-clear]').addEventListener('click', function () { HG.$$('input[data-day]', list).forEach(function (c) { c.checked = false; }); update(); });
  HG.$('[data-share]').addEventListener('click', function () {
    var text = 'I have completed ' + done.length + ' of 30 days of the Hello.Green challenge. Join me:';
    var url = 'https://hello.green/challenge.html';
    var msg = HG.$('[data-share-msg]');
    if (navigator.share) { navigator.share({ title: 'Hello.Green 30-day challenge', text: text, url: url }).catch(function () {}); return; }
    if (navigator.clipboard) navigator.clipboard.writeText(text + ' ' + url).then(function () { msg.textContent = 'Copied. Paste it anywhere to share.'; });
  });
  update();
})();
