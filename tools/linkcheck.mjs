#!/usr/bin/env node
/* Monthly link check for the Citizen Services Portal.
   Reads every official site from index.html (the same list the fake-site checker uses),
   checks each one, and writes link-report.md and link-report.json.
   Usage: node tools/linkcheck.mjs [path/to/index.html]   (Node 18+) */
import fs from 'node:fs';
import vm from 'node:vm';

const file = process.argv[2] || new URL('../index.html', import.meta.url).pathname;
const html = fs.readFileSync(file, 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const app = scripts[scripts.length - 1];

// Run the app script with minimal stubs so the data and officialList() are built.
const noop = () => {};
const hook = v => [typeof v === 'function' ? v() : v, noop];
const React = { createElement: () => null, Fragment: 'f', useState: hook, useEffect: noop, useMemo: f => f(), useRef: () => ({}), useCallback: f => f };
const store = {};
const win = {
  React, ReactDOM: { createRoot: () => ({ render: noop }) },
  localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } },
  matchMedia: () => ({ matches: false }), addEventListener: noop, removeEventListener: noop,
  location: { hash: '', protocol: 'file:' }, navigator: { onLine: true, userAgent: 'node' },
  document: { getElementById: () => ({ style: {} }), documentElement: { setAttribute: noop, removeAttribute: noop, style: {} }, querySelector: () => null, addEventListener: noop, removeEventListener: noop }
};
win.window = win; win.self = win; win.globalThis = win;
Object.assign(win, { setTimeout, clearTimeout, setInterval, clearInterval, Intl, Date, Math, JSON, URL, Map, Set, Array, Object, String, Number, console });
vm.createContext(win);
vm.runInContext(app, win, { filename: 'index.html' });
const sites = win.__NSP_OFFICIAL();
console.log(`Checking ${sites.length} sites…`);

const TIMEOUT = 20000, CONCURRENCY = 8;
async function check(site) {
  const url = 'https://' + site.domain + '/';
  for (const method of ['HEAD', 'GET']) {
    const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), TIMEOUT);
    try {
      const res = await fetch(url, { method, redirect: 'follow', signal: ctl.signal, headers: { 'user-agent': 'Mozilla/5.0 (link check; Nagarik Sewa Portal)' } });
      clearTimeout(timer);
      if (method === 'HEAD' && (res.status === 405 || res.status === 403 || res.status >= 500)) continue;
      const finalHost = new URL(res.url).hostname.replace(/^www\./, '');
      const moved = finalHost !== site.domain && !finalHost.endsWith('.' + site.domain);
      return { ...site, url, status: res.status, ok: res.ok, moved, finalUrl: res.url };
    } catch (e) {
      clearTimeout(timer);
      if (method === 'GET') return { ...site, url, status: 0, ok: false, error: e.name === 'AbortError' ? 'timeout' : (e.cause?.code || e.message) };
    }
  }
}
const results = []; let i = 0;
await Promise.all(Array.from({ length: CONCURRENCY }, async () => { while (i < sites.length) { const s = sites[i++]; results.push(await check(s)); } }));
results.sort((a, b) => a.domain.localeCompare(b.domain));

const broken = results.filter(r => !r.ok), moved = results.filter(r => r.ok && r.moved);
const date = new Date().toISOString().slice(0, 10);
const row = r => `| ${r.en} | ${r.domain} | ${r.status || r.error} | ${r.moved ? r.finalUrl : ''} |`;
const md = [`# Link check ${date}`, '', `Checked ${results.length} sites: ${results.length - broken.length} working, ${broken.length} not responding, ${moved.length} redirect to another domain.`, '',
  '## Not responding', '', '| Site | Domain | Result | |', '|---|---|---|---|', ...broken.map(row), '',
  '## Redirects to another domain (update the directory)', '', '| Site | Domain | Status | Now at |', '|---|---|---|---|', ...moved.map(row), '',
  'A site can fail because it is down for a while, blocks automated checks, or is blocked outside Nepal. Re-check failures by hand before removing them.'].join('\n');
fs.writeFileSync('link-report.md', md);
fs.writeFileSync('link-report.json', JSON.stringify({ date, results }, null, 1));
console.log(md.split('\n').slice(0, 3).join('\n'));
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `broken=${broken.length}\nmoved=${moved.length}\n`);
