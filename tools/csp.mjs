#!/usr/bin/env node
/* Keeps the Content-Security-Policy in index.html in step with the inline app script.
   The policy allows only this site's own scripts plus the exact inline script (by SHA-256 hash).
   Usage:  node tools/csp.mjs          check; exits 1 if the policy is out of date
           node tools/csp.mjs --write  update the policy after editing the inline script */
import fs from 'node:fs';
import crypto from 'node:crypto';
const file = new URL('../index.html', import.meta.url);
let html = fs.readFileSync(file, 'utf8');
const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*type="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const hashes = inline.map(code => `'sha256-${crypto.createHash('sha256').update(code, 'utf8').digest('base64')}'`);
const policy = [
  "default-src 'self'",
  `script-src 'self' ${hashes.join(' ')}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self'",
  "manifest-src 'self'",
  "worker-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
  "upgrade-insecure-requests"
].join('; ');
const re = /(<meta http-equiv="Content-Security-Policy" content=")([^"]*)(">)/;
const current = (html.match(re) || [])[2];
if (current === undefined) { console.error('No CSP meta tag found in index.html'); process.exit(1); }
if (process.argv.includes('--write')) {
  fs.writeFileSync(file, html.replace(re, `$1${policy}$3`));
  console.log(`CSP updated (${inline.length} inline script${inline.length === 1 ? '' : 's'} allowed by hash).`);
} else if (current !== policy) {
  console.error('The Content-Security-Policy is out of date: the inline script changed.\nRun: node tools/csp.mjs --write');
  process.exit(1);
} else console.log('CSP is up to date.');
