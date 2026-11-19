/* Hello.Green core script: navigation, theme, search, forms, live data, small helpers. */
(function () {
  'use strict';
  var doc = document.documentElement;
  var root = doc.getAttribute('data-root') || '';
  var HG = window.HG = window.HG || {};
  HG.root = root;

  /* ---------- Helpers ---------- */
  HG.$ = function (s, c) { return (c || document).querySelector(s); };
  HG.$$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  HG.store = {
    get: function (k, d) { try { var v = localStorage.getItem('hg-' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('hg-' + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };
  HG.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  HG.num = function (n, d) { return Number(n).toLocaleString('en-US', { maximumFractionDigits: d == null ? 0 : d, minimumFractionDigits: d == null ? 0 : d }); };
  HG.money = function (n, cur) {
    cur = cur || 'USD';
    try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(Math.round(n)); }
    catch (e) { return cur + ' ' + HG.num(n); }
  };
  HG.params = function () { var o = {}; new URLSearchParams(location.search).forEach(function (v, k) { o[k] = v; }); return o; };
  HG.fmtDate = function (iso) { var d = new Date(iso); return isNaN(d) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }); };

  /* ---------- Form relay (destination assembled at runtime, never stored as text) ---------- */
  function relay() {
    var u = [126, 108, 105, 126, 118, 121, 114, 122, 104, 56];
    var d = [110, 116, 104, 112, 115, 53, 106, 118, 116];
    var s = function (a) { return a.map(function (c) { return String.fromCharCode(c - 7); }).join(''); };
    return 'https://formsubmit.co/ajax/' + s(u) + String.fromCharCode(64) + s(d);
  }
  HG.send = function (formName, data) {
    var payload = Object.assign({}, data, {
      _subject: 'Hello.Green | ' + formName,
      _template: 'table',
      _captcha: 'false',
      form: formName,
      page: location.href,
      submitted: new Date().toISOString()
    });
    return fetch(relay(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (json) {
        var pending = /activat/i.test(json.message || '');
        if (!res.ok || (String(json.success) === 'false' && !pending)) throw new Error(json.message || 'Request failed');
        return json;
      });
    });
  };
  HG.formData = function (form) {
    var o = {};
    new FormData(form).forEach(function (v, k) {
      if (k === '_honey') return;
      if (o[k]) o[k] = o[k] + ', ' + v; else o[k] = v;
    });
    return o;
  };
  HG.validate = function (scope) {
    var ok = true, first = null;
    HG.$$('input, select, textarea', scope).forEach(function (el) {
      if (el.type === 'hidden' || el.classList.contains('hp') || el.closest('[hidden]')) return;
      var valid = el.checkValidity();
      el.setAttribute('aria-invalid', valid ? 'false' : 'true');
      if (!valid && !first) first = el;
      if (!valid) ok = false;
    });
    HG.$$('[data-require-one]', scope).forEach(function (group) {
      if (group.closest('[hidden]')) return;
      var any = HG.$$('input:checked', group).length > 0;
      group.classList.toggle('need-one', !any);
      if (!any) { ok = false; if (!first) first = HG.$('input', group); }
    });
    if (first) first.focus();
    return ok;
  };
  var MESSAGES = {
    newsletter: 'You are subscribed. The next savings email is on its way.',
    contact: 'Message sent. We reply within two business days.',
    default: 'Sent. Thank you, we will be in touch soon.'
  };
  function bindForm(form) {
    if (form.hasAttribute('data-custom')) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = HG.$('.form-msg', form);
      var hp = HG.$('input[name="_honey"]', form);
      if (hp && hp.value) return;
      if (!HG.validate(form)) { if (msg) { msg.className = 'form-msg err'; msg.textContent = 'Check the highlighted fields.'; } return; }
      var btn = HG.$('[type="submit"]', form);
      var label = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      var name = form.getAttribute('data-hg-form');
      HG.send(name, HG.formData(form)).then(function () {
        if (name === 'newsletter') HG.store.set('subscribed', true);
        var target = form.getAttribute('data-success') ? HG.$(form.getAttribute('data-success')) : null;
        if (target) { form.hidden = true; target.hidden = false; target.focus && target.focus(); }
        else if (msg) { msg.className = 'form-msg ok'; msg.textContent = MESSAGES[name] || MESSAGES.default; form.reset(); }
      }).catch(function () {
        if (msg) { msg.className = 'form-msg err'; msg.textContent = 'That did not go through. Check your connection and send it again.'; }
      }).then(function () { if (btn) { btn.disabled = false; btn.textContent = label; } });
    });
  }

  /* ---------- Prefill from URL ---------- */
  function prefill() {
    var p = HG.params();
    HG.$$('form[data-prefill]').forEach(function (form) {
      Object.keys(p).forEach(function (k) {
        HG.$$('[name="' + k + '"]', form).forEach(function (el) {
          if (el.type === 'checkbox' || el.type === 'radio') { if (p[k].split(',').indexOf(el.value) > -1) el.checked = true; }
          else el.value = p[k];
        });
      });
    });
  }

  /* ---------- Theme ---------- */
  function themeToggle() {
    HG.$$('[data-theme-toggle]').forEach(function (b) {
      b.addEventListener('click', function () {
        var cur = doc.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        var next = cur === 'dark' ? 'light' : 'dark';
        doc.dataset.theme = next;
        try { localStorage.setItem('hg-theme', next); } catch (e) { /* ignore */ }
      });
    });
  }

  /* ---------- Navigation ---------- */
  function nav() {
    var toggle = HG.$('.nav-toggle'), menu = HG.$('#main-nav');
    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        var open = !menu.classList.contains('open');
        menu.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      });
    }
    HG.$$('.has-menu').forEach(function (li) {
      var btn = HG.$('.menu-btn', li);
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = !li.classList.contains('open');
        li.classList.toggle('open', open);
        btn.setAttribute('aria-expanded', String(open));
      });
    });
    document.addEventListener('click', function (e) {
      HG.$$('.has-menu.open').forEach(function (li) { if (!li.contains(e.target)) { li.classList.remove('open'); HG.$('.menu-btn', li).setAttribute('aria-expanded', 'false'); } });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      HG.$$('.has-menu.open').forEach(function (li) { li.classList.remove('open'); HG.$('.menu-btn', li).setAttribute('aria-expanded', 'false'); });
      if (menu && menu.classList.contains('open')) { menu.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); }
    });
  }

  /* ---------- Search ---------- */
  function search() {
    var overlay = HG.$('[data-search]'); if (!overlay) return;
    var input = HG.$('#site-search'), list = HG.$('#search-results'), index = null, last = null;
    function open() {
      last = document.activeElement; overlay.hidden = false; input.value = ''; list.innerHTML = ''; input.focus();
      if (!index) fetch(root + 'data/search-index.json').then(function (r) { return r.json(); }).then(function (j) { index = j; render(input.value); }).catch(function () { index = []; });
      else render(input.value);
    }
    function close() { overlay.hidden = true; if (last) last.focus(); }
    function render(q) {
      if (!index) return;
      var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
      var hits = index.map(function (p) {
        var hay = (p.t + ' ' + p.d + ' ' + p.k).toLowerCase(), score = 0;
        for (var i = 0; i < terms.length; i++) { if (hay.indexOf(terms[i]) === -1) return null; score += p.t.toLowerCase().indexOf(terms[i]) > -1 ? 3 : 1; }
        return { p: p, s: score };
      }).filter(Boolean).sort(function (a, b) { return b.s - a.s; }).slice(0, 12);
      list.innerHTML = hits.length ? hits.map(function (h) { return '<li><a href="' + root + h.p.u + '"><strong>' + HG.esc(h.p.t) + '</strong><small>' + HG.esc(h.p.d) + '</small></a></li>'; }).join('') : '<li class="muted" style="padding:.8rem">No matches. Try “solar”, “heat pump” or “compost”.</li>';
    }
    HG.$$('[data-search-open]').forEach(function (b) { b.addEventListener('click', open); });
    HG.$$('[data-search-close]').forEach(function (b) { b.addEventListener('click', close); });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    input.addEventListener('input', function () { render(input.value); });
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { var a = HG.$('a', list); if (a) location.href = a.href; } });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !overlay.hidden) close();
      if (e.key === '/' && overlay.hidden && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); open(); }
    });
  }

  /* ---------- Cookie note ---------- */
  function cookie() {
    var box = HG.$('[data-cookie]'); if (!box) return;
    if (!HG.store.get('cookie-ok', false)) box.hidden = false;
    HG.$('[data-cookie-ok]', box).addEventListener('click', function () { HG.store.set('cookie-ok', true); box.hidden = true; });
  }

  /* ---------- Daily tip ---------- */
  var TIPS = [
    'Wash clothes in cold water. Heating water is most of the energy a washing machine uses.',
    'Set your water heater to 49°C (120°F). Hotter wastes energy and risks scalding.',
    'Swap your five most-used bulbs to LEDs first. They do most of your lighting hours.',
    'Put your TV, console and speakers on one power strip and switch it off at night.',
    'Turn the heat down 1°C. In most homes that trims heating energy by several percent.',
    'Close curtains at dusk in winter and during afternoon sun in summer.',
    'Run the dishwasher full and skip the heated dry. Open the door and let it air dry.',
    'Defrost your freezer when ice is thicker than about 6 mm. Frost makes it work harder.',
    'Check the fridge door seal: close it on a sheet of paper. If it slides out easily, replace the gasket.',
    'Plan meals for the week and shop with a list. It is the easiest food-waste cut there is.',
    'Freeze bread, ripe bananas and leftover herbs before they spoil.',
    'Keep a bowl on the counter for food scraps and empty it into compost every day or two.',
    'Carry a reusable bottle and cup. Refill stations are on most transit maps now.',
    'Fix a dripping tap. One drip a second wastes thousands of litres a year.',
    'Take a five-minute shower. A low-flow head cuts hot water use further.',
    'Combine errands into one trip. Cold engines burn the most fuel per kilometre.',
    'Check your tyre pressure monthly. Under-inflated tyres waste fuel and wear faster.',
    'Try one meat-free day a week. Swapping beef for beans is a big carbon cut.',
    'Buy loose produce instead of plastic-wrapped packs where you can.',
    'Choose repair before replace. Search the model number plus “repair guide” first.',
    'Unsubscribe from catalogues you never read. Less paper, less clutter.',
    'Seal gaps around doors with weatherstripping. It costs little and you feel it the same day.',
    'Use a lid on pans. Food heats faster and you can turn the burner down.',
    'Microwave or air-fry small portions instead of heating a full oven.',
    'Let leftovers cool before they go in the fridge, then cover them.',
    'Air-dry laundry on a rack when you can. Dryers are among the hungriest appliances.',
    'Clean the dryer lint filter every load. A clogged filter means longer, costlier cycles.',
    'Program your thermostat to lower the temperature when you sleep or are out.',
    'Change or clean your furnace or heat pump filter every one to three months.',
    'Insulate the first two metres of hot water pipe from your water heater.',
    'Use a smart plug or timer on things like coffee makers and aquariums.',
    'Pick ENERGY STAR or high-efficiency labels when you replace an appliance.',
    'Ask your utility for a free or discounted home energy assessment.',
    'Read your power bill for your rate per kWh. You need it to judge any upgrade.',
    'Shade south and west windows with trees, awnings or exterior blinds.',
    'Use ceiling fans in summer so you can set the cooling a couple of degrees higher.',
    'Bring your own container for takeaway and bulk-store shopping.',
    'Donate or sell what you no longer use. Someone nearby is looking for it.',
    'Buy second-hand first for furniture, kids’ gear and tools.',
    'Borrow rarely used tools from a library, neighbour or community share.',
    'Recycle batteries and electronics at a drop-off point, never in household bins.',
    'Rinse recyclables lightly and keep them loose, not bagged, unless your city says otherwise.',
    'Choose rail over short flights when the trip is under about 500 km.',
    'Work from home a day a week if you can. A skipped commute is a big saving.',
    'Walk or cycle for trips under 3 km. They are the trips cars do least efficiently.',
    'Keep your car’s roof rack off when you are not using it. Drag costs fuel.',
    'If you have an EV, charge off-peak. Many utilities price night power lower.',
    'Grow herbs on a windowsill. Fresh basil without the plastic clamshell.',
    'Collect rainwater for the garden where local rules allow it.',
    'Water plants in the early morning so less evaporates.',
    'Leave grass clippings on the lawn. They feed the soil and save bags.',
    'Plant natives. They need less water and feed local pollinators.',
    'Switch to a green electricity tariff or community solar if your area offers one.',
    'Check whether your bank or pension funds fossil fuel expansion. You can move your money.',
    'Use paperless billing and e-tickets wherever you can.',
    'Line-dry towels and sheets outdoors on sunny days.',
    'Turn off the oven a few minutes early. It stays hot enough to finish cooking.',
    'Match pot size to burner size. Small pans on big burners waste heat.',
    'Use the eco programme on your washer and dishwasher. It is slower but uses less energy.',
    'Share this site with a neighbour who is thinking about solar or a heat pump.'
  ];
  HG.tips = TIPS;
  function dailyTip() {
    var start = new Date(new Date().getFullYear(), 0, 0);
    var day = Math.floor((new Date() - start) / 86400000);
    HG.$$('[data-daily-tip]').forEach(function (el) { el.textContent = TIPS[day % TIPS.length]; });
  }

  /* ---------- Live data blocks ---------- */
  var cacheKey = '?h=' + Math.floor(Date.now() / 3600000);
  function getJSON(name) { return fetch(root + 'data/' + name + cacheKey).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); }
  HG.getJSON = getJSON;
  function newsHTML(items) {
    return items.map(function (n) {
      return '<li class="news-item" data-cat="' + HG.esc(n.category) + '"><a href="' + HG.esc(n.link) + '" target="_blank" rel="noopener nofollow">' + HG.esc(n.title) + '</a><span class="news-meta"><span class="news-src">' + HG.esc(n.source) + '</span><span class="news-cat">' + HG.esc(n.category) + '</span><time datetime="' + HG.esc(n.published) + '">' + HG.fmtDate(n.published) + '</time></span></li>';
    }).join('');
  }
  function videoHTML(items) {
    return items.map(function (v) {
      return '<li class="video-item"><button class="yt-lite" type="button" data-yt="' + HG.esc(v.id) + '" aria-label="Play: ' + HG.esc(v.title) + '"><img src="https://i.ytimg.com/vi/' + HG.esc(v.id) + '/hqdefault.jpg" alt="" loading="lazy" width="480" height="360" onerror="this.style.visibility=\'hidden\'"><span class="yt-play" aria-hidden="true"></span></button><h3 class="video-title">' + HG.esc(v.title) + '</h3><p class="video-meta">' + HG.esc(v.channel) + ' <time datetime="' + HG.esc(v.published) + '">' + HG.fmtDate(v.published) + '</time></p></li>';
    }).join('');
  }
  function liveNews() {
    var lists = HG.$$('[data-news]'); if (!lists.length) return;
    getJSON('news.json').then(function (data) {
      var items = data.items || [];
      if (!items.length) return;
      lists.forEach(function (list) {
        var limit = +list.getAttribute('data-limit') || 12;
        var chips = list.getAttribute('data-chips') ? HG.$(list.getAttribute('data-chips')) : null;
        var cat = 'All';
        function draw() { list.innerHTML = newsHTML(items.filter(function (n) { return cat === 'All' || n.category === cat; }).slice(0, limit)); }
        if (chips) {
          var cats = ['All'].concat(items.map(function (n) { return n.category; }).filter(function (c, i, a) { return a.indexOf(c) === i; }).sort());
          chips.innerHTML = cats.map(function (c) { return '<button class="chip" type="button" aria-pressed="' + (c === 'All') + '" data-cat="' + HG.esc(c) + '">' + HG.esc(c) + '</button>'; }).join('');
          chips.addEventListener('click', function (e) {
            var b = e.target.closest('.chip'); if (!b) return;
            cat = b.getAttribute('data-cat');
            HG.$$('.chip', chips).forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); });
            draw();
          });
        }
        draw();
      });
      HG.$$('[data-news-updated]').forEach(function (el) { el.textContent = HG.fmtDate(data.updated); });
    }).catch(function () { /* keep pre-rendered list */ });
  }
  function liveVideos() {
    var lists = HG.$$('[data-videos]'); if (!lists.length) return;
    getJSON('videos.json').then(function (data) {
      var items = data.items || []; if (!items.length) return;
      lists.forEach(function (list) { list.innerHTML = videoHTML(items.slice(0, +list.getAttribute('data-limit') || 8)); });
      HG.$$('[data-videos-updated]').forEach(function (el) { el.textContent = HG.fmtDate(data.updated); });
    }).catch(function () { /* keep pre-rendered list */ });
  }
  function ytLite() {
    document.addEventListener('click', function (e) {
      var b = e.target.closest('.yt-lite'); if (!b) return;
      var id = b.getAttribute('data-yt');
      var f = document.createElement('iframe');
      f.className = 'yt-frame';
      f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0';
      f.title = b.getAttribute('aria-label') || 'YouTube video';
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      f.allowFullscreen = true;
      b.replaceWith(f);
    });
  }

  /* ---------- Newsletter slide-in on guides ---------- */
  function slideIn() {
    if (!document.body.classList.contains('is-guide')) return;
    if (HG.store.get('subscribed', false)) return;
    try { if (sessionStorage.getItem('hg-slide')) return; } catch (e) { /* ignore */ }
    var shown = false;
    window.addEventListener('scroll', function onScroll() {
      var pct = (window.scrollY + innerHeight) / document.body.scrollHeight;
      if (shown || pct < 0.55) return;
      shown = true; window.removeEventListener('scroll', onScroll);
      try { sessionStorage.setItem('hg-slide', '1'); } catch (e) { /* ignore */ }
      var box = document.createElement('aside');
      box.className = 'slide-in'; box.setAttribute('aria-label', 'Newsletter');
      box.innerHTML = '<button class="icon-btn close" type="button" aria-label="Close"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button><h2>Get the home savings checklist</h2><p>One email a week with a money-saving upgrade, the numbers behind it and new incentives. Unsubscribe any time.</p><form data-hg-form="newsletter" novalidate><div class="inline-field"><input type="email" name="email" required placeholder="you@example.com" aria-label="Email address"><button class="btn btn-sun" type="submit">Send it</button></div><input type="hidden" name="source" value="guide-slide-in"><input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true"><p class="form-msg" role="status" aria-live="polite"></p></form>';
      document.body.appendChild(box);
      bindForm(HG.$('form', box));
      HG.$('.close', box).addEventListener('click', function () { box.remove(); });
    }, { passive: true });
  }

  /* ---------- Simple list filter ---------- */
  function listFilter() {
    HG.$$('[data-filter-list]').forEach(function (input) {
      var list = HG.$(input.getAttribute('data-filter-list')); if (!list) return;
      input.addEventListener('input', function () {
        var q = input.value.trim().toLowerCase();
        HG.$$('li', list).forEach(function (li) { li.hidden = q && li.textContent.toLowerCase().indexOf(q) === -1; });
      });
    });
    var q = HG.params().q, s = HG.$('[data-search-open]');
    if (q && s && !HG.$('[data-filter-list]') && !HG.$('#sorter-q')) { s.click(); var inp = HG.$('#site-search'); if (inp) { inp.value = q; inp.dispatchEvent(new Event('input')); } }
  }

  /* ---------- Boot ---------- */
  HG.bindForm = bindForm;
  prefill();
  HG.$$('form[data-hg-form]').forEach(bindForm);
  themeToggle(); nav(); search(); cookie(); dailyTip(); liveNews(); liveVideos(); ytLite(); slideIn(); listFilter();
  HG.$$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
