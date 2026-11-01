# Security policy

## Reporting a vulnerability
Please report security problems privately through **GitHub → Security → Report a vulnerability** on this repository, not in a public issue.
Include what you found, how to reproduce it and what it could affect. You can expect a first reply within 7 days.

## What this site does and does not do
- It is a static site on GitHub Pages: no server code, no login, no database.
- It never asks for personal details. Saved links, history, checklist ticks and settings stay in the visitor's own browser storage.
- Scripts are self-hosted (`vendor/`). A Content-Security-Policy allows only this site's scripts and the inline app script by SHA-256 hash;
  it blocks third-party scripts, frames, plugins and form submissions. Only Google Fonts is loaded from another origin.
- The fake-site checker runs entirely in the browser and never opens the link it checks.

## Keeping it secure
- After editing the inline script in `index.html`, run `node tools/csp.mjs --write`. The CSP check workflow fails if this is forgotten.
- Dependabot keeps the GitHub Actions used here up to date.
- GitHub Pages cannot set HTTP headers, so clickjacking protection (`frame-ancestors`), HSTS preload and Permissions-Policy need a custom domain behind a proxy such as Cloudflare.
