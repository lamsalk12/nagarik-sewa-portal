#!/usr/bin/env node
/* Builds shareable, crawlable pages from the app's own data:
     guide/<id>/  life-event/<id>/  district/<slug>/  rights/  mental-health/  safety/
     plus guide/ and district/ index pages and sitemap.xml.
   Each page has its own title, description and sharing image, readable without JavaScript.
   Usage:  node tools/build-pages.mjs          write the pages
           node tools/build-pages.mjs --check  exit 1 if any page is out of date (used in CI)
   Sharing images (og/*.jpg) are drawn by tools/og-images.py. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const BASE = 'https://lamsalk12.github.io/nagarik-sewa-portal/';
const REPO = 'https://github.com/lamsalk12/nagarik-sewa-portal';
const CHECK = process.argv.includes('--check');

/* ---- load the app's data ---- */
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const noop = () => {};
const React = { createElement: () => null, Fragment: 'f', useState: v => [typeof v === 'function' ? v() : v, noop], useEffect: noop, useMemo: f => f(), useRef: () => ({}), useCallback: f => f };
const ctx = { React, ReactDOM: { createRoot: () => ({ render: noop }) },
  localStorage: { getItem: () => null, setItem: noop, removeItem: noop },
  matchMedia: () => ({ matches: false }), addEventListener: noop, removeEventListener: noop,
  location: { hash: '', protocol: 'file:', href: BASE }, navigator: { onLine: true, userAgent: 'node' },
  document: { getElementById: () => ({ style: {} }), documentElement: { setAttribute: noop, removeAttribute: noop, style: {} }, querySelector: () => null, addEventListener: noop, removeEventListener: noop },
  setTimeout, clearTimeout, setInterval, clearInterval, Intl, Date, Math, JSON, URL, Map, Set, Array, Object, String, Number, console };
ctx.window = ctx; ctx.self = ctx; ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(scripts[scripts.length - 1], ctx, { filename: 'index.html' });
const D = ctx.__NSP_DATA();
const toNe = n => String(n).replace(/\d/g, d => '०१२३४५६७८९'[d]);
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ---- page shell ---- */
const CSS = `:root{--bg:#f2f4f9;--card:#fff;--fg:#26344f;--strong:#0c1a36;--muted:#56637d;--link:#003893;--line:#d8deea;--brand:#003893;--red:#DC143C;--tint:#e7eefb;--warn:#fff2d9;--ok:#e3f4ea}
@media (prefers-color-scheme:dark){:root{--bg:#0b1222;--card:#121c31;--fg:#cfd7e8;--strong:#eef2fb;--muted:#98a5bf;--link:#8fb0ff;--line:#24324f;--brand:#0a1a3c;--tint:#15264a;--warn:#33250b;--ok:#0f2e20;color-scheme:dark}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:17px/1.65 "Mukta","Noto Sans Devanagari",system-ui,sans-serif}
a{color:var(--link)}.w{max-width:860px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
header{background:var(--brand);color:#fff;border-top:5px solid var(--red)}header .w{display:flex;align-items:center;gap:12px;padding-block:12px}
header a{color:#fff;text-decoration:none;display:flex;align-items:center;gap:12px}header svg{width:30px;height:37px;flex:none}
header small{display:block;font-size:13px;color:#c7d4f2;line-height:1.2}header b{font-size:19px;line-height:1.3}
nav.crumbs{font-size:15px;color:var(--muted);padding-block:16px 0}nav.crumbs a{text-decoration:none}
h1{font-size:clamp(26px,5vw,34px);line-height:1.25;color:var(--strong);margin:10px 0 2px;text-wrap:balance}
.en{color:var(--muted)}.lead{font-size:18px;margin:6px 0 18px}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:18px 20px;margin:14px 0}
.card h2{font-size:20px;color:var(--strong);margin:0 0 8px;line-height:1.3}
ol,ul{padding-left:22px;margin:0}li{margin:6px 0}li .en{display:block;font-size:15px}
.facts{display:grid;grid-template-columns:auto 1fr;gap:4px 16px;margin:0}.facts dt{color:var(--muted)}.facts dd{margin:0;color:var(--strong);font-weight:600}
.cta{display:flex;flex-wrap:wrap;gap:10px;margin:22px 0}
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 18px;border-radius:6px;font-weight:600;text-decoration:none;border:1.5px solid var(--link);color:var(--link)}
.btn.primary{background:var(--link);color:var(--card);border-color:var(--link)}
.note{background:var(--warn);border-radius:8px;padding:12px 16px;margin:14px 0}.ok{background:var(--ok)}
.tag{font-size:13px;font-weight:600;color:var(--red)}.mono{font-family:"IBM Plex Sans Devanagari",ui-monospace,monospace}
.cols{columns:2 260px;column-gap:24px}.cols li{break-inside:avoid}
footer{margin-top:32px;background:var(--brand);color:#c7d4f2;font-size:15px}footer .w{padding-block:20px}footer b{color:#fff}`;
const FLAG = '<svg viewBox="-2 -2 104 126" aria-hidden="true"><path d="M1 1 L97 63 L39 63 L97 121 L1 121 Z" fill="#003893" stroke="#ffffff" stroke-width="2.4" stroke-linejoin="round" paint-order="stroke"/><path d="M7 11.5 L82.5 58 L28 58 L86.5 115 L7 115 Z" fill="#DC143C"/><path d="M18.8 34 L15 32.01 L19.27 31.63 L16.52 28.33 L20.62 29.62 L19.33 25.52 L22.63 28.27 L23.01 24 L25 27.8 L26.99 24 L27.37 28.27 L30.67 25.52 L29.38 29.62 L33.48 28.33 L30.73 31.63 L35 32.01 L31.2 34 Z" fill="#ffffff"/><path d="M13.5 32.6 A11.5 11.5 0 0 0 36.5 32.6 A11.5 5 0 0 1 13.5 32.6 Z" fill="#ffffff"/><path d="M25 79.4 L27.12 85.08 L31.8 81.22 L30.8 87.2 L36.78 86.2 L32.92 90.88 L38.6 93 L32.92 95.12 L36.78 99.8 L30.8 98.8 L31.8 104.78 L27.12 100.92 L25 106.6 L22.88 100.92 L18.2 104.78 L19.2 98.8 L13.22 99.8 L17.08 95.12 L11.4 93 L17.08 90.88 L13.22 86.2 L19.2 87.2 L18.2 81.22 L22.88 85.08 Z" fill="#ffffff"/></svg>';
function page({ rel, depth, title, titleEn, desc, image, crumbs, body, appHash, type = 'article' }) {
  const up = '../'.repeat(depth);
  const url = BASE + rel;
  const fullTitle = `${title} · नागरिक सेवा पोर्टल`;
  const report = `${REPO}/issues/new?template=wrong-info.yml&labels=wrong-info&title=${encodeURIComponent('Wrong information: ' + title)}&page=${encodeURIComponent(url)}`;
  return `<!doctype html>
<html lang="ne" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self'; base-uri 'none'; form-action 'none'">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#003893">
<link rel="icon" type="image/png" sizes="192x192" href="${up}icons/icon-192.png">
<link rel="manifest" href="${up}manifest.webmanifest">
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="नागरिक सेवा पोर्टल">
<meta property="og:title" content="${esc(title)}${titleEn ? ' · ' + esc(titleEn) : ''}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${BASE}${image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="ne_NP">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}${titleEn ? ' · ' + esc(titleEn) : ''}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${BASE}${image}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Devanagari:wght@500&family=Mukta:wght@400;600;700&display=swap">
<style>${CSS}</style>
</head>
<body>
<header><div class="w"><a href="${up}">${FLAG}<span><small>समुदायको पहल · सरकारी होइन</small><b>नागरिक सेवा पोर्टल</b></span></a></div></header>
<main class="w">
<nav class="crumbs" aria-label="Breadcrumb"><a href="${up}">गृहपृष्ठ · Home</a>${crumbs.map(([label, href]) => ` › ${href ? `<a href="${href}">${esc(label)}</a>` : esc(label)}`).join('')}</nav>
${body}
<div class="cta"><a class="btn primary" href="${up}#${appHash}">एपमा खोल्नुहोस् · Open in the app</a><a class="btn" href="${report}" rel="noopener noreferrer">गलत जानकारी रिपोर्ट गर्नुहोस् · Report wrong information</a></div>
<p class="en" style="font-size:14px">रिपोर्ट GitHub मा सार्वजनिक हुन्छ; व्यक्तिगत विवरण नलेख्नुहोस्। Reports are public on GitHub; do not include personal details.</p>
</main>
<footer><div class="w"><b>समुदायको अगुवाइमा गरिएको प्रयास · नेपाल सरकारसँग आबद्ध छैन।</b><br>A community-led initiative, not affiliated with the Government of Nepal. For official business, use each agency’s own website.</div></footer>
</body>
</html>
`;
}
const bi = (ne, en) => `${esc(ne)}<span class="en">${esc(en)}</span>`;
const list = (items, tag = 'ul') => `<${tag}>${items.map(([ne, en]) => `<li>${bi(ne, en)}</li>`).join('')}</${tag}>`;

/* ---- pages ---- */
const out = new Map();
const og = [];
const add = (rel, html) => out.set(rel.endsWith('/') ? rel + 'index.html' : rel, html);
const urls = [BASE];

for (const g of D.GUIDES) {
  const rel = `guide/${g.id}/`;
  urls.push(BASE + rel);
  og.push({ file: `og/guide-${g.id}.jpg`, label: 'सेवा गाइड · Service guide', title: g.ne, sub: g.en });
  add(rel, page({ rel, depth: 2, title: g.ne, titleEn: g.en, appHash: 'guide-' + g.id, image: `og/guide-${g.id}.jpg`,
    desc: `${g.ne}: कहाँ जाने, के कागजात चाहिन्छ र के-के गर्ने। ${g.en}: where to go, what to bring and the steps.`,
    crumbs: [['सेवा गाइड · Guides', '../']],
    body: `<p class="tag">सेवा गाइड · Service guide</p><h1>${esc(g.ne)}</h1><p class="lead en">${esc(g.en)}</p>
<div class="card"><dl class="facts"><dt>कहाँ जाने<br><span class="en">Where to go</span></dt><dd>${bi(g.officeNe, g.officeEn)}</dd><dt>कसले पाउँछ<br><span class="en">Who can apply</span></dt><dd>${bi(g.whoNe, g.whoEn)}</dd></dl></div>
<div class="card"><h2>प्रक्रिया · Steps</h2>${list(g.steps, 'ol')}</div>
<div class="card"><h2>चाहिने कागजात · Documents</h2>${list(g.docs)}</div>
${g.tipNe ? `<div class="note">${bi(g.tipNe, g.tipEn)}</div>` : ''}
<div class="note ok">आधिकारिक साइट · Official site: <a href="${g.url}" rel="noopener noreferrer" class="mono">${esc(g.domain)}</a>. शुल्क र समय परिवर्तन हुन सक्छन्; जानु अघि पक्का गर्नुहोस्। Fees and timings change; confirm before you go.</div>` }));
}
add('guide/', page({ rel: 'guide/', depth: 1, title: 'सेवा गाइड', titleEn: 'Service guides', appHash: 'guides', image: 'icons/og-image.png', type: 'website',
  desc: 'नागरिकता, राहदानी, सवारी चालक अनुमतिपत्र, मतदाता दर्ता, NOC र अन्य सेवाका सजिला गाइड। Simple guides to Nepal government services.', crumbs: [['सेवा गाइड · Guides']],
  body: `<h1>सेवा गाइड</h1><p class="lead en">Service guides</p><div class="card"><ul class="cols">${D.GUIDES.map(g => `<li><a href="${g.id}/">${esc(g.ne)}</a><span class="en">${esc(g.en)}</span></li>`).join('')}</ul></div>
<div class="card"><h2>जीवनका घटना · Life events</h2><ul class="cols">${D.JOURNEYS.map(j => `<li><a href="../life-event/${j.id}/">${esc(j.ne)}</a><span class="en">${esc(j.en)}</span></li>`).join('')}</ul></div>` }));
urls.push(BASE + 'guide/');

const guideName = id => { const g = D.GUIDES.find(x => x.id === id); return g ? [g.ne, g.en] : [id, id]; };
for (const j of D.JOURNEYS) {
  const rel = `life-event/${j.id}/`;
  urls.push(BASE + rel);
  const steps = j.steps.map(s => {
    let link = '';
    if (s.guide) { const [ne, en] = guideName(s.guide); link = `<br><a href="../../guide/${s.guide}/">गाइड · Guide: ${esc(ne)} · ${esc(en)}</a>`; }
    else if (s.domain) link = `<br><a href="https://${s.domain}/" rel="noopener noreferrer" class="mono">${esc(s.domain)}</a>`;
    return `<li>${bi(s.ne, s.en)}${link}</li>`;
  }).join('');
  og.push({ file: `og/life-event-${j.id}.jpg`, label: 'जीवनका घटना · Life event', title: j.ne, sub: j.en });
  add(rel, page({ rel, depth: 2, title: j.ne, titleEn: j.en, appHash: 'journey-' + j.id, image: `og/life-event-${j.id}.jpg`,
    desc: `${j.ne}: यही क्रममा गर्नुपर्ने कामहरू। ${j.en}: what to do, in order.`, crumbs: [['जीवनका घटना · Life events', '../../guide/']],
    body: `<p class="tag">जीवनका घटना · Life event</p><h1>${esc(j.ne)}</h1><p class="lead en">${esc(j.en)}</p><div class="card"><h2>यही क्रममा गर्नुहोस् · Do these in order</h2><ol>${steps}</ol></div>
<div class="note">नियम, समयसीमा र शुल्क परिवर्तन हुन सक्छन्। Rules, deadlines and fees can change.</div>` }));
}

const KINDS = D.KIND;
for (const d of D.DISTRICTS) {
  const rel = `district/${d.slug}/`;
  urls.push(BASE + rel);
  const locals = d.province.d.find(x => x.en === d.en).locals;
  const lis = locals.map(l => `<li><a href="${l.url}" rel="noopener noreferrer">${esc(l.ne)} ${esc(KINDS[l.kind][0])}</a><span class="en">${esc(l.en)} ${esc(KINDS[l.kind][1])} · ${l.wards} wards · <span class="mono">${esc(l.domain)}</span></span></li>`).join('');
  og.push({ file: `og/district-${d.slug}.jpg`, label: d.province.ne + ' · ' + d.province.en, title: d.ne + ' जिल्ला', sub: `${d.en} District · ${locals.length} local levels`, district: d.slug, province: D.PROVINCES.indexOf(D.PROVINCES.find(p => p.id === d.province.id)) + 1 });
  add(rel, page({ rel, depth: 2, title: `${d.ne} जिल्ला`, titleEn: `${d.en} District`, appHash: 'district-' + d.slug, image: `og/district-${d.slug}.jpg`, type: 'website',
    desc: `${d.ne} जिल्लाका सरकारी कार्यालय, खुल्ने समय र ${toNe(locals.length)} स्थानीय तहका आधिकारिक वेबसाइट। Government offices, opening hours and the ${locals.length} local levels of ${d.en} District, ${d.province.en}.`,
    crumbs: [['जिल्लाहरू · Districts', '../'], [d.province.ne + ' · ' + d.province.en]],
    body: `<p class="tag">${esc(d.province.ne)} · ${esc(d.province.en)}</p><h1>${esc(d.ne)} जिल्ला</h1><p class="lead en">${esc(d.en)} District · ${locals.length} local levels</p>
<div class="card"><h2>जिल्ला स्तरका कार्यालय · District offices</h2><ul>
<li><a href="https://${d.daoDomain}/" rel="noopener noreferrer">जिल्ला प्रशासन कार्यालय, ${esc(d.ne)}</a><span class="en">District Administration Office: citizenship, passport, recommendations · <span class="mono">${esc(d.daoDomain)}</span></span></li>
<li><a href="https://nepalpolice.gov.np/" rel="noopener noreferrer">नेपाल प्रहरी</a><span class="en">Nepal Police · emergency 100</span></li>
<li><a href="https://dolma.gov.np/" rel="noopener noreferrer">भूमि व्यवस्था तथा अभिलेख विभाग</a><span class="en">Land Revenue Offices are listed on the department’s site</span></li>
<li><a href="https://dotm.gov.np/" rel="noopener noreferrer">यातायात व्यवस्था विभाग</a><span class="en">Transport Management Offices (driving licence)</span></li>
<li><a href="${d.province.url}" rel="noopener noreferrer">${esc(d.province.ne)} सरकार</a><span class="en">Government of ${esc(d.province.en)}</span></li></ul></div>
<div class="card"><h2>खुल्ने समय · Opening hours</h2>${bi('सोमबार–शुक्रबार ९:०० देखि ५:०० (१६ कार्तिकदेखि १५ माघसम्म ४:०० सम्म)। शनिबार, आइतबार र सार्वजनिक बिदामा बन्द।', 'Monday–Friday 9:00–5:00 (until 4:00 from 16 Kartik to 15 Magh). Closed Saturday, Sunday and public holidays.')}</div>
<div class="card"><h2>स्थानीय तह · Local levels (${locals.length})</h2><ul class="cols">${lis}</ul></div>` }));
}
add('district/', page({ rel: 'district/', depth: 1, title: 'जिल्लाका कार्यालय', titleEn: 'District offices', appHash: 'offices', image: 'icons/og-image.png', type: 'website',
  desc: 'नेपालका ७७ जिल्लाका सरकारी कार्यालय, खुल्ने समय र स्थानीय तहका वेबसाइट। Offices, opening hours and local levels for all 77 districts of Nepal.', crumbs: [['जिल्लाहरू · Districts']],
  body: `<h1>जिल्लाका कार्यालय</h1><p class="lead en">District offices · 77 districts</p>${D.PROVINCES.map(p => `<div class="card"><h2>${esc(p.ne)} · ${esc(p.en)}</h2><ul class="cols">${D.DISTRICTS.filter(d => d.province.id === p.id).map(d => `<li><a href="${d.slug}/">${esc(d.ne)}</a><span class="en">${esc(d.en)}</span></li>`).join('')}</ul></div>`).join('')}` }));
urls.push(BASE + 'district/');

og.push({ file: 'og/rights.jpg', label: 'युवाका लागि · For young people', title: 'आफ्ना अधिकार जान्नुहोस्', sub: 'Know your rights' });
og.push({ file: 'og/mental-health.jpg', label: 'युवाका लागि · For young people', title: 'तपाईं एक्लो हुनुहुन्न', sub: 'Mental health support · Helpline 1166' });
og.push({ file: 'og/safety.jpg', label: 'युवाका लागि · For young people', title: 'अनलाइन ठगीबाट बच्नुहोस्', sub: 'Stay safe from online scams · 10-question quiz' });
add('rights/', page({ rel: 'rights/', depth: 1, title: 'आफ्ना अधिकार जान्नुहोस्', titleEn: 'Know your rights', appHash: 'rights', image: 'og/rights.jpg',
  desc: 'पक्राउ पर्दा, काम गर्दा, उपभोक्ताको रूपमा र अनलाइनमा तपाईंका अधिकार, सरल भाषामा। Your rights if arrested, at work, as a consumer and online, in plain words.', crumbs: [['युवाका लागि · For young people', '../#youth']],
  body: `<h1>आफ्ना अधिकार जान्नुहोस्</h1><p class="lead en">Know your rights</p>${D.RIGHTS.map(r => `<div class="card"><h2>${esc(r.ne)} · ${esc(r.en)}</h2>${list(r.items)}<p class="en" style="font-size:14px;margin-top:8px">आधार · Basis: ${esc(r.srcNe)} · ${esc(r.srcEn)}</p></div>`).join('')}
<div class="note">यो कानूनी सल्लाह होइन। This is a summary, not legal advice. For your own situation, talk to a lawyer or the free legal aid service at your district court.</div>` }));
urls.push(BASE + 'rights/');

add('mental-health/', page({ rel: 'mental-health/', depth: 1, title: 'मानसिक स्वास्थ्य सहायता', titleEn: 'Mental health support', appHash: 'mental-health', image: 'og/mental-health.jpg',
  desc: 'मन गाह्रो भएको छ? तपाईं एक्लो हुनुहुन्न। हेल्पलाइन ११६६ र अन्य सहायता। Finding things hard? You are not alone. Helplines and where to get support in Nepal.', crumbs: [['युवाका लागि · For young people', '../#youth']],
  body: `<h1>मन गाह्रो भएको छ? तपाईं एक्लो हुनुहुन्न।</h1><p class="lead en">Finding things hard? You are not alone. Talking is not a weakness, and help is available.</p>
<div class="note"><b>अहिले नै खतरा छ भने · If someone is in danger right now:</b> प्रहरी <b class="mono">१००</b> वा एम्बुलेन्स <b class="mono">१०२</b> मा फोन गर्नुहोस् र उहाँसँगै बस्नुहोस्। Call police 100 or ambulance 102 and stay with them.</div>
<div class="card"><h2>कुरा गर्न फोन गर्नुहोस् · Call someone to talk to</h2><ul>${D.MH_LINES.map(([num, ne, en, dne, den]) => `<li><b class="mono">${esc(toNe(num))} · ${esc(num)}</b> ${bi(ne + ': ' + dne, en + ': ' + den)}</li>`).join('')}</ul><p class="en" style="font-size:14px">Helpline hours can vary. If no one answers, try again or go to your nearest health facility.</p></div>
<div class="card"><h2>साथीलाई कसरी साथ दिने · How to support a friend</h2>${list(D.MH_HELP)}</div>
<div class="card"><h2>आफ्नो हेरचाह · Looking after yourself</h2>${list(D.MH_SELF)}</div>` }));
urls.push(BASE + 'mental-health/');

add('safety/', page({ rel: 'safety/', depth: 1, title: 'अनलाइन ठगीबाट बच्नुहोस्', titleEn: 'Stay safe from online scams', appHash: 'safety', image: 'og/safety.jpg',
  desc: 'OTP, नक्कली जागिर, ऋण एप, QR र नक्कली वेबसाइटबाट हुने ठगीबाट बच्ने १० वटा अवस्था। Ten common scams in Nepal and how to stay safe: OTP, fake jobs, loan apps, QR codes and fake sites.', crumbs: [['युवाका लागि · For young people', '../#youth']],
  body: `<h1>अनलाइन ठगीबाट बच्नुहोस्</h1><p class="lead en">Stay safe from online scams. Try the interactive quiz in the app.</p><ol>${D.QUIZ.map(q => `<li class="card" style="list-style-position:inside">${bi(q.qNe, q.qEn)}<p style="margin:8px 0 0"><b>सही कदम · Right move:</b> ${bi(q.opts[q.a][0], q.opts[q.a][1])}</p><p class="en" style="font-size:15px">${esc(q.whyNe)} ${esc(q.whyEn)}</p></li>`).join('')}</ol>` }));
urls.push(BASE + 'safety/');

/* sitemap */
const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`;
out.set('sitemap.xml', sitemap);
out.set('og/manifest.json', JSON.stringify(og, null, 1) + '\n');

/* write or check */
let stale = [];
for (const [rel, content] of out) {
  const file = path.join(ROOT, rel);
  const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  if (current !== content) {
    stale.push(rel);
    if (!CHECK) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, content); }
  }
}
const images = [...out.values()].flatMap(h => [...h.matchAll(/og:image" content="https:\/\/[^"]+?nagarik-sewa-portal\/([^"]+)"/g)].map(m => m[1]));
const missing = [...new Set(images)].filter(i => !fs.existsSync(path.join(ROOT, i)));
if (CHECK) {
  if (stale.length) { console.error(`${stale.length} generated page(s) are out of date, e.g. ${stale.slice(0, 3).join(', ')}.\nRun: node tools/build-pages.mjs`); process.exit(1); }
  if (missing.length) { console.error(`${missing.length} sharing image(s) missing, e.g. ${missing.slice(0, 3).join(', ')}.\nRun: python3 tools/og-images.py`); process.exit(1); }
  console.log(`All ${out.size} generated files are up to date.`);
} else console.log(`Wrote ${stale.length} of ${out.size} files (${urls.length} URLs in sitemap). Missing images: ${missing.length}`);
