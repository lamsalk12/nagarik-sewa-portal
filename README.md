# Citizen Services Portal (PWA)

A community-led initiative. Not affiliated with the Government of Nepal.

Live: https://lamsalk12.github.io/nagarik-sewa-portal/

Static files, no build step. Host the folder on any HTTPS server (or `localhost`):

    npx serve .        # or: python3 -m http.server 8080

Open it in Chrome/Edge on Android or desktop and use **Install**; on iPhone use Share → Add to Home Screen.
Voice search and read-aloud need the app on its own HTTPS address (they are blocked inside preview frames).

## What is in index.html
- Directory: federal agencies by sector (`SECTORS`), 7 provinces and all 753 local levels (`LOCAL`, from github.com/sagautam5/local-states-nepal, MIT), district offices (`DISTRICTS`, `DAO_OVERRIDE`).
- Guides and life events (`GUIDES`, `JOURNEYS`), Romanized search (`skel`, `matcher`).
- Holiday calendar and office hours (`HOLIDAYS`, `HOLIDAY_YEAR`, `officeHours`).
- Calculators (`TAX_YEAR`, `INCOME_SLABS`, `VEHICLE`, `LAND_RATES`), fake-site checker (`officialList`, `checkSite`), complaints (`COMPLAINTS`), disaster links and safety tips (`DISASTER_LINKS`, `SAFETY`).
- Languages (`LANGS`, `DICT`), read aloud (`Speech`), voice search (`MicButton`), easy read and high contrast (`data-easy`, `data-contrast` CSS).
- No page collects personal details. Preferences stay in the browser's local storage.

## Map
- `map/nepal-map.json`: the app's map. 7 provinces, 77 districts, 753 local levels and protected areas, simplified and pre-projected to SVG paths (viewBox 1000×579). About 880 KB, ~220 KB gzipped; cached for offline use.
- `gis/nepal-admin.topojson`: the same boundaries for GIS tools (QGIS, Mapshaper, D3, Leaflet), WGS84, with three layers:
  `provinces` (province_no, province_name), `districts` (district_en, district_ne, province_no, province_name) and
  `local_levels` (name_en, name_ne, type_en, type_ne, wards, district_en, district_ne, province, website).
- Source: local-level boundaries from the local government portal (sthaniya.gov.np), as packaged in github.com/Acesmndr/nepal-geojson (MIT). Simplified with Mapshaper; district and province shapes are dissolved from the local levels so all borders line up. Not for legal or survey use.
- Deep links: `#map-<province>` (e.g. `#map-gandaki`), `#map-<district>` (`#map-kaski`), `#map-<district>-<local>` (`#map-kaski-pokhara`).

## Yearly updates (do these every budget / new year)
| When | What to change |
|---|---|
| After the federal budget (Jestha) | `TAX_YEAR`, `INCOME_SLABS`, women's rebate text |
| After provincial budgets | `VEHICLE` (only Bagmati has full slabs; others have reference bands), `LAND_RATES` |
| When the next year's holiday list is gazetted (Falgun) | `HOLIDAY_YEAR`, `HOLIDAYS` |
| Office hours change | `OPEN_MIN`, `isWinter`, `officeHours` |

## Shareable pages
`guide/<id>/`, `life-event/<id>/`, `district/<slug>/`, `rights/`, `mental-health/` and `safety/` are plain HTML pages generated from the app's data,
each with its own title, description and sharing image (`og/`). They are what people share and what search engines index.
- After changing guides, life events, districts, rights, quiz or helpline data in `index.html`: `node tools/build-pages.mjs`
- New or renamed pages need images: `python3 tools/og-images.py` (Playwright; see the script header)
- The "Site checks" workflow fails if pages are stale or an image is missing.

## Reporting wrong information
Every page has a "Report wrong information" link that opens a pre-filled GitHub issue (`.github/ISSUE_TEMPLATE/wrong-info.yml`). Reports are public; the form asks people not to include personal details.

## SEO and security
- Search: title, description, canonical URL, Open Graph/Twitter sharing card (`icons/og-image.png`), JSON-LD (WebSite, WebApplication), `sitemap.xml`, crawlable fallback content inside `#root`, per-page titles.
- To appear in Google faster: add the site in Google Search Console and submit `sitemap.xml`.
- `robots.txt` only takes effect at a domain root, so it matters once the site has a custom domain.
- Security: self-hosted scripts in `vendor/`, a strict Content-Security-Policy (scripts by SHA-256 hash), `strict-origin-when-cross-origin` referrer policy, no forms or personal data, service worker caches only successful same-origin responses and Google Fonts.
- After editing the inline script run `node tools/csp.mjs --write`; the "Site checks" workflow fails if the policy is stale. See `SECURITY.md`.

## Monthly link check
`tools/linkcheck.mjs` checks every official site the app links to and writes `link-report.md`/`.json`:

    node tools/linkcheck.mjs index.html

`.github/workflows/link-check.yml` runs it on the 1st of every month when this folder is a GitHub repository, uploads the report, and opens an issue if sites stop responding or move.
Some .gov.np sites block requests from outside Nepal, so re-check failures by hand before removing them.

## Needs review before launch
- Maithili, Bhojpuri and Nepal Bhasa strings in `DICT` are drafts: native speakers should review them.
- Complaint body websites and the women's/tourist/suicide helpline numbers: confirm with each body.
- Land registration rates are commonly published figures, editable in the calculator; confirm each province's current rates.
