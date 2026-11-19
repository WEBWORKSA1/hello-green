/* Support page: frequency toggle, optional instant checkout, pledge fallback. */
(function () {
  'use strict';
  var HG = window.HG, form = HG && HG.$('#support-form');
  if (!form) return;
  var cfg = (window.HG_CONFIG && window.HG_CONFIG.checkout) || {};
  var freq = HG.$('[name="frequency"]', form);
  function link() { return freq.value === 'monthly' ? cfg.monthly : cfg.oneTime; }
  function refresh() {
    HG.$$('[data-freq]', form).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-freq') === freq.value)); });
    HG.$('[data-support-hint]', form).textContent = link() ? 'You will continue to our secure payment page. We also email you a receipt.' : 'We will email you a secure payment link within one business day. Nothing is charged until you confirm.';
  }
  HG.$$('[data-freq]', form).forEach(function (b) { b.addEventListener('click', function () { freq.value = b.getAttribute('data-freq'); refresh(); }); });
  HG.$('#sp-other').addEventListener('input', function (e) { if (e.target.value) HG.$$('[name="amount"]', form).forEach(function (r) { r.checked = false; }); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (HG.$('[name="_honey"]', form).value) return;
    var msg = HG.$('.form-msg', form);
    if (!HG.validate(form)) { msg.className = 'form-msg err'; msg.textContent = 'Add your name and email to continue.'; return; }
    var data = HG.formData(form);
    var amount = data.other_amount || data.amount;
    if (!amount) { msg.className = 'form-msg err'; msg.textContent = 'Choose or enter an amount.'; return; }
    data.amount = amount; delete data.other_amount;
    var btn = HG.$('[data-support-btn]', form); btn.disabled = true; btn.textContent = 'One moment…';
    var target = link();
    HG.send('Support pledge (' + data.frequency + ', ' + amount + ' ' + data.currency + ')', data).catch(function () { return null; }).then(function (res) {
      if (target) { location.href = target; return; }
      if (res === null) { msg.className = 'form-msg err'; msg.textContent = 'That did not go through. Check your connection and try again.'; btn.disabled = false; btn.textContent = 'Continue to secure payment'; return; }
      form.hidden = true; var done = HG.$('#support-done'); done.hidden = false; done.focus();
    });
  });
  refresh();
})();
