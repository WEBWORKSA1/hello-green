/* Green Score quiz */
(function () {
  'use strict';
  var HG = window.HG, form = HG.$('#quiz-form');
  if (!form) return;
  var Q = [
    { q: 'How is your home heated?', o: ['Oil, propane or coal', 'Natural gas', 'Electric heaters', 'Heat pump or district heat'], tip: 'Price a heat pump: it is usually the single largest cut in home emissions.', link: 'tools/heat-pump-savings.html' },
    { q: 'Where does your electricity come from?', o: ['I have no idea', 'Standard grid supply', 'Partly green tariff or community solar', '100% renewable tariff or my own solar'], tip: 'Check for a green tariff or community solar, then run the solar calculator.', link: 'tools/solar-savings.html' },
    { q: 'How draughty is your home in winter?', o: ['Very, I can feel it', 'A few cold spots', 'Mostly sealed', 'Sealed and well insulated'], tip: 'Seal drafts and top up attic insulation. It is cheap and fast.', link: 'guides/insulation-air-sealing.html' },
    { q: 'How do you usually get to work or school?', o: ['Drive alone', 'Car share or hybrid', 'Bus, train or EV', 'Walk, cycle or work from home'], tip: 'Compare an EV, or swap one car trip a week for transit or cycling.', link: 'tools/ev-vs-gas.html' },
    { q: 'How many flights do you take a year?', o: ['5 or more', '3 to 4', '1 to 2', 'None'], tip: 'One fewer return flight can outweigh a year of small changes.', link: 'guides/household-carbon-footprint.html' },
    { q: 'How often do you eat beef or lamb?', o: ['Most days', 'A few times a week', 'Once a week or less', 'Never'], tip: 'Swap beef and lamb for chicken, beans or lentils a few nights a week.', link: 'guides/household-carbon-footprint.html' },
    { q: 'How much food ends up in the bin?', o: ['A lot', 'Some each week', 'Very little', 'Almost none, and I compost'], tip: 'Plan meals, freeze extras and start composting scraps.', link: 'guides/composting-at-home.html' },
    { q: 'When you need something, you usually…', o: ['Buy new, fast delivery', 'Buy new, but research it', 'Buy second-hand or repair first', 'Borrow, swap or go without'], tip: 'Try second-hand first and repair before replacing.', link: 'guides/spot-greenwashing.html' },
    { q: 'Which describes your lighting?', o: ['Mostly old bulbs', 'Mix of old and LED', 'Mostly LED', 'All LED with timers or sensors'], tip: 'Swap your most-used bulbs to LEDs this week.', link: 'tools/home-energy.html' },
    { q: 'How do you handle water at home?', o: ['Long hot showers, no fixes', 'Some care', 'Short showers, full loads', 'Low-flow fixtures and leak checks'], tip: 'Fit a low-flow showerhead and fix leaks first.', link: 'guides/save-water-at-home.html' }
  ];
  var LEVELS = [[90, 'Old-growth', 'You are well ahead. Help others: share a tool or enter a contest.'], [75, 'Grove', 'Strong habits. A big upgrade (solar, heat pump, EV) would be your next step.'], [60, 'Sapling', 'Good base. Two or three changes below will move you up a level.'], [40, 'Sprout', 'Plenty of easy wins left, and most of them save money.'], [0, 'Seedling', 'Everyone starts somewhere. Pick one tip below and do it this week.']];
  HG.$('#quiz-qs').innerHTML = Q.map(function (item, i) {
    return '<fieldset class="quiz-q"><legend>' + (i + 1) + '. ' + item.q + '</legend><div class="quiz-opts">' + item.o.map(function (o, k) {
      return '<label><input type="radio" name="q' + i + '" value="' + k + '" required> ' + o + '</label>';
    }).join('') + '</div></fieldset>';
  }).join('');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var answers = Q.map(function (_, i) { var r = HG.$('input[name="q' + i + '"]:checked', form); return r ? +r.value : null; });
    var missing = answers.indexOf(null);
    if (missing > -1) { HG.$('#quiz-msg').textContent = 'Answer question ' + (missing + 1) + ' to see your score.'; HG.$('input[name="q' + missing + '"]', form).focus(); return; }
    HG.$('#quiz-msg').textContent = '';
    var score = Math.round(answers.reduce(function (s, a) { return s + a; }, 0) / (Q.length * 3) * 100);
    var lvl = LEVELS.filter(function (l) { return score >= l[0]; })[0];
    var weakest = answers.map(function (a, i) { return [a, i]; }).sort(function (a, b) { return a[0] - b[0]; }).slice(0, 3);
    var out = HG.$('#quiz-result');
    HG.$('[data-out="score"]', out).textContent = score + '/100';
    HG.$('[data-out="level"]', out).textContent = lvl[1] + '. ' + lvl[2];
    HG.$('#quiz-tips').innerHTML = weakest.map(function (w) { var item = Q[w[1]]; return '<li>' + item.tip + ' <a href="' + HG.root + item.link + '">Start here</a></li>'; }).join('');
    out.hidden = false; out.focus();
    HG.store.set('green-score', score);
  });
})();
