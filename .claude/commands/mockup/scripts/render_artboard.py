#!/usr/bin/env python3
"""Render a mockup to PNG screenshots for a visual check.

Usage: python3 render_artboard.py <Main.dc.html | page.html> <out_dir> [--width 1440 390] [--theme light dark] [--tile 1200]
Reads a canvas artboard (.dc.html) or a plain HTML file.
Renders every width x theme combination in one browser session; tile names carry their y range.

For an artboard, approximates the canvas runtime well enough to judge layout: evaluates the
artboard's DCLogic renderVals() with its data-props defaults, resolves
<sc-if>/<sc-for> and {{holes}}, links the artboard's stylesheets from the
project folder, then screenshots the full page and cuts it into tiles.
A plain HTML file is loaded as it is, with the theme forced through
data-theme on <html> and the emulated colour scheme.
Web fonts from Google Fonts may not load in this workspace; system fallbacks
are used, so judge layout, spacing and hierarchy, not exact letterforms.
"""
import argparse
import html
import json
import pathlib
import re

from playwright.sync_api import sync_playwright

RUNTIME = r"""
class DCLogic { constructor(props){ this.props = props || {}; this.state = {}; } setState(s){ Object.assign(this.state, s); } forceUpdate(){} }
function lookup(vals, scope, path){
  path = path.trim();
  if (path === 'true') return true; if (path === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
  if (/^'.*'$|^".*"$/.test(path)) return path.slice(1, -1);
  const parts = path.split('.'); let cur = (parts[0] in scope) ? scope : vals;
  for (const p of parts) { if (cur == null) return undefined; cur = cur[p]; }
  return cur;
}
function fill(str, vals, scope){
  return str.replace(/\{\{([^}]+)\}\}/g, (_, p) => { const v = lookup(vals, scope, p); return (v === undefined || v === null || typeof v === 'function') ? '' : String(v); });
}
function walk(node, vals, scope){
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === 3) { child.textContent = fill(child.textContent, vals, scope); continue; }
    if (child.nodeType !== 1) continue;
    const tag = child.tagName.toLowerCase();
    if (tag === 'sc-if') {
      const m = (child.getAttribute('value') || '').match(/\{\{([^}]+)\}\}/);
      const ok = m ? !!lookup(vals, scope, m[1]) : false;
      if (ok) { walk(child, vals, scope); child.replaceWith(...child.childNodes); } else child.remove();
      continue;
    }
    if (tag === 'sc-for') {
      const m = (child.getAttribute('list') || '').match(/\{\{([^}]+)\}\}/);
      const list = (m && lookup(vals, scope, m[1])) || []; const as = child.getAttribute('as') || 'item';
      const frag = document.createDocumentFragment();
      list.forEach((it, i) => { const c = child.cloneNode(true); const s = Object.assign({}, scope, { [as]: it, $index: i }); walk(c, vals, s); frag.append(...c.childNodes); });
      child.replaceWith(frag); continue;
    }
    for (const a of Array.from(child.attributes)) {
      if (/^on[A-Z]/.test(a.name) || /^on[a-z]+$/.test(a.name) && a.value.includes('{{')) { child.removeAttribute(a.name); continue; }
      if (a.value.includes('{{')) child.setAttribute(a.name, fill(a.value, vals, scope));
    }
    if (child.hasAttribute('hidden') && child.getAttribute('hidden') === 'false') child.removeAttribute('hidden');
    walk(child, vals, scope);
  }
}
"""


def build_page(src: str, project: pathlib.Path, theme: str) -> str:
    head_links = re.findall(r"<head>(.*?)</head>", src, re.S)[0]
    head_links = "\n".join(re.findall(r"<link[^>]+>", head_links))
    head_links = re.sub(r'href="(?!https?:)([^"]+)"', lambda m: f'href="{(project / m.group(1)).resolve().as_uri()}"', head_links)
    xdc = re.findall(r"<x-dc>(.*?)</x-dc>", src, re.S)[0]
    helmet = re.findall(r"<helmet>(.*?)</helmet>", xdc, re.S)
    helmet = helmet[0] if helmet else ""
    body = re.sub(r"<helmet>.*?</helmet>", "", xdc, flags=re.S)
    script = re.search(r'<script type="text/x-dc"[^>]*data-props=\'([^\']*)\'[^>]*>(.*?)</script>', src, re.S)
    props_json = html.unescape(script.group(1)) if script else "{}"
    logic = script.group(2) if script else "class Component extends DCLogic { renderVals(){ return {}; } }"
    props = {k: v.get("default") for k, v in json.loads(props_json).items() if isinstance(v, dict) and "default" in v}
    if "theme" in props:
        props["theme"] = theme
    base = project.resolve().as_uri() + "/"
    return f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><base href="{base}">{head_links}{helmet}</head>
<body><template id="tpl">{body}</template><div id="root"></div>
<script>{RUNTIME}
{logic}
const comp = new Component({json.dumps(props)});
const vals = comp.renderVals();
const frag = document.getElementById('tpl').content.cloneNode(true);
walk(frag, vals, {{}});
document.getElementById('root').appendChild(frag);
document.documentElement.setAttribute('data-theme', {json.dumps(theme)});
</script></body></html>"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("artboard")
    ap.add_argument("out_dir")
    ap.add_argument("--width", type=int, nargs="+", default=[1440, 390])
    ap.add_argument("--theme", nargs="+", default=["light", "dark"])
    ap.add_argument("--tile", type=int, default=1200)
    a = ap.parse_args()
    art = pathlib.Path(a.artboard).resolve()
    out = pathlib.Path(a.out_dir)
    out.mkdir(parents=True, exist_ok=True)
    src = art.read_text(encoding="utf-8")
    report = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        is_artboard = "<x-dc>" in src
        for theme in a.theme:
            if is_artboard:
                page_file = out / f"_render_{theme}.html"
                page_file.write_text(build_page(src, art.parent, theme), encoding="utf-8")
            else:
                page_file = art
            for width in a.width:
                pg = b.new_page(viewport={"width": width, "height": a.tile}, color_scheme=theme if theme in ("light", "dark") else "no-preference")
                errors = []
                pg.on("pageerror", lambda e: errors.append(str(e)))
                pg.goto(page_file.as_uri(), wait_until="load", timeout=15000)
                if not is_artboard:
                    pg.evaluate("t => document.documentElement.setAttribute('data-theme', t)", theme)
                pg.wait_for_timeout(400)
                height = pg.evaluate("document.documentElement.scrollHeight")
                tiles = []
                for y in range(0, height, a.tile):
                    h = min(a.tile, height - y)
                    t = out / f"{width}_{theme}_y{y:05d}-{y + h:05d}.png"
                    pg.screenshot(path=str(t), clip={"x": 0, "y": y, "width": width, "height": h}, full_page=True)
                    tiles.append(t.name)
                report.append({"width": width, "theme": theme, "height": height, "tiles": tiles, "page_errors": errors})
                pg.close()
        b.close()
    print(json.dumps(report, indent=1))


if __name__ == "__main__":
    main()
