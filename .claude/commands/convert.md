---
description: Convert a visual design (raw HTML) into a pixel-perfect Linea UI implementation
argument-hint: Path to the input file (e.g. input/mockup.html)
---

# Convert to Linea UI

Always rebuild the page from scratch. Delete any existing output files (`output/index.html`, `output/assets/styles/custom.scss`, `output/assets/styles/styles.css`) before starting. Never reuse output from a previous conversion.

You are converting a visual design into a pixel-perfect implementation using the Linea UI CSS library. The input is the visual spec — how it looks is what matters, not how it's built.

When library usage correctness and pixel-perfect matching conflict, prefer library correctness — but check the compiled CSS against what the reference claims. Several blocks have CSS gaps (see CLAUDE.md "Known block CSS gaps") that require custom overrides on every conversion.

## Phase 1: Setup

Read these files in parallel — they stay in context for the entire conversion and are inherited by all forks:

1. `reference/converter-reference.md` — condensed library reference (blocks, tokens, utilities, rules). This is the sole source of library knowledge. If this file doesn't exist, fall back to reading all three separate files: `tokens.md`, `classes.md`, `rules.md`.

2. `CLAUDE.md` — especially "Known block CSS gaps", "Conversion checklist", and "Library JavaScript".

3. `reference/_gap-overrides.scss` — starter SCSS template.

4. `reference/skeleton.html` — starter HTML.

5. The input file at: `$ARGUMENTS`
   - If no argument was provided, ask the user for the input file path.

6. If the input is an HTML file, render it in the browser (using Claude in Chrome if available) to understand its visual appearance. If browser tools are unavailable, read the HTML and its inline styles to infer the visual intent.

## Phase 2: Source mapping

Before writing ANY code, produce a JSON map of the source page. Save it as `output/source-map.json`. This map drives the entire conversion — every subsequent phase reads from it.

### Map principles

**Describe what you see, not how it's built.** The map uses natural language, never CSS syntax. "Thin dark purple border" not `box-shadow: inset 0 0 0 1px`. "24px bold white mono text" not `font: 700 24px/24px var(--mono)`. The implementer should be able to build the output from the map alone, without seeing the source.

**Be specific enough to implement from.** Every visible property matters:
- **Text**: size, weight, color, family — for every text element. "h3 title" is not enough; "20px semibold white UI-font title" is.
- **Colors**: name the color on every element, even when it's the default. "White text" on a button, "muted lavender links" in footer. Say "inherits" when the element uses the parent's color.
- **Icons**: name the icon and its size relative to text. "16px download icon" or "icon at text line-height", not just "download icon".
- **Borders and surfaces**: describe what the eye sees — "thin dark border, deep shadow, 6px radius, no outline" — on every boxed element. If there's no border, say "no border".
- **Spacing between siblings**: "no gap between the bar and its labels", "24px below the heading". Not just padding on individual elements.
- **DOM nesting**: state parent-child relationships for compound components — "the labels sit inside the bar container" matters for BEM.
- **Link decoration**: describe whether body text links are underlined or not. If only navigation links remove the underline, say so explicitly — "body text links are underlined by default; navigation links and buttons remove the underline." The library's base layer may strip underlines, so the implementer needs to know whether to restore them.
- **Table header rows**: describe whether header rows share the same height as data rows or are shorter. "Header rows are the same 48px height as data rows" or "header rows are auto-height, shorter than data rows." Don't just describe the header's font and padding — the row height matters too.

**Quote verbatim text.** Don't paraphrase banners, labels, button text, or any user-visible string. Include the exact text in the map so the implementer copies it, not rewrites it.

**Copy SVGs exactly.** Note in the map when an SVG must be copied verbatim from the source (viewBox, stroke attributes, paths). Don't summarize SVGs — the implementer needs to know to copy them.

### Critical rules (apply to the map AND the build)

**Library blocks first, custom classes last.** For every visual pattern in the source, check the reference for a matching library block BEFORE creating a custom class. A section band is `ln-section`, a card surface is `ln-card`, a grid layout is `ln-grid`, a button is `ln-button`, a data table is `ln-table`, a tab row is `ln-tabs`. Only create a custom class when no library block fits the component's purpose. If you skip this step, the coverage score will fail.

**No inline styles.** Never copy the source's inline `style="..."` attributes into the output. Move every style to `custom.scss` or replace it with a utility class. The only permitted inline styles are scoped token overrides (`style="--pro: #3F8BD6"`) and values set dynamically by JavaScript at runtime.

**Never pre-diagnose coverage.** Do not decide "this page is mostly custom" before checking the reference. Complex pages with charts, data tables, and custom illustrations still use library blocks for their structural patterns.

**Apply all gap overrides for every library block used.** If `ln-navbar` appears in the HTML, the SCSS must include the navbar gap overrides from the template. Same for `ln-site-footer`, `ln-card`, `ln-accordion`, etc.

**All IDs and class names in English.** Even when the page content is in another language. This applies to IDs referenced by JavaScript too — rename them and update the JS.

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
    "radius": "<default border-radius in natural language>",
    "containerWidth": "<max-width>",
    "sharedSurfaces": "<describe the surface treatment shared across cards, stat boxes, tables — border, shadow, radius, outline behavior>",
    "linkDecoration": "<describe default link underline behavior and which link types remove it>"
  },
  "sections": [
    {
      "id": "<suggested-html-id, in English>",
      "tag": "<suggested-semantic-element>",
      "purpose": "<what this region does>",
      "description": "<visual summary in natural language>",
      "text": "<verbatim text content — quote banners, labels, headings, buttons exactly>",
      "appearance": {
        "spacing": { "paddingBlock": "...", "gap": "...", "gapToNextSibling": "..." },
        "background": "<color described in words>",
        "text": { "color": "...", "fontSize": "...", "lineHeight": "...", "fontWeight": "..." },
        "font": "<family in words if different from base>",
        "border": "<describe what the eye sees: 'thin dark bottom border' or 'no border'>",
        "shadow": "<'deep dark drop shadow' or 'none'>",
        "radius": "<'6px rounded corners' or 'none'>"
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
          "text": "...",
          "appearance": { "..." },
          "libraryBlock": "...",
          "libraryModifiers": [],
          "children": []
        }
      ],
      "media": [
        {
          "type": "image | svg | icon",
          "src": "<original src or 'inline, copy exactly from source'>",
          "dimensions": { "width": "...", "height": "..." },
          "appearance": "<shape, color, fit, stroke-width, decorative vs content>",
          "copyExact": true
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
- Set `copyExact: true` on any SVG that must be reproduced verbatim from the source.
- Include `text` with the exact verbatim string for any element with user-visible text (banners, headings, buttons, labels, legal text).

### Navbar decisions (record in the map):
- `--collapse` always; `--actions-visible` only when source keeps CTA visible on mobile; `--center` only when source centers nav links
- `--transparent` when source navbar has no background
- Google Fonts `<link>` in `<head>` for all font families (the library declares font-family tokens but does NOT load font files)
- Brand gap: check source and add `gap: var(--s1)` or appropriate value
- Active link styling scoped to desktop only (`@media (min-width: 768px)`)
- Custom heading classes using `--f-prose` need `letter-spacing: normal` (library base applies `-0.005em`)

### Footer decisions (record in the map):
- Column widths (e.g. "2fr 1fr 1fr 1fr" or equal)
- Responsive stacking behavior (row → column at mobile)
- Mobile padding and alignment changes
- `ln-site-footer` line-height override when source uses 24px
- Footer link text-decoration, color, and gap between links

## Phase 3: Build skeleton + base SCSS

The main agent writes the page skeleton and base styles. These are the shared foundations that all section forks build on.

### 3a. HTML skeleton

Write `output/index.html` with:
- Full `<head>` (title, Google Fonts, Font Awesome, stylesheet link)
- Skip link
- `<header>` with the complete navbar (brand, nav links, CTA, toggle, panel) — following the map's navbar section
- Empty `<main id="main">` — section forks will produce the content
- Complete `<footer>` — following the map's footer section
- Script tags (`bundle.js` + `main.js`)

### 3b. Base SCSS

Write `output/assets/styles/custom.scss` with:
- `:root` token overrides (fonts, colors, radius, custom tokens from the map)
- Shared surface CSS custom properties (`--card-border`, `--card-shadow`)
- Library block resets (`ln-card`, `ln-stat`, `ln-table`, `ln-button--outline` — outline: 0, border: 0, shared surface)
- Base overrides (`body` line-height, link color and decoration, scroll behavior)
- Navbar gap overrides (all of them, customized to map values)
- Footer gap overrides (all of them, customized to map values)
- Header styles (background, border, shadow from map)
- Any page-wide custom classes (announcement banner, etc.)

Write `output/assets/styles/styles.scss`:
```scss
@use '../../../node_modules/@collectivetrait/lineaui/scss' as *;
@use 'custom';
```

### 3c. JS

If the source has page-specific JS, adapt it into `output/assets/scripts/main.js` with class names matching the output HTML. Always include the library bundle:
```html
<script src="node_modules/@collectivetrait/lineaui/dist/bundle.js" defer></script>
```

## Phase 4: Build sections (sequential forks)

For each content section in the map (everything inside `<main>`), dispatch a **fork** to build it. Forks inherit the full conversation context — they already have the reference, CLAUDE.md, gap overrides, and the map in memory. No redundant reads needed.

**Run forks sequentially**, not in parallel. Each fork:
1. Reads its section entry from `output/source-map.json`
2. Follows the section build rules below
3. Writes its HTML fragment to a temporary file (e.g. `$CLAUDE_JOB_DIR/tmp/section-{id}.html`)
4. Appends its SCSS rules to a temporary file (e.g. `$CLAUDE_JOB_DIR/tmp/section-styles.scss`) — first section creates the file, subsequent ones append
5. Reports which library blocks it used and any issues

### Section build rules

Every fork follows these rules when building its section.

**Decision hierarchy** (strict order):
1. **Semantics** — correct HTML element for the content's role
2. **Block match** — use the library block assigned in the map. If the map doesn't assign one for a sub-pattern, check the reference yourself before writing a custom class. Section bands → `ln-section`. Card surfaces → `ln-card`. Grid layouts → `ln-grid`. Buttons → `ln-button`. Tabs → `ln-tabs`. Data tables → `ln-table`. Never skip this step.
3. **Modifier match** — pick the modifier closest to the described visual
4. **Utility classes** — for adjustments the block doesn't cover
5. **Token override** — when the map's appearance differs from the library default
6. **Custom CSS** — last resort, only after confirming no library block fits
7. **Override library defaults** — if the map describes a property that differs from the library default, override it in the SCSS
8. **Gap overrides** — for every library block used in the HTML, include its gap overrides in the SCSS (from CLAUDE.md "Known block CSS gaps")

**No inline styles.** Move every inline style to the SCSS fragment or a utility class. Only permitted inline styles: scoped token overrides (`style="--rubric-color: var(--pro)"`) and values set by JavaScript at runtime. Inline styles like `style="padding: 24px"` or `style="display: flex"` must become SCSS rules or utility classes.

**Naming.** All IDs and class names in English, semantic, readable (`.inline-icon` not `.ic`). Use rem for anything affecting vertical rhythm, never px. BEM format for component classes — only one `__` level (`.block__element`, never `.block__element__child`).

**Spacing.**
- The library base sets `margin-bottom` on headings and paragraphs. Strip it inside any flex/grid container that uses `gap`, at any nesting depth. Target the specific class (`.my-name { margin: 0 }`) or use descendant selectors.
- Never use `margin-top`. Prefer `margin-bottom`. Never combine `margin-bottom` on one element with `padding-top` on the next.
- The library uses `border-box`. When the map gives height values from a `content-box` source, add the padding to get the equivalent border-box height.

**Verifying against the map.**
- Never assume library defaults match the source. The map specifies appearance values — use those, not library defaults.
- Buttons: check the map for source `color`, `background`, `border`, `height`, and `font-size` before choosing modifiers. A button that looks outlined might actually be a ghost button. A solid button might use `--text` as background, not `--primary`.
- `ln-card` with absolutely-positioned children (badges, flags) needs `overflow: visible` — the library sets `overflow: hidden` by default.

**Anti-patterns.**
- Never use `min-height` to control element heights (e.g. accordion summaries, list items). Use padding to create the desired spacing, and `calc(padding - 1px)` to absorb borders.

**CSS variable names.** Use the token names defined in the base SCSS (Phase 3), not the source's original variable names. If the base SCSS defines `--primary: #CB8A52`, use `var(--primary)` — not `var(--accent)`. Check the `:root` block in `custom.scss` for the canonical names.

**HTML fragment.** Write a single fragment — no `<!DOCTYPE>`, `<html>`, `<head>`, or `<body>`. Add accessibility: `alt` on images, `aria-label` on icon-only buttons, `aria-hidden="true"` on decorative icons, labels on form controls.

**SCSS fragment.** Define only the custom classes needed for this section. Include gap overrides for every library block used. Use Linea UI tokens for all values — never hardcode what tokens cover.

### Fork prompt structure

```
Build the "{section-id}" section for the Linea UI conversion.

Read your section entry from output/source-map.json (the "{section-id}" node).

Write your HTML fragment to {tmp-path}/section-{id}.html.
Append your SCSS rules to {tmp-path}/section-styles.scss.

Rules:
- Follow the decision hierarchy: semantics → block match → modifiers → utilities → custom CSS
- Library blocks first — check the reference for every pattern
- No inline styles — move everything to SCSS or utility classes
- All IDs and class names in English
- Apply gap overrides for every library block you use (see CLAUDE.md "Known block CSS gaps")
- Copy SVGs exactly when copyExact is true in the map
- Use verbatim text from the map's text fields
- Follow the shared surface treatment described in base.sharedSurfaces
- Strip heading/paragraph margins inside flex/grid containers
- Use CSS variable names from the base SCSS :root block, not the source's original names
- BEM naming: only one __ level (.block__element, never .block__element__child)
- Use rem for vertical rhythm values, never px
- Override library defaults when the map's appearance differs
- ln-card with positioned children (flags, badges) needs overflow: visible
```

### Assembly

After all forks complete, the main agent:
1. Assembles the HTML fragments into `<main>` in `output/index.html` (in map order)
2. Appends the section SCSS to `output/assets/styles/custom.scss`
3. Compiles with `npm run compile`

## Phase 5: Map review

After assembly and compilation, dispatch an `Explore` agent to audit the output against the map. The reviewer reads `output/source-map.json` and `output/index.html` (and `output/assets/styles/custom.scss` if needed) and checks every map entry against the implementation.

The reviewer checks these dimensions:

1. **Verbatim text** — does every `text` field match the HTML content exactly?
2. **IDs** — are all IDs in English? (JS-referenced IDs that must match main.js are exempt)
3. **Border/shadow/radius** — does each element's surface match the map? No library-default outlines or borders that shouldn't be there. Correct radius on every card.
4. **Typography** — for every text description, verify size, weight, color, AND font family match. Flag utility mismatches (e.g. `.h3` gives prose font when map says UI font).
5. **Icons** — verify each icon name, position (before/after text), and sizing.
6. **Spacing/nesting** — verify sibling gaps, DOM nesting for BEM, table header row heights.
7. **SVGs** — verify every `copyExact` SVG is present with correct attributes.
8. **Layout** — verify grid column widths, footer column ratios, responsive breakpoints.
9. **Colors** — verify element colors match map descriptions (link colors, brand colors, border colors).
10. **Link decoration** — verify body text links are underlined/not per `base.linkDecoration`.

Report format: `[selector] [property] [map says] vs [output has]`, grouped by severity.

Fix every issue, recompile, and re-run the review if more than 2 issues were found.

## Phase 6: Visual comparison

After the map review passes, dispatch a **fork** to run the visual comparison in Chrome. The fork inherits context and uses `javascript_tool` to compare `getComputedStyle` values between source and output.

Start the dev server first:
```bash
pkill -f browser-sync 2>/dev/null || true
npm run dev &
```

The visual comparison fork:
1. Opens both pages (source at `/input/{file}`, output at `/`)
2. Runs ONE batched `javascript_tool` call per page covering all regions
3. Compares every property and reports discrepancies
4. Closes the tabs

### Properties to compare

For each region (navbar, hero, cards, tables, footer):
- `padding`, `gap`, `height`, `min-height`
- `font-size`, `line-height`, `font-weight`, `letter-spacing`, `font-family`
- `color`, `background-color`, `box-shadow`, `text-decoration`
- `border`, `outline`, `border-radius`
- `grid-template-columns` (for grids and table rows)
- At mobile: `flex-direction`, `align-items`, `justify-content`, section `padding-block`

Fix every discrepancy in `custom.scss`, recompile, and re-run if needed.

## Phase 7: Score

```bash
node evals/scoring/score-card.mjs output $ARGUMENTS
```

Fix any dimension below 0.7, recompile, re-score.

## Phase 8: Spacing audit

Run via `javascript_tool` on the output page:

```js
const code = await fetch('/evals/scoring/audit-spacing.js').then(r=>r.text());
JSON.parse(eval(code))
```

Fix every issue.

## Completion

Report:
1. Files created
2. Linea UI blocks used and why
3. Custom classes added with justification
4. Quality scores
5. Map review results (pass/issues found)
6. Visual comparison results (pass/discrepancies)
7. Areas where the library couldn't match exactly
8. Preview URL
