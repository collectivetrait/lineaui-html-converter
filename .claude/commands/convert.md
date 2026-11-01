---
description: Convert a visual design (raw HTML) into a pixel-perfect Linea UI implementation
argument-hint: Path to the input file (e.g. input/mockup.html)
---

# Convert to Linea UI

Always rebuild the page from scratch. Delete any existing output files (`index.html`, `assets/styles/custom.scss`, `assets/styles/styles.css`) before starting. Never reuse output from a previous conversion.

You are converting a visual design into a pixel-perfect implementation using the Linea UI CSS library. The input is the visual spec — how it looks is what matters, not how it's built.

When library usage correctness and pixel-perfect matching conflict, prefer library correctness — but check the compiled CSS against what the reference claims. Several blocks have CSS gaps (see CLAUDE.md "Known block CSS gaps") that require custom overrides on every conversion.

## Setup

Read these files in parallel:

1. `node_modules/@collectivetrait/lineaui-reference/converter-reference.md` — condensed library reference (blocks, tokens, utilities, rules). This is the sole source of library knowledge. If this file doesn't exist, fall back to reading all three separate files: `tokens.md`, `classes.md`, `rules.md`.

2. `CLAUDE.md` — especially "Known block CSS gaps", "Conversion checklist", and "Library JavaScript".

3. `node_modules/@collectivetrait/lineaui-reference/_gap-overrides.scss` — starter SCSS template. Copy into `assets/styles/custom.scss` as the base, then customize. If missing, write gap overrides manually from CLAUDE.md.

4. `node_modules/@collectivetrait/lineaui-reference/skeleton.html` — starter HTML with head, navbar, section template, and footer. Copy into `index.html`, then customize. If missing, write from scratch.

5. The input file at: `$ARGUMENTS`
   - If no argument was provided, ask the user for the input file path.

6. If the input is an HTML file, render it in the browser (using Claude in Chrome if available) to understand its visual appearance. If browser tools are unavailable, read the HTML and its inline styles to infer the visual intent.

## Source mapping

Before writing ANY code, produce a JSON map of the source page. Save it as `source-map.json` in the project root. This map drives the entire conversion — use it to construct the output and to make corrections later.

### Critical rules (apply to the map AND the build)

**Library blocks first, custom classes last.** For every visual pattern in the source, check the reference for a matching library block BEFORE creating a custom class. A section band is `ln-section`, a card surface is `ln-card`, a grid layout is `ln-grid`, a button is `ln-button`, a data table is `ln-table`, a tab row is `ln-tabs`. Only create a custom class when no library block fits the component's purpose. If you skip this step, the coverage score will fail.

**No inline styles.** Never copy the source's inline `style="..."` attributes into the output. Move every style to `custom.scss` or replace it with a utility class. The only permitted inline styles are scoped token overrides (`style="--pro: #3F8BD6"`) and values set dynamically by JavaScript at runtime.

**Never pre-diagnose coverage.** Do not decide "this page is mostly custom" before checking the reference. Complex pages with charts, data tables, and custom illustrations still use library blocks for their structural patterns.

**Never delegate without reference reading.** If you fork or dispatch subagents, the agent MUST read the condensed reference file itself and do its own block mapping. Do not pre-decide block mappings in the dispatch prompt.

**Apply all gap overrides for every library block used.** If `ln-navbar` appears in the HTML, the SCSS must include the navbar gap overrides from the template. Same for `ln-site-footer`, `ln-card`, `ln-accordion`, etc.

### Map structure

The JSON map does NOT mirror the DOM tree. It reflects the **document hierarchy**: base definitions first, then top-level regions containing their children. Each node uses this schema:

```json
{
  "base": {
    "theme": "light | dark",
    "fonts": {
      "<role>": { "family": "...", "weights": [400, 700], "source": "google | system" }
    },
    "colors": {
      "<token-name>": "<value>"
    },
    "radius": "<default border-radius>",
    "containerWidth": "<max-width>"
  },
  "sections": [
    {
      "id": "<suggested-html-id>",
      "tag": "<suggested-semantic-element>",
      "purpose": "<what this region does>",
      "description": "<visual summary: layout, density, character>",
      "appearance": {
        "spacing": { "paddingBlock": "...", "gap": "...", "margins": "..." },
        "background": "<color or gradient>",
        "text": { "color": "...", "fontSize": "...", "lineHeight": "...", "fontWeight": "..." },
        "font": "<family if different from base>"
      },
      "libraryBlock": "<ln-* block name> | null",
      "libraryModifiers": ["--modifier-1"],
      "noLibraryMatch": "<reason, only when libraryBlock is null>",
      "children": [
        {
          "id": "...",
          "tag": "...",
          "purpose": "...",
          "description": "...",
          "appearance": { "..." },
          "libraryBlock": "...",
          "libraryModifiers": [],
          "children": []
        }
      ],
      "media": [
        {
          "type": "image | svg | icon",
          "src": "<original src or inline>",
          "dimensions": { "width": "...", "height": "..." },
          "appearance": "<shape, color, fit, decorative vs content>"
        }
      ]
    }
  ]
}
```

**Rules for the map:**
- When `libraryBlock` is `null`, set `noLibraryMatch` with the reason and **omit `children`** — the converter will handle these as fully custom components.
- Include every image, SVG, and icon element under the `media` array of its parent section, with dimensions and a short appearance note.
- `id` values must be English, semantic, and readable (same naming rules as class names).
- Check the reference for EVERY component before setting `libraryBlock` to `null`.
- The map is the single source of truth for block assignments — the build phase must follow it.

### Navbar decisions (record in the map):
- `--collapse` always; `--actions-visible` only when source keeps CTA visible on mobile; `--center` only when source centers nav links
- `--transparent` when source navbar has no background
- Google Fonts `<link>` in `<head>` for all font families (the library declares font-family tokens but does NOT load font files)
- Brand gap: check source and add `gap: var(--s1)` or appropriate value
- Active link styling scoped to desktop only (`@media (min-width: 768px)`)
- Custom heading classes using `--f-prose` need `letter-spacing: normal` (library base applies `-0.005em`)

### Footer decisions (record in the map):
- Responsive stacking behavior (row → column at mobile)
- Mobile padding and alignment changes
- `ln-site-footer` line-height override when source uses 24px
- Footer link text-decoration

## Build

Build the output files using `source-map.json` as the blueprint. Every block assignment, ID, and tag in the map carries over to the code — do not re-decide them.

### 1. HTML

Start from `skeleton.html` (already copied in setup). Customize:
- Page title
- Google Fonts families and weights to match source
- Brand name, logo/icon, and `__brand` gap
- Nav links (names, active state, href)
- Navbar modifiers (`--transparent`, `--collapse`, `--actions-visible`, `--center`)
- CTA button in `__actions` (or remove if source hides it on desktop)
- Panel links (duplicate nav links + CTA for mobile)
- Add content sections inside `<main>` using the `ln-section` template
- Footer brand and legal text
- Accessibility attributes (alt, aria-labels, aria-current)

### 2. SCSS

Create `assets/styles/custom.scss`:
- Start from the gap-overrides template (copy `_gap-overrides.scss`)
- Prepend `:root` token overrides (fonts, colors, radius, custom tokens)
- Customize gap override values to match source (navbar height, gaps, etc.)
- Add gap overrides for EVERY library block used in the HTML
- Add section-specific custom styles using Linea UI tokens
- Move ALL source inline styles to SCSS rules or utility classes — no `style="..."` copying

### 3. Import file

Create `assets/styles/styles.scss`:
```scss
@use '../../node_modules/@collectivetrait/lineaui/scss' as *;
@use 'custom';
```

### 4. Compile

```bash
npm run compile
```

Fix SCSS errors and retry until it succeeds.

### 5. JS

Always include the library's pre-compiled bundle:
```html
<script src="node_modules/@collectivetrait/lineaui/dist/bundle.js" defer></script>
```
This handles navbar toggle, collapse resize, escape/click-outside, and more. Accordions use native `<details>` — no JS needed.

If the source has page-specific JS (charts, data rendering, interactive filters), preserve it in `assets/scripts/main.js` as a separate `defer` script. Do not inline it. The library bundle and page JS coexist without conflict.

## Visual comparison

**Mandatory.** Use `getComputedStyle` on BOTH input and output pages to compare properties.

### Batched comparison

Run **one** comprehensive `javascript_tool` call per page that returns all properties for all regions at once. Do NOT make separate calls per region. Structure:

```js
// Run on BOTH source and output tabs
const g = el => getComputedStyle(el);
const $ = s => document.querySelector(s);
const pick = (el, props) => {
  if (!el) return null;
  const s = g(el);
  const r = {};
  props.forEach(p => r[p] = s[p]);
  return r;
};
const std = ['padding','gap','height','minHeight','fontSize','lineHeight','fontWeight','fontFamily','letterSpacing','color','backgroundColor','boxShadow'];
const result = {};
// Add one entry per element — adapt selectors to source vs output
result.navbar = pick($('.ln-navbar__inner'), std);
result.brand = pick($('.ln-navbar__brand'), ['fontFamily','fontSize','fontWeight','gap']);
// ... all regions
JSON.stringify(result, null, 2);
```

Compare values between source and output. Fix every discrepancy in `custom.scss`, recompile, and re-verify with one more batched call. **Update `source-map.json`** if any block assignments or appearance values change during correction.

### Properties to compare

For each region (navbar, hero, cards, tables, footer):
- `margin`, `padding`, `gap`
- `height`, `min-height`
- `font-size`, `line-height`, `font-weight`, `letter-spacing`, `font-family`
- `color`, `background-color`, `box-shadow`, `text-decoration`
- At mobile: `flex-direction`, `align-items`, `justify-content`, section `padding-block`

**Query by exact library class** (`.ln-navbar`), never generic tags.

## Score

```bash
node evals/scoring/score-card.mjs . $ARGUMENTS
```

Fix any dimension below 0.7, recompile, re-score.

## Audit spacing

Run via `javascript_tool` on the output page:

```js
const code = await fetch('/evals/scoring/audit-spacing.js').then(r=>r.text());
JSON.parse(eval(code))
```

Fix every issue.

## Dev server

```bash
pkill -f browser-sync 2>/dev/null || true
npm run dev &
```

**Preview: http://localhost:3000** (or actual port from output)

## Completion

Report:
1. Files created
2. Linea UI blocks used and why
3. Custom classes added with justification
4. Quality scores
5. Areas where the library couldn't match exactly
6. Preview URL
