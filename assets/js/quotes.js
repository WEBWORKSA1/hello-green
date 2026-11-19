/* Quote request: four-step form with validation, conditional fields and hand-off to the relay. */
(function () {
  'use strict';
  var HG = window.HG, form = HG && HG.$('#quote-form');
  if (!form) return;
  var steps = HG.$$('.step', form), bars = HG.$$('.steps-bar span', form);
  var back = HG.$('[data-back]', form), next = HG.$('[data-next]', form), submit = HG.$('[data-submit]', form);
  var i = 0;

  function chosen() { return HG.$$('input[name="project"]:checked', form).map(function (c) { return c.value; }); }
  function conditional() {
    var picks = chosen();
    HG.$$('[data-show-if]', form).forEach(function (el) {
      var needs = el.getAttribute('data-show-if').split(',');
      el.hidden = !needs.some(function (n) { return picks.indexOf(n) > -1; });
    });
  }
  function show(n, initial) {
    i = n;
    steps.forEach(function (s, k) { s.hidden = k !== n; });
    bars.forEach(function (b, k) { b.className = k < n ? 'done' : (k === n ? 'now' : ''); });
    HG.$('[data-step-now]', form).textContent = n + 1;
    back.hidden = n === 0;
    next.hidden = n === steps.length - 1;
    submit.hidden = n !== steps.length - 1;
    conditional();
    if (initial) return;
    var h = HG.$('h2', steps[n]); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    form.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }
  function check() {
    var msg = HG.$('[data-step-msg]', steps[i]);
    var ok = HG.validate(steps[i]);
    if (msg) msg.textContent = ok ? '' : (i === 0 ? 'Pick at least one project to continue.' : 'Fill in the highlighted fields to continue.');
    return ok;
  }
  next.addEventListener('click', function () { if (check()) show(i + 1); });
  back.addEventListener('click', function () { show(i - 1); });
  form.addEventListener('change', function (e) { if (e.target.name === 'project') conditional(); });

  // Remember the visitor's currency from the home page bill card.
  var bill = HG.store.get('bill', null), p = HG.params();
  if (bill && !p.bill) { HG.$('#q-bill').value = bill.v; HG.$('#q-cur').value = bill.cur; }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (HG.$('input[name="_honey"]', form).value) return;
    if (!check()) return;
    var data = HG.formData(form);
    data.projects = chosen().join(', ');
    delete data.project;
    submit.disabled = true; submit.textContent = 'Sending…';
    var msg = HG.$('[data-step-msg]', steps[i]);
    HG.send('Quote request (' + data.projects + ')', data).then(function () {
      if (data.newsletter === 'yes') HG.send('newsletter', { email: data.email, source: 'quote form' }).catch(function () {});
      var done = HG.$('#quote-done');
      HG.$('[data-name]', done).textContent = data.first_name || 'there';
      HG.$('[data-zip]', done).textContent = data.zip || 'you';
      form.hidden = true; done.hidden = false; done.focus();
      HG.store.set('quote-sent', new Date().toISOString());
    }).catch(function () {
      msg.textContent = 'Your request did not go through. Check your connection and press Send again.';
      submit.disabled = false; submit.textContent = 'Send my request';
    });
  });

  show(0, true);
})();
