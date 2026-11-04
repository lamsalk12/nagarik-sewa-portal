#!/usr/bin/env python3
"""Draws the 1200x630 sharing images listed in og/manifest.json (written by tools/build-pages.mjs).

Usage:  python3 tools/og-images.py            draw images that are missing
        python3 tools/og-images.py --all      redraw every image
Needs:  pip install playwright && playwright install chromium
Fonts:  set FONT_DIR to a folder with mukta-devanagari-{400,700}-normal.woff2 and
        martel-devanagari-800-normal.woff2 (from @fontsource); otherwise Google Fonts is used.
"""
import asyncio, html, json, os, sys
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
jobs = json.loads((ROOT / 'og' / 'manifest.json').read_text())
MAP = json.loads((ROOT / 'map' / 'nepal-map.json').read_text())
redo = '--all' in sys.argv
font_dir = os.environ.get('FONT_DIR')
if font_dir:
    fonts = f"""@font-face{{font-family:Mukta;src:url(file://{font_dir}/mukta-devanagari-400-normal.woff2)}}
@font-face{{font-family:Mukta;font-weight:700;src:url(file://{font_dir}/mukta-devanagari-700-normal.woff2)}}
@font-face{{font-family:Martel;font-weight:800;src:url(file://{font_dir}/martel-devanagari-800-normal.woff2)}}"""
    font_link = ''
else:
    fonts = ''
    font_link = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Martel:wght@800&family=Mukta:wght@400;700&display=block">'

COLS = ['#9fb8ec', '#f2b6c2', '#b4d9b8', '#f0d39a', '#c6b8ea', '#a9d6dc', '#ecc0a2']
dist_lines = ''.join(x[2] for x in MAP['d'])

def map_svg(job):
    if job.get('district'):
        prov = ''.join(f'<path d="{p[1]}" fill="{"#ffffff" if p[0]==job["province"] else "#ffffff"}" fill-opacity="{0.28 if p[0]==job["province"] else 0.08}"/>' for p in MAP['p'])
        dpath = next(x[2] for x in MAP['d'] if x[0] == job['district'])
        return (f'<svg class="map" viewBox="0 0 {MAP["w"]} {MAP["h"]}">{prov}'
                f'<path d="{dist_lines}" fill="none" stroke="#ffffff" stroke-opacity=".35" stroke-width="1"/>'
                f'<path d="{dpath}" fill="#DC143C" stroke="#ffffff" stroke-width="2.5"/></svg>')
    prov = ''.join(f'<path d="{p[1]}" fill="{COLS[i]}" stroke="#003893" stroke-width="2"/>' for i, p in enumerate(MAP['p']))
    return f'<svg class="map" viewBox="0 0 {MAP["w"]} {MAP["h"]}">{prov}<path d="{dist_lines}" fill="none" stroke="#ffffff" stroke-opacity=".6" stroke-width="1"/></svg>'

def card(job):
    e = html.escape
    return f"""<!doctype html><html><head><meta charset="utf-8">{font_link}<style>{fonts}
body{{margin:0}}.c{{width:1200px;height:630px;background:#003893;position:relative;overflow:hidden;font-family:Mukta,sans-serif;color:#fff}}
.rib{{position:absolute;inset:0 0 auto;height:10px;background:#DC143C}}
.map{{position:absolute;right:-70px;top:205px;width:620px}}
.t{{position:absolute;left:72px;top:64px;width:560px}}
.k{{font-size:26px;color:#c7d4f2}}
h1{{font-family:Martel,serif;font-weight:800;font-size:60px;line-height:1.35;margin:12px 0 8px}}
.s{{font-size:30px;color:#fff;font-weight:700;line-height:1.35}}
.f{{position:absolute;left:72px;bottom:42px;width:600px;font-size:22px;line-height:1.4;color:#c7d4f2}}.f b{{color:#fff}}
</style></head><body><div class="c"><div class="rib"></div>{map_svg(job)}
<div class="t"><div class="k">{e(job['label'])}</div><h1>{e(job['title'])}</h1><div class="s">{e(job['sub'])}</div></div>
<div class="f"><b>नागरिक सेवा पोर्टल</b><br>समुदायको पहल · नेपाल सरकारसँग आबद्ध छैन</div></div></body></html>"""

async def main():
    todo = [j for j in jobs if redo or not (ROOT / j['file']).exists()]
    if not todo:
        print('All sharing images exist.'); return
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width': 1200, 'height': 630})
        tmp = ROOT / 'og' / '_card.html'
        for j in todo:
            tmp.write_text(card(j), encoding='utf-8')
            await pg.goto(tmp.as_uri()); await pg.wait_for_timeout(250)
            out = ROOT / j['file']; out.parent.mkdir(parents=True, exist_ok=True)
            await pg.screenshot(path=str(out), type='jpeg', quality=78)
        tmp.unlink(missing_ok=True)
        await b.close()
    print(f'Drew {len(todo)} image(s).')

asyncio.run(main())
