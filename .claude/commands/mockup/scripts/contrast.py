#!/usr/bin/env python3
"""WCAG contrast ratio for colour pairs.

Usage: python3 contrast.py FG BG [FG BG ...]
Colours as #RGB or #RRGGBB. Prints the ratio and whether it passes
4.5:1 (body text) and 3:1 (24px+ text, UI components).
"""
import sys


def lum(hex_color):
    h = hex_color.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    chans = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in chans]
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]


def ratio(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


def main():
    args = sys.argv[1:]
    if not args or len(args) % 2:
        sys.exit(__doc__)
    for fg, bg in zip(args[::2], args[1::2]):
        r = ratio(fg, bg)
        verdict = "AA text" if r >= 4.5 else ("large text/UI only" if r >= 3 else "FAIL")
        print(f"{fg} on {bg}: {r:.2f}:1  {verdict}")


if __name__ == "__main__":
    main()
