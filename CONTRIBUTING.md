# Contributing · योगदान

धन्यवाद! तपाईंको सानो सुधारले पनि धेरै नागरिकलाई सरकारी सेवासम्म पुग्न मद्दत गर्छ।
Thank you for helping. Even a one-line fix helps many people reach the right government service.

## Ways to help (no code needed)
- **Report wrong information:** use the "Report wrong information" link at the bottom of any page, or [open an issue](../../issues/new/choose).
- **Suggest an official site** that is missing: use the *Add an official site* issue form.
- **Check translations:** the Maithili, Bhojpuri and Nepal Bhasa text in the app are drafts. Native speakers can correct them with the *Translation* form.
- **Test** on your phone and report anything that looks broken.

## Rules for content
1. **Official sources only.** A government link must be the body's own site (usually `.gov.np`, `.edu.np` for public universities, or the domain the body itself publishes). Give the source in your pull request.
2. **No personal data.** Nothing in this project may ask for, store or send a visitor's personal details. Do not add forms, analytics, trackers or login.
3. **No third-party scripts.** Scripts are self-hosted in `vendor/`. The Content-Security-Policy blocks everything else.
4. **Nothing that needs constant upkeep.** Prefer features that stay correct without someone updating them every week. Yearly items (tax slabs, holidays) are listed in the README.
5. **Neutral and non-commercial.** No party politics, adverts or paid listings.
6. **Bilingual.** User-facing text is written in Nepali and English with `t('नेपाली', 'English')`.

## Running it locally
There is no build step for the app itself.

    git clone https://github.com/lamsalk12/nagarik-sewa-portal.git
    cd nagarik-sewa-portal
    python3 -m http.server 8080      # or: npx serve .

Open http://localhost:8080. The tools below need Node 20+.

## Making a change
Almost everything lives in `index.html` (data arrays near the top, React components below; see the README for a map).

1. Fork the repository and create a branch.
2. Make your change in `index.html`.
3. If you changed anything inside the main `<script>`, update the security policy hash:

       node tools/csp.mjs --write

4. If you changed guides, life events, districts, rights, the quiz or helplines, rebuild the shareable pages:

       node tools/build-pages.mjs

   New pages also need a sharing image: `python3 tools/og-images.py` (needs Playwright; see the script header). A maintainer can do this for you.
5. If you changed files the app caches offline, bump `VERSION` in `sw.js`.
6. Open a pull request. The **Site checks** workflow confirms the policy hash, the generated pages and the JSON files are up to date.

## Pull request checklist
- [ ] Every new link points to an official source, given in the PR description
- [ ] Text is in both Nepali and English
- [ ] `node tools/csp.mjs` and `node tools/build-pages.mjs --check` pass
- [ ] Tested on a narrow (phone) screen

By contributing you agree that your contribution is released under the project's [MIT licence](LICENSE)
and that you follow the [code of conduct](CODE_OF_CONDUCT.md).
