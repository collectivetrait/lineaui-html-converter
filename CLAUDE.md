# Linea UI HTML Converter

## Reference files

Before converting any design, read the condensed reference:
- `reference/converter-reference.md`

This is the sole source of library knowledge. It covers the blocks,
tokens, utilities, and rules used in 90% of conversions (~400 lines
vs ~1300 in the full set). Fall back to the three separate files
in the npm package only when the condensed reference doesn't cover
a needed block:
- `node_modules/@collectivetrait/lineaui-reference/tokens.md`
- `node_modules/@collectivetrait/lineaui-reference/classes.md`
- `node_modules/@collectivetrait/lineaui-reference/rules.md`

Do not rely on training data about Linea UI.

## HTML skeleton

Copy the starter HTML before building the page:
- `reference/skeleton.html`

This contains the full `<head>` (Google Fonts, Font Awesome, library
CSS), skip link, navbar with toggle/panel, a section template, footer
with responsive stacking utilities, and the library JS bundle. Copy
it to `output/index.html` and customize the variable parts (title, brand,
links, content sections, footer text). If the file doesn't exist,
write from scratch.

## Gap overrides template

Copy the starter SCSS template before writing custom styles:
- `reference/_gap-overrides.scss`

This contains all known CSS gap overrides pre-written as boilerplate.
Customize values (navbar height, gaps, etc.) to match each source.
If the file doesn't exist, write the overrides manually from the
"Known block CSS gaps" section below.

## Output conventions

- `output/index.html` — semantic HTML
- `output/assets/styles/custom.scss` — custom styles for gaps the library can't cover
- `output/assets/styles/styles.scss` — imports Linea UI SCSS source and custom styles
- `output/assets/styles/styles.css` — compiled from styles.scss (do not edit directly)
- `output/assets/scripts/main.js` — only for page-specific interactions
  not covered by the library bundle
- `output/assets/` — also holds static files (images, fonts) referenced by the HTML

## Custom CSS rules

### Naming
- All IDs and class names in English, even when the page content
  is in another language
- All identifiers must be semantic and readable — no abbreviations
  (`.inline-icon` not `.ic`, `.tabular` not `.num`)
- BEM format for component classes (anything adding multiple
  properties to a compound element), bare unprefixed for utilities
- If a custom class only sets one or two shorthand properties
  (margin-bottom, whitespace, gap, display), replace it with the
  relevant Linea UI utility or helper class instead — but only
  when the element doesn't need to be targeted by custom selectors
  in the stylesheet. Utility and helper classes must never be
  referenced in custom CSS selectors; use a custom class for that
- The same applies to responsive styles: use the library's
  responsive utility variants (e.g. `d-none d-inline@md`) instead
  of writing custom media queries for single-property changes.
  Only use custom responsive CSS for compound component overrides
  that change multiple properties

### Values
- Use Linea UI tokens (`var(--s3)`, `var(--primary)`, etc.) — never
  hardcode values the token system covers. If a token doesn't
  produce the right result, override it on `:root`
- Never use px for values that affect vertical rhythm (font-size,
  line-height, padding, height). Always use rem

### Styling
- No inline styles. All custom styling goes in the stylesheet.
  The only permitted inline styles are token overrides scoped to
  a specific element and its children (e.g. `style="color: var(--pro)"`)
  and values set dynamically by JavaScript at runtime
- Zero custom CSS is suspicious on non-trivial pages; excessive
  custom CSS means the library was underused

### Spacing
- The library uses `border-box`; the source might use `content-box`.
  When setting height on elements with padding, account for the
  difference (e.g. source `height: 48px` content-box + 16px padding
  = 64px bounding → use `height: 4rem` in border-box)
- Never use `min-height` to control the apparent height of elements
  like accordion summaries, list items, or nav links. Use padding to
  create the desired spacing. When a library border adds an unaccounted
  1px, absorb it with `calc(padding - 1px)` on the bottom padding
  rather than switching to `min-height` — `min-height` creates fragile
  layouts when content wraps to multiple lines
- The library base sets `margin-bottom` on headings and paragraphs.
  Strip these margins inside any flex/grid container that uses `gap`,
  at any nesting depth — not just direct children. A heading inside
  a wrapper div inside a flex container still stacks its margin with
  the container's gap. Target the specific element class
  (`.my-name { margin: 0 }`) or use a descendant selector
  (`.my-component h1, .my-component h2, .my-component h3,
  .my-component p { margin: 0 }`)
- Never use `margin-top`. Prefer `margin-bottom` on the preceding
  element. Never combine `margin-bottom` on one element with
  `padding-top` on the next — pick one
- Always measure the source's vertical space between elements by
  computed values, then implement the same exact space in the output

### Verification
- Verify all styles by computed values — never trust visual
  appearance. Use `getComputedStyle` on both input and output to
  compare every relevant property. If a library default differs
  from the source, override it — overriding a default is fine when
  it matches the source

## Conversion principles

These apply to every conversion, whether run by the main agent,
a fork, or a section worker.

- **Library blocks first, custom classes last.** For every visual
  pattern in the source, check the reference for a matching block
  BEFORE creating a custom class. A section band is `ln-section`,
  a card surface is `ln-card`, a grid layout is `ln-grid`, a button
  is `ln-button`, a data table is `ln-table`, a tab row is `ln-tabs`.
  A page full of custom classes with few library blocks is a failed
  conversion, even if it looks right visually.
- **No inline styles from the source.** Never copy `style="..."`
  from the source into the output. Move every style to SCSS or a
  utility class. The only permitted inline styles are scoped token
  overrides (`style="--pro: #3F8BD6"`) and values set by JavaScript.
- **Never pre-diagnose coverage.** Do not conclude "this page is
  mostly custom" before checking the reference. Complex pages with
  charts, data tables, and custom illustrations still use library
  blocks for their structural patterns.
- **Gap overrides for every block.** If a library block class appears
  in the HTML, its known gap overrides must appear in `custom.scss`.
  Using `ln-navbar` without navbar gap overrides produces broken
  output.

## Decision hierarchy

1. Semantics — correct HTML element for the content's role
2. Block match — the Linea UI block whose **purpose** matches
   the element's role, not just its appearance. `ln-card` is for
   self-contained content items (articles, products, features)
   that could repeat in a list or grid. Full-width data containers
   (charts, tables, panels) should use utility classes
   (`bg-surface rounded-sm border`) instead — looking like a card
   doesn't make something a card
3. Modifier match — the modifier closest to the visual appearance
4. Utility classes — for adjustments the block doesn't cover
5. Token override — change a token value to match the design
6. Custom CSS — last resort

## Library JavaScript

Use the library's pre-compiled dist bundle:

```html
<script src="node_modules/@collectivetrait/lineaui/dist/bundle.js" defer></script>
```

This handles all interactive behavior:
- **Navbar toggle**: `[data-ln-navbar-toggle]` click flips
  `aria-expanded`/`aria-hidden` on the panel
- **Navbar collapse**: auto-applies `__panel` class on `__nav` at
  mobile breakpoint and resets on resize (no custom `matchMedia`
  listener needed)
- **Escape key**: closes open panels
- **Click outside**: closes named panels
- **Accordion**: `<details>` elements are native HTML — no JS needed

Do NOT write a custom `output/assets/scripts/main.js` to replicate these
behaviors. The source modules at `js/index.js` have a JSON import
issue, but the dist bundle at `dist/bundle.js` is pre-compiled and
works as a plain `defer` script.

For navbar collapse, use an explicit `__panel` element as a sibling of
`__inner` (outside it) with `aria-hidden="true"`. The panel duplicates
the nav links for mobile. The toggle button needs
`data-ln-navbar-toggle` attribute. Use Font Awesome icons (`fa-bars`,
`fa-xmark`) for open/close. Nav links should be plain `<a>` elements
in a `<div>`, not `<ul>`/`<li>`. Add `--actions-visible` only when
the source keeps the CTA button visible on mobile. Check whether the
source hides the button at mobile — if so, omit `--actions-visible`
and include the CTA as a link in the `__panel` instead.

## Known block CSS gaps

These block styles differ from what the reference describes. Add the
corresponding custom CSS to every conversion:

- `body` — the library reset sets `line-height: 1rem` (16px) on
  `body`, overriding the `html` value of `1.5rem` (24px). Most
  source designs use 24px base line-height. Add
  `body { line-height: 1.5rem; }` in custom SCSS.

- `ln-navbar__inner` — no gutter padding, no centering, no height,
  no gap. Add: `margin-inline: auto; padding-inline: var(--gutter);
  height: var(--s6); gap: var(--s4);` Adjust height and gap to match
  the source. Only override `max-width` if the source's navbar inner
  width differs from the default `var(--container-wide)` (1200px).
- `ln-navbar__toggle` — has 8px padding and no border by default.
  Override to match the source: typically `padding: 0;
  width: 2.5rem; height: 2.5rem; border-radius: var(--r-sm);
  box-shadow: inset 0 0 0 1px var(--text);` for a 40px square
  button with an inset border. Gets `margin-left: auto` on mobile,
  which pushes it away from the actions when `--actions-visible` is
  used. Without `--actions-visible`, the toggle's default auto margin
  handles right-alignment correctly — do not override it.
  Add (mobile only): `.ln-navbar__actions + .ln-navbar__toggle { margin-left: 0; }`
- `ln-button` — no default border-radius; default font-size is
  `body-sm` (14px). Add `--rounded-sm` modifier (4px) unless design
  uses a different radius. Override `font-size: 1rem` when the source
  button uses 16px text.
- `ln-card` — no default border-radius on the card itself.
  Add `rounded-sm` utility.
- `ln-card__media-object` — no height or object-fit.
  Add: `height: 12.5rem; object-fit: cover; display: block; width: 100%;`
- `ln-card__body` — has `margin-bottom: 1.5rem` even without a footer.
  Add `mb-0` utility when there's no `__footer`.
- `ln-card__media` — has `margin-bottom: 0` (no gap to content below).
  Add `mb-3` utility for spacing between media and text.
- `ln-navbar__nav` — has `flex: 1` which expands it to fill all
  available space. When nav links should be right-aligned, add
  `flex: none` override and `ms-auto` utility.
- `ln-navbar__actions` — has `margin-left: auto` which pushes it
  to the far right, away from the nav links. When the actions
  should be adjacent to the nav, add `margin-left: 0` override.
- `ln-section` — has 32px padding-block by default. When the
  section inner has its own padding-top (e.g. hero sections),
  add `py-0` utility to avoid double padding. The `--space-xl`,
  `--space-2xl`, and `--space-3xl` modifiers reduce padding at
  mobile (e.g. `--space-2xl` drops from 96px to 48px). When the
  source keeps the same padding at all viewports, override with:
  `@media (max-width: 767.98px) { .ln-section--space-2xl { padding-block: 6rem; } }`
- `ln-stat__label` / `ln-stat__value` — have `margin-bottom: 24px`
  each. Add `margin-bottom: 0` override when the design uses
  tighter spacing.
- `ln-stat__meta` — uses meta token (12px/16px). Override to
  `font-size: 14px; line-height: 24px` when the design uses
  body-sm sizing.
- `ln-site-footer` — line-height is 2rem (32px); override to 1.5rem
  if the source uses 24px. No block padding — add `py-6` on
  `__inner` for vertical padding, `border-sh-t` on the footer for
  the top border.
- `ln-site-footer__columns` — has `margin-bottom: 48px`. Override to 0.
- `ln-site-footer__bottom` — has padding-top, border-top, and flex
  display built in. When used as a full-width band wrapper (sibling
  of `__inner`, not inside it), reset: `display: block; padding-top: 0;
  border-top: 0;` and use `border-sh-t` utility for the border.
- `ln-site-footer__inner` — no gutter padding.
  Add: `margin-inline: auto; padding-inline: var(--gutter);`
- `ln-site-footer__heading` — uses body font size (16px) not mono/uppercase.
  Add `.h6` utility class alongside `__heading` to get 12px mono uppercase.
- `ln-site-footer__brand` — has `margin-bottom: var(--s4)` (32px).
  Add `mb-1 fw-bold` utilities to reduce margin and add bold weight.
- `ln-site-footer__columns` — inline `grid-template-columns` won't
  stack on mobile. Add `ln-grid ln-grid--cols-1 ln-grid--cols-{n}@md`
  (where `{n}` is the column count) to get responsive stacking via the
  grid block's responsive modifiers. Do NOT create a custom class.
- `ln-accordion__item` — the default `border-bottom` is compensated
  by inner element padding to maintain vertical rhythm. When
  overriding that padding (e.g. changing summary min-height or
  padding to match the source), the compensation breaks and the
  border adds an unaccounted 1px. Fix by adjusting the inner
  padding to absorb the border (preferred), or by replacing the
  border with an inset shadow:
  `border: 0; box-shadow: inset 0 -1px 0 var(--border);`
  The first `__item` also gets a `border-top` — remove it with
  `.ln-accordion__item:first-child { border-top: 0; }` when the
  source has no top border on the first item.
- `ln-navbar__panel` — **library bug**: the panel uses
  `[aria-hidden="false"] { display: block }` with no desktop
  override. Once toggled open on mobile, the panel stays visible
  when the viewport widens past the collapse breakpoint. Fix with:
  `@media (min-width: 768px) { .ln-navbar__panel { display: none !important; } }`
  The library bundle's resize handler only covers auto-generated
  panels (no explicit `__panel`), so this CSS fix is always needed
  when using an explicit `__panel` element.
- `ln-navbar__brand` — no gap between flex children. Add
  `gap: var(--s1)` (8px) when the brand has inline children like
  icon dots.
- `ln-accordion__summary` — no `justify-content` set. When the
  summary contains a trailing icon (chevron), add
  `justify-content: space-between` to push it right.
- `ln-accordion__icon` — inherits `color: var(--text)` from the
  summary. Override to `color: var(--c-muted)` to match typical
  source designs.
- `ln-navbar__link` — has default `padding`, `font-size`,
  `font-weight`, `text-decoration`, and `box-shadow` that typically
  differ from source designs. Verify each against the source and
  override at the desktop breakpoint. Common overrides:
  `padding: 0; font-size: 1rem; font-weight: 500; text-decoration: none;
  box-shadow: none;` with hover states set via `box-shadow: inset 0 -2px 0`.
- Heading `letter-spacing` — the library base layer applies
  `letter-spacing: -0.005em` on `h2`, `h3`, etc. Custom heading
  classes that set `font: ... var(--f-prose)` still inherit this
  because cascade layers let base-layer properties through for
  properties the custom class doesn't explicitly set. Add
  `letter-spacing: normal` on any custom heading class when the
  source heading has no letter-spacing.

## Conversion checklist

Run through BEFORE the first browser check:

- [ ] `data-theme` set to match source; Font Awesome CDN loaded;
      Google Fonts `<link>` for all font families used by the design
- [ ] Token overrides on `:root` (fonts, colors, radius) match source
- [ ] No inline styles (except scoped token overrides and JS values)
- [ ] All IDs and class names in English, semantic, readable
- [ ] Navbar: inner centering/gutter/height; `__nav`/`__link` height,
      padding, gap, font-size, font-weight verified against source;
      toggle with `data-ln-navbar-toggle` + `--collapse` + `__panel`
- [ ] Buttons: `--rounded-sm`; outline buttons match source color/border
- [ ] Cards: `rounded-sm`, `mb-3`/`mb-0` where needed; `ln-card` only
      for content items, not data containers
- [ ] Footer: `py-6 border-sh-t`, inner gutter, brand/heading overrides,
      columns via `ln-grid` responsive modifiers
- [ ] Spacing: heading/paragraph margins stripped in flex/grid containers;
      no margin-top; no combined margin-bottom + padding-top;
      border-box height accounts for padding
- [ ] `<script defer>` (not `type="module"`) for `main.js`
- [ ] Side-by-side browser comparison with computed-value verification

## SCSS compilation

Run `npm run compile` to build output/assets/styles/styles.css from output/assets/styles/styles.scss.
