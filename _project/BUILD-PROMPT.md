# Hello.Green — phase-wise build prompt

Use these prompts in order. Each phase ends with a checkable deliverable. Domain: **Hello.Green** ("hello green"). Repo: `webworksa1/hello-green`, published by GitHub Pages from the `main` branch (root).

---

## Business idea (the brief behind every phase)

**Hello.Green is a green-home savings hub.** Visitors arrive with one question: *"How much would going green save me, and who can do it?"* The site answers with free calculators (carbon, solar, EV, heat pump, home energy), plain-English guides, an incentives directory for the US, Canada, UK, India and Australia, and a free quote request that routes homeowners to vetted local installers.

Revenue lines, in order of expected size:
1. **Lead generation** — solar, battery, heat pump, EV charger, insulation and audit quote requests sold or referred to partner installers (pay-per-lead or revenue share). Installers join through the Pros page.
2. **Google AdSense** — auto ads on high-intent energy, solar and home-improvement content (publisher `ca-pub-6620975821265271`).
3. **Sponsorships & advertising** — sponsored tools, newsletter slots, contest sponsorship, clearly labelled sponsored guides.
4. **Supporter funding** — one-time and monthly contributions for operations, promotion, hiring and contest prizes.
5. **Newsletter** — owned audience that recirculates traffic to tools and quotes.

Brand rules: write "Hello.Green" with the dot. Original logo (sun-yellow dot between the words). Do not use or imitate any third-party "HelloGreen" / "Hello Green" marks. Every page carries the trademark/copyright disclosure link in the footer.

---

## Phase 1 — Foundation and compliance

> Create a static, dependency-free website for Hello.Green that runs on GitHub Pages (main branch, root) with relative links so it works both on `https://hello.green/` and on the `github.io/hello-green/` project URL. Add `.nojekyll`, `ads.txt` (`google.com, pub-6620975821265271, DIRECT, f08c47fec0942fa0`), `robots.txt`, `sitemap.xml`, a 404 page, favicon, web manifest and Open Graph image. Put the AdSense script in the `<head>` of every page:
> `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6620975821265271" crossorigin="anonymous"></script>`
> On top of every page show a slim bar: "Contact, if you are interested in this website / domain name / Sponsorship / Advertisement / Partnership", linked to `https://web.works/contact`. The text "web.works" must never appear on the page; it lives only in the link.
> Write About, Contact, Privacy Policy (AdSense cookies, Google partner-sites link, form processor, local storage, YouTube embeds, GDPR/CCPA/PIPEDA/Law 25 rights), Terms of Use, and a Trademark & Copyright Disclosure page.

**Deliverable:** every page loads, passes HTML validation, and links to the legal pages from the footer.

## Phase 2 — Design system

> Build a distinctive visual identity: pale mist background, deep pine text, sun-yellow action colour, fern links; Bricolage Grotesque for interface and headings, Source Serif 4 for long-form reading. One memorable element: the hero "power bill" card where a slider on the monthly bill updates estimated savings from solar, a heat pump and efficiency fixes in real time. Responsive to 320px, dark mode toggle, visible keyboard focus, reduced-motion support, WCAG AA contrast.

**Deliverable:** shared CSS and layout used by all pages; Lighthouse accessibility ≥ 95.

## Phase 3 — Lead generation engine

> Build `quotes.html`: a four-step form (projects → home & location → energy & timeline → contact & consent) with a progress bar, back/next, validation, the option to choose how many pros (1–3) contact the user, a "no spam calls" promise and explicit consent text. Prefill from URL parameters so the hero form and every calculator hand off (`?project=solar&zip=…&bill=…`). Add a partner sign-up for installers on `pros.html`.
> All forms post through a form-to-email relay. The destination inbox is assembled at runtime from encoded character codes so it never appears in the HTML, source text or rendered page. Include a honeypot field, success and error states, and no `mailto:` links anywhere.

**Deliverable:** a test submission arrives in the owner's inbox; view-source search for the address returns nothing.

## Phase 4 — Tools

> Ship seven client-side tools, each with a methodology note and a quote hand-off: Carbon Footprint (quick and detailed modes, national-average and "planets" comparison), Solar Savings (system size, cost, payback, 25-year savings, CO₂ avoided), EV vs Gas, Heat Pump Savings, Home Energy Quick Wins (LEDs, standby, thermostat, water heating), Recycling Sorter (searchable "which bin?" list) and a Green Score quiz. Save inputs in local storage so returning users keep their numbers.

## Phase 5 — Content for AdSense approval

> Write at least 12 original, useful guides (800+ words each) on solar after the US tax-credit change, heat pumps, home batteries, EV charging, DIY energy audits, reading your power bill, insulation and air sealing, household carbon, zero-waste kitchen, composting, avoiding greenwashing, and saving water. Add a searchable glossary, an incentives directory by country with official links and a "last checked" date, a 30-day green challenge tracker and a guides hub. No thin pages, no placeholder text, no copied content.

## Phase 6 — Self-updating content

> Add a GitHub Actions workflow that runs every 6 hours (plus manual run) and: pulls headlines from reputable environment and clean-energy RSS feeds into `data/news.json`; pulls the latest uploads from selected YouTube channels into `data/videos.json`; pulls the Mauna Loa CO₂ record (NOAA) and the global temperature anomaly (NASA GISTEMP) into `data/planet.json`; pre-renders the latest headlines into the HTML between markers so search engines see fresh content; refreshes `sitemap.xml` dates; and commits only when something changed. Failures in one source must never wipe existing data.

## Phase 7 — Community and revenue pages

> Build Support (one-time/monthly toggle, preset tiers, custom amount, business sponsorship, a transparent "where the money goes" split covering operations, promotion and marketing, hiring, and contest prizes; a configurable checkout link plus a pledge form fallback), Contests (current contest, prizes, judging criteria, entry form, official rules), Careers (open roles and application form), Advertise (packages and inquiry form) and Pros (installer partner sign-up).

## Phase 8 — Launch and growth

> Push to `main`, enable GitHub Pages from `main` / root, run the data workflow once, verify every page and data file on the live URL, then point `hello.green` DNS at GitHub Pages (A records 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153; `www` CNAME to `webworksa1.github.io`), set the custom domain and enforce HTTPS. Submit the sitemap to Google Search Console, apply for AdSense, enable Google's consent message (Privacy & messaging) for EEA/UK visitors, and activate the form relay from its first confirmation email.

---

## Expansion backlog

- State/province landing pages ("solar savings in Ontario", "heat pump grants in Wales") built from one template.
- Installer directory with reviews once partner volume exists.
- Newsletter automation (weekly digest from `news.json`).
- Additional languages (French for Québec, Hindi for India).
