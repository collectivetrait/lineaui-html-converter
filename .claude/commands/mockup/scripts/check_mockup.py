#!/usr/bin/env python3
"""Check a mockup for vertical rhythm and webfont icons.

Usage: python3 check_mockup.py <Main.dc.html | page.html>

Errors: Font Awesome webfont classes (fa-*) or a stylesheet link to Font Awesome;
icons must be inline SVG.
Warnings: spacing and box sizes off the 8px grid, line-heights off the 24px grid,
in <style> blocks and inline style="" attributes. Fix them unless the value is
decoration outside the text flow.
It reads the file only; it never renders anything.
"""
import argparse
import re
import sys
from html.parser import HTMLParser

PX_PER_REM = 16
GRID_PROPS = {
    "margin", "margin-top", "margin-bottom", "margin-left", "margin-right", "margin-block", "margin-inline",
    "padding", "padding-top", "padding-bottom", "padding-left", "padding-right", "padding-block", "padding-inline",
    "gap", "row-gap", "column-gap", "height", "min-height", "max-height", "top", "bottom", "block-size",
}
TOLERATED = {1, 2, 3, 4}  # hairlines and the 4px inline step


def to_px(token):
    m = re.fullmatch(r"(-?\d*\.?\d+)(px|rem)", token.strip())
    if not m:
        return None
    n = float(m.group(1))
    return n * PX_PER_REM if m.group(2) == "rem" else n


def rhythm(where, prop, value, warnings):
    prop = prop.strip().lower()
    if prop == "line-height":
        px = to_px(value)
        if px is not None and px % 24 and px != 16:
            warnings.append(f"{where}: line-height {value.strip()} is off the 24px line grid")
    elif prop in GRID_PROPS:
        for token in value.split():
            px = to_px(token)
            if px is not None and px % 8 and abs(px) not in TOLERATED:
                warnings.append(f"{where}: {prop} {token} is off the 8px grid")
    elif prop == "font":
        m = re.search(r"/\s*(-?\d*\.?\d+(?:px|rem))", value)
        if m:
            rhythm(where, "line-height", m.group(1), warnings)


class Walker(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.elements, self.styles, self._buf, self._in = [], [], [], False
        self.fa_links = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        self.elements.append((self.getpos()[0], (a.get("class") or "").split(), a.get("style")))
        if tag == "link" and "fontawesome" in (a.get("href") or "").lower():
            self.fa_links.append(self.getpos()[0])
        if tag == "style":
            self._in, self._buf = True, []

    handle_startendtag = handle_starttag

    def handle_endtag(self, tag):
        if tag == "style" and self._in:
            self.styles.append("".join(self._buf))
            self._in = False

    def handle_data(self, data):
        if self._in:
            self._buf.append(data)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("artboard")
    args = ap.parse_args()

    w = Walker()
    w.feed(open(args.artboard, encoding="utf-8").read())
    errors, warnings = [], []

    for css in w.styles:
        css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
        for selector, body in re.findall(r"([^{}]+)\{([^{}]*)\}", css):
            for prop, val in re.findall(r"([a-z-]+)\s*:\s*([^;]+)", body):
                if not prop.startswith("--"):
                    rhythm(f"CSS '{selector.strip()}'", prop, val, warnings)

    for line, classes, style in w.elements:
        for cls in classes:
            if cls.startswith("fa-") or cls in ("fa", "fas", "far", "fab"):
                errors.append(f"line {line}: '{cls}' is a Font Awesome webfont class; inline the icon as SVG")
        if style:
            for decl in style.split(";"):
                if ":" in decl and not decl.strip().startswith("--"):
                    prop, val = decl.split(":", 1)
                    if "{{" not in val:
                        rhythm(f"line {line} inline", prop, val, warnings)

    for line in w.fa_links:
        errors.append(f"line {line}: Font Awesome stylesheet link; inline the icons as SVG")
    for e in errors:
        print("ERROR  ", e)
    for msg in sorted(set(warnings)):
        print("WARN   ", msg)
    print(f"\n{len(errors)} error(s), {len(set(warnings))} warning(s)")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
