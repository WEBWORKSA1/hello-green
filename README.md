# Hello.Green

Green-home savings hub: free calculators, plain-English guides, an incentives directory, self-updating news, videos and climate data, and a lead-generation quote marketplace. Static site published by GitHub Pages from the `main` branch.

## What is in the repo

| Path | Purpose |
|---|---|
| `index.html`, `*.html`, `tools/`, `guides/` | The built website (generated, do not hand-edit) |
| `assets/css/site.css` | Design system |
| `assets/js/site.js` | Navigation, theme, search, forms, live data |
| `assets/js/config.js` | **Editable settings**: payment links for the Support page |
| `assets/js/tools/` | Calculators |
| `data/*.json` | Self-updating data (news, videos, CO₂/temperature) and the search index |
| `_src/` | Page sources, guide Markdown and the build script (not published) |
| `_scripts/` | Data updater and helpers (not published) |
| `_project/` | Competitive research log and the phase-wise build prompt (not published) |
| `.github/workflows/auto-refresh.yml` | Refreshes data every 6 hours and commits changes |
| `.github/workflows/activate-forms.yml` | One-time form relay activation |
| `ads.txt` | AdSense publisher declaration |

## Edit and rebuild

```bash
npm install
npm run build        # regenerates every page from _src/
```

Pages live in `_src/pages/` (HTML with a JSON meta block). Guides are Markdown in `_src/guides/`. Glossary terms are in `_src/data/glossary.json`.

## Self-updating content

`auto-refresh.yml` runs every six hours (and on demand from the Actions tab). It pulls headlines from environmental newsrooms' RSS feeds, recent uploads from selected YouTube channels, the Mauna Loa CO₂ record (NOAA) and the global temperature record (NASA GISTEMP), writes them to `data/`, pre-renders them into the HTML, updates `sitemap.xml` and commits only when something changed. A failing source never wipes existing data.

## Forms

All forms post to a form-to-email relay. The destination inbox is assembled at runtime and never appears as text in the site. The relay sends a one-time **Activate** email the first time it is used for a domain: run the *Activate form relay* workflow once (or submit any form), then click Activate in that email.

## Payments for supporters

Paste a Stripe Payment Link, PayPal or similar URL into `assets/js/config.js` (`oneTime`, `monthly`). Until then the Support page collects pledges and the owner sends a payment link.

## Custom domain

1. DNS for `hello.green`: A records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`; `www` CNAME to `webworksa1.github.io`.
2. Repository Settings → Pages → Custom domain: `hello.green`, then tick *Enforce HTTPS*.

All internal links are relative, so the site works on both the project URL and the custom domain.

## AdSense

The AdSense script is in the `<head>` of every page and `ads.txt` is at the root. After the domain is live, add the site in AdSense, and turn on Google's consent message (Privacy & messaging) for EEA/UK visitors.

© 2026 Hello.Green. All rights reserved. Independent publication, not affiliated with any company or product named "Hello Green" or "HelloGreen".
