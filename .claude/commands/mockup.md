---
description: Design a UI mockup (page, screen, dashboard, store, form, component) following Linea UI's principles, an 8px/24px vertical rhythm and its block vocabulary, as a Claude Design canvas with a link to keep editing, or as standalone HTML files when no canvas can be published.
argument-hint: "[what to mock up] [--out folder]"
allowed-tools: Bash(python3 .claude/commands/mockup/scripts/*)
---

# Linea UI mockups

Brief: $ARGUMENTS

Design what the brief asks for at the level of a dedicated design tool, following two Linea UI principles (https://lineaui.com/getting-started/principles):

1. **Vertical rhythm:** spacing and box heights on the 8px grid, line-heights and the space between text on the 24px grid.
2. **Existing blocks first:** build each region from Linea's block vocabulary (navbar, page header, card, stat, table, tabs, price…) before inventing new pieces.

The library itself is never loaded. Every block is drawn natively in the style of a direction you choose with the user: palette, fonts, layout, imagery and texture are open, and creativity is encouraged.

The reference sections at the end of this command cover design and rhythm ("Design guide"), the block vocabulary ("Block vocabulary"), canvas artboards ("Canvas artboards") and HTML files ("HTML files"). Read the first two and the one for your target before the first mockup in a session. Run the scripts from the project root.

## Where the mockup goes

- **Design canvas (preferred).** If the session can publish artifacts (the Artifact tool is available and lists a Design type), draw the mockup as artboards on a Claude Design canvas and give the user its link, so they can keep editing it on claude.ai. To revise a canvas the user links, read it first and publish to the same link. Follow the canvas's own instructions for files and publishing, and "Canvas artboards" below for the artboard skeleton.
- **HTML files (fallback).** If no canvas can be published, write one self-contained `.html` file per screen to `input/` at the project root, or to the folder passed with `--out`. Follow "HTML files" below. Say in the reply that no canvas link was possible and why, when known (not signed in with `/login`, artifacts or the Design template turned off, an unsupported plan or provider).

## Keep it fast

A designed screen should take a few minutes. Never browse lineaui.com or read the library's code; the references cover what you need. Write each screen in one pass; render, look, fix, render once more; lint; deliver.

## 1. Ask

Ask about anything that changes the result. Use `AskUserQuestion` (up to 4 questions; options concrete to this brief, your pick first with "(Recommended)").

Always settle the **direction** unless the brief gives one: offer two or three named directions for this piece (a few words each on palette, type and feel), or ask for the brand, references or design system to follow. Then ask whatever else the brief leaves open: which job the screen does first, which screens make up the set, real content and images the user can supply, whether a clickable prototype is wanted, whether both a light and a dark theme are needed. Do not ask what the conversation already answers. With nobody there to answer, commit to one direction in a line, decide the rest, and list the decisions in the reply.

## 2. Icons

Icons are Font Awesome Free 7, inlined as SVG in the markup. Never link its stylesheet or webfonts: a canvas does not reliably load a stylesheet or font linked by a relative path, so webfont icons can render as nothing for the user while a local render still shows them.

Unpack the package once per session in a temporary folder outside the project:

```bash
FA="$(mktemp -d)" && cd "$FA" && npm pack @fortawesome/fontawesome-free@7 --silent && tar -xzf fortawesome-fontawesome-free-*.tgz
cat "$FA/package/svgs/solid/<name>.svg"     # also svgs/regular/ and svgs/brands/
```

Copy each icon's `viewBox` and path `d` into the markup:

```html
<svg class="icon" viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="…"></path></svg>
```

- Size icons with a shared `.icon { display: block; width: 16px; height: 16px; flex: none; }` (16, 24 or 32px) and colour them with `color`, since the path uses `currentColor`.
- A missing file under `svgs/` means the name does not exist in Font Awesome Free 7: pick another icon.
- Decorative icons get `aria-hidden="true"`; an icon-only button gets an `aria-label`.
- Add one comment crediting the icons: `<!-- Icons: Font Awesome Free 7 (CC BY 4.0) -->`.

## 3. Design and build

- Write the direction as CSS custom properties first: colours as `light-dark()` pairs when both themes are wanted (plain values for a single theme), fonts, radius, elevation. Use those variables everywhere.
- Compose each screen: focal point, grid, section rhythm, imagery, atmosphere ("Design guide").
- Map every region to a block from "Block vocabulary" and draw it with that block's anatomy and sizes; invent a new piece only where no block fits or the design calls for one.
- Real `<button>`, `<a href>`, `<label>` + `<input>`, `aria-label` on icon-only buttons.
- No external code: Google Fonts is the only outside request.

## 4. Look at it

Always render and look. It takes seconds and is the only way to catch what a linter cannot see. The script reads a canvas artboard (`.dc.html`) or a plain `.html` file:

```bash
python3 .claude/commands/mockup/scripts/render_artboard.py <file> <tmp>/render     # ~3 s: 1440 and 390 wide, light and dark
```

Keep the render folder outside the project. Pass `--width 1440` alone for a fixed-size artboard, and `--theme light` or `--theme dark` alone for a single-theme design. Tile names carry their width, theme and y range. The script needs Python's Playwright with Chromium; if it is missing, ask before installing it (`pip install playwright && python3 -m playwright install chromium`).

Read every tile it lists and go through the visual check in "Design guide". Fix everything it finds, render once more to confirm.

## 5. Lint and deliver

```bash
python3 .claude/commands/mockup/scripts/check_mockup.py <file>
```

Errors are Font Awesome webfont classes or stylesheet links, which will not render. Warnings are rhythm breaks: fix them unless the value is decoration outside the text flow. Then publish the canvas following its own instructions, or leave the HTML files in their folder.

## 6. Reply

A few lines: the canvas link or the files written, the direction you took, decisions the user did not make, pieces you invented beyond the block vocabulary and why, and placeholders the user should fill.

# Reference

## Design guide

Two principles from Linea UI, then freedom.

1. **Vertical rhythm.** Every margin, padding, gap and box height is a multiple of 8px. Every line-height, and the space between text blocks, is a multiple of 24px.
2. **Existing blocks first.** Build each region from the block vocabulary in "Block vocabulary" (its anatomy and sizes) before inventing something new. The blocks are drawn natively in the mockup in the direction's own style; no library CSS is loaded.

Everything else is yours: palette, type, layout, imagery, texture. Be as creative as the brief allows and aim for the quality of a dedicated design tool.

### Direction

- **Commit to a direction you can name** ("Brutalist ledger", "Soft botanical", "Night-shift terminal", "Swiss poster"). Decide who uses the screen, what it must make obvious, the tone, and the one thing someone will remember. Bold maximalism and precise minimalism both work; a timid middle does not.
- **A small system, written down first** as CSS custom properties in the helmet: ground, surface, text, muted text, border, one or two accents, each as a `light-dark()` pair; one to three fonts; a radius and an elevation stance. Use those variables everywhere so the design stays consistent and the theme tweak works.
- **Type with character.** One to three Google Fonts families: a distinctive display face and a body face that reads well at 16px, plus mono if useful. Avoid Inter, Roboto, Arial and Fraunces unless the brand uses them. Display lines can go to 96 or 144px when the composition earns it.
- **Colour with conviction.** A dominant ground and one or two sharp accents; tinted whites and blacks. Text contrast 4.5:1, 3:1 from 24px (`python3 scripts/contrast.py FG BG`). Colours that must be told apart also differ in lightness.
- **Composition.** One focal point per screen, at least two steps of type size above its surroundings. Asymmetry, overlap, grid-breaking media, generous negative space or controlled density. Use the 12-column grid with uneven spans.
- **Atmosphere.** Colour fields, gradients, grain, patterns, layered transparencies, dramatic shadows: welcome when they serve the direction, on their own layer behind the content.
- **Imagery.** The user's images, or art-directed placeholders: tinted fields or shapes in the palette, at the right ratio, with a short bracketed label of what goes there. Never a grey box labelled "Image".
- **Copy.** Specific to what the user said. Bracket unknowns (`[YOUR PRICE]`); bracket sample figures. No lorem ipsum, invented testimonials, logos or claims.
- **Tropes to skip:** emoji, rounded cards with a coloured left border, interchangeable marketing filler, a sea of identical cards.

### Rhythm in practice

- **Spacing steps:** 4px for inline details only, then 8, 16, 24, 32, 48, 72, 96, 144.
- **Type scale** (size / line-height), a starting point you can resize: display 80/96 and 56/72, h1 40/48, h2 32/48, h3 20/24, h4 18/24, body 16/24, small 14/24, caption 12/16.
- **Line-height for any font size:** the smallest multiple of 24px that is at least 1.1 × the size. 18px → 24, 32px → 48, 44px → 72, 72px → 96, 112px → 144. 12px text may use 16px when its padding or margin brings the box back to a multiple of 24.
- **Borders must not add height.** Draw box outlines with `outline: 1px solid …; outline-offset: -1px` or an inset `box-shadow`. When a real border separates content, subtract its width from the neighbouring padding (23px under a 1px border).
- **Controls:** 32, 40 or 48px tall. Media heights in multiples of 8.
- Overlapping, rotated or absolutely positioned decoration sits outside the flow, so it is free; text that flows sits on the grid.

### Visual check

Read every rendered tile against this list; fix and render again.

- **Legibility:** every text readable against what is behind it, especially prices, subtitles, captions and labels on dark, accent or image grounds, in both themes.
- **One left edge:** navbar, sections and footer share one container width; nothing touches the artboard or page edge.
- **Baselines and centring:** currency, amount and period share a baseline; icons are centred on their line of text; list items share one indent.
- **No accidental wrapping:** identifiers, buttons, badges, tab labels and table headers stay on one line; a headline breaks where the meaning breaks, never leaving one short word alone.
- **No accidental overlap:** flags, badges, shadows and decoration never collide with text.
- **Even rhythm:** no holes (a gap far larger than its neighbours) and no cramped clusters; related items sit closer than unrelated ones; columns in a table have deliberate widths.
- **Explanations next to what they explain:** legends, captions and notes touch their subject.
- **Phone width:** columns stack, nothing scrolls sideways, display type steps down, a comparison table keeps every plan visible (shorter labels or one table per plan), the navbar has a menu toggle.
- **Palette discipline:** every colour on the page comes from the system's variables; no browser-default blue links, no accent that appears in one place only, unstyled buttons or list bullets.
- **Headings on a phone:** no single word left alone on the last line (rephrase, adjust the size, or use `text-wrap: balance`).
- **Both themes:** a featured or highlighted element stays distinct in dark as well as light.

## Block vocabulary

The component types Linea UI defines, with their anatomy and the sizes that keep them on the rhythm. Reach for these before inventing new ones, and build them natively in the mockup in the direction's own style. The library's CSS is never loaded; only its ideas are reused.

### Layout

- **Container:** content width 900px (narrow 600px, about 70 characters; wide 1200px; full bleed). Side gutter 16px on phones, 32px from 768px.
- **Grid:** 12 columns, gaps of 8, 16, 24 or 32px; or auto-fit columns with a minimum width.
- **Cluster:** a wrapping row of items with an 8, 16 or 24px gap.
- **Section:** a full-width band with vertical padding of 32, 48, 72, 96 or 144px, an optional eyebrow, title and lead, and an optional sunken, raised or inverse ground.
- **Shell (app frame):** 48px header bar, 240px sidebar, scrolling main area with 32px padding. The sidebar becomes an overlay below 1024px.

### Navigation

- **Navbar:** 72px tall (48 compact): brand, primary links, actions, a menu toggle on phones that opens a panel.
- **Menu (sidebar navigation):** groups with a small heading, items with icon, label, badge or shortcut, a marked current item; table-of-contents and pill variants.
- **Breadcrumb:** links separated by a glyph, the current page as plain text.
- **Tabs:** underline, pills or boxed; tabs may carry an icon or a count.
- **Pagination:** previous, numbered pages with the current one marked, an ellipsis, next; or a compact "Page 3 of 12".
- **Steps:** numbered or dot markers joined by connectors, horizontal or vertical, with complete, current and error states.

### Content

- **Page header:** eyebrow (12px, uppercase, spaced), title, lead, meta row, actions, optional tabs below. A hero version uses display type.
- **Card:** media, eyebrow, title, subtitle, body, footer, actions; padding 16, 24 or 32px; outlined, flat, raised or tinted; horizontal variant with media on the side.
- **List:** rows 48px tall (32 compact, 64 spacious) with leading icon or media, title, description, trailing meta or action; divided or bordered.
- **Data list:** term and value pairs, stacked or side by side, optionally divided or striped.
- **Table:** header row, body rows, numeric columns right-aligned with tabular figures, optional select column, sortable headers, striped or divided rows, sticky header or first column, row states (success, warning, danger).
- **Stat:** label, large value with unit, delta (positive or negative) with a comparison note, optional sparkline.
- **Timeline:** markers on a connecting line, each with title, time and body; markers coloured by status.
- **Quote:** text, citation, optional avatar; pull-quote and card variants.
- **Code block:** header with language label and copy action, body with line numbers and highlighted lines.
- **Accordion:** items with a title and a chevron that turns when open.
- **Avatar:** 24, 32, 40, 48 or 64px, photo or initials, optional status dot, overlapping groups with a "+3".
- **Meta row:** small items separated by dots (author, date, reading time).
- **Media:** images at fixed ratios (1:1, 4:3, 3:2, 16:9, 21:9) with caption and credit.
- **Prose:** long-form text at the 600px measure with headings, lists, quotes and figures on the rhythm.

### Forms

- **Field:** label (with required or optional marker), control 32, 40 or 48px tall, hint, error message, character counter; inline variant with the label beside the control.
- **Input group:** a control joined to text addons, an icon or a button.
- **Choice:** checkboxes, radios and switches in a group; card-style options with a description and an aside such as a price.
- **Form:** sections with title and description, rows of fields side by side, an actions bar (sticky when long).

### Actions and feedback

- **Button:** 32, 40 or 48px tall; solid, subtle, outline, ghost and link styles; a colour per role (primary, secondary, success, warning, danger, info); icon-only square version; loading and pressed states.
- **Button group:** buttons spaced or joined into a segmented control.
- **Badge:** small label, subtle, solid or outline, optionally with a status dot or a count.
- **Tag:** a chip for categories or filters, removable or selectable.
- **Alert:** icon, title, body, actions, dismiss; subtle, accent, solid and full-width banner versions.
- **Toast:** a 300 to 420px notice in a screen corner with title, body, action, close and a timer bar.
- **Tooltip:** a short label with an arrow on any side.
- **Dropdown:** a menu under a toggle with headings, items with icons and shortcuts, dividers, a danger item.
- **Modal:** 400, 560 or 800px wide (or full screen), with header, scrolling body and footer actions.
- **Drawer:** a 320, 400 or 560px panel from the side or bottom with header, body and footer.
- **Progress:** a track 4, 8 or 16px tall with label and value; indeterminate version.
- **Spinner:** 16, 24 or 32px.
- **Skeleton:** placeholder lines, circles and blocks at text line heights.
- **Empty state:** icon or illustration, title, body, actions; centred.
- **Divider:** a horizontal or vertical rule, optionally with a centred label, taking a whole 24px line.
- **Site footer:** brand and description, link columns with headings, social links, a bottom bar with legal text.

### Commerce

- **Product card:** image at 1:1, 4:5 or 3:4, badges, wishlist action, vendor, title, price, colour swatches, add-to-cart; sold-out state.
- **Price:** currency, amount, original price struck through, discount, period ("/ month"); sizes from small to extra large.
- **Rating:** stars with a numeric value and review count.
- **Swatch:** colour, text or image options for variants.
- **Quantity:** decrement, number, increment.
- **Gallery:** main image with thumbnails or dots.
- **Line item:** 64px thumbnail, title, variant details, price, remove action.
- **Order summary:** rows for subtotal, shipping and tax, a bold total, a coupon field, the checkout action.

### Dashboard

- **Toolbar:** a bar with start and end groups holding filters, search, a result count, dividers; a bulk-action version.

## Canvas artboards

The canvas's own instructions arrive when you create it (file shapes, `canvas.json`, publishing); follow them for mechanics, and write the artboards in its native way: inline `style` for one-off elements (the properties panel edits it), flex and grid with `gap`, shared classes in the helmet `<style>` for anything repeated. Skip the canvas's `craft.md`; "Design guide" covers design. Two exceptions to the canvas's instructions: icons are inline Font Awesome SVG (step 2 above), and you always render and look (step 4 above).

Never link a stylesheet, font or script by a relative path from an artboard; keep everything inline or on Google Fonts.

### Artboard skeleton

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Pricing</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<!-- Icons: Font Awesome Free 7 (CC BY 4.0) -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif&amp;family=Manrope:wght@400;500;700&amp;display=swap">
<style>
body { margin: 0; }
:root {
  color-scheme: light dark;
  --ground: light-dark(#F3EFE6, #14120F);
  --surface: light-dark(#FFFDF8, #1E1B17);
  --ink: light-dark(#1B1915, #F1ECE2);
  --muted: light-dark(#5E584D, #A9A193);
  --line: light-dark(#DDD5C6, #3A352D);
  --accent: light-dark(#C2410C, #FB8A4F);
  --on-accent: light-dark(#FFFFFF, #1A0B03);
  --display: 'Instrument Serif', Georgia, serif;
  --body: 'Manrope', system-ui, sans-serif;
}
[data-theme="light"] { color-scheme: light; }
[data-theme="dark"] { color-scheme: dark; }
.theme { background: var(--ground); color: var(--ink); font: 16px/24px var(--body); }
.icon { display: block; width: 16px; height: 16px; flex: none; }
/* shared classes for repeated pieces */
</style>
</helmet>
<div class="theme" data-theme="{{theme}}" style="min-height: 100vh">
  <!-- the design -->
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"theme":{"editor":"enum","options":["auto","light","dark"],"default":"auto"},"$preview":{"width":1440,"height":2400}}'>
class Component extends DCLogic {
  renderVals() {
    return { theme: this.props.theme ?? 'auto' };
  }
}
</script>
</body>
</html>
```

- The variables are the direction's system; rename and extend them freely, but use them everywhere instead of raw colours so both themes work.
- `.theme` repaints the ground and resets the text colour. Use it on the root (with the `theme` tweak) and on any inner band or card that carries its own `data-theme="dark"` or `"light"`; a dark background without it leaves inherited text dark on dark.
- Keep the `theme` tweak on every artboard that has both themes; for a single-theme design, write plain colour values, set `color-scheme` to that theme and drop the tweak. Add other tweaks only for real levers (an accent colour, a density switch).
- Reset browser defaults you rely on (`h1`–`h6`, `p`, `ul` margins; `button` font and border) in the helmet, so every value on the page is one you chose and sits on the rhythm.

### Sizes and layout

- Web pages, dashboards and app screens are PAGE artboards: `"expand": "fill"`, `w` 1280 to 1440, `h` the page's height at that width (over-tall beats clipped), a fluid root with a max-width container and side gutters, grids with `repeat(auto-fit, minmax(min(…, 100%), 1fr))` or media queries so they stack on a phone.
- Phone screens: fixed 390 × 844 root, no fake status bar.
- Options: one artboard per direction, side by side, with a `title1` note naming the set.
- Shared chrome across three or more artboards goes in its own `.dc.html` mounted with `<dc-import>`.

### Interaction

Static artboards show a state with markup. For an artboard that should work when played, set `"is_interactive": true` and drive state with `DCLogic`. A two-way switch (monthly/yearly):

```html
<div role="tablist" style="display: inline-flex; gap: 4px; padding: 4px; border-radius: 999px; background: var(--surface)">
  <button role="tab" aria-selected="{{monthlySel}}" onClick="{{showMonthly}}" style="height: 40px; padding: 0 16px; border: 0; border-radius: 999px; background: {{monthlyBg}}; color: {{monthlyInk}}">Monthly</button>
  <button role="tab" aria-selected="{{yearlySel}}" onClick="{{showYearly}}" style="height: 40px; padding: 0 16px; border: 0; border-radius: 999px; background: {{yearlyBg}}; color: {{yearlyInk}}">Yearly</button>
</div>
<sc-if value="{{isMonthly}}" hint-placeholder-val="{{ true }}">…monthly prices…</sc-if>
<sc-if value="{{isYearly}}" hint-placeholder-val="{{ false }}">…yearly prices…</sc-if>
```

```js
renderVals() {
  const y = (this.state && this.state.period) === 'yearly';
  const on = 'var(--ink)', off = 'transparent', onInk = 'var(--ground)', offInk = 'var(--ink)';
  return {
    theme: this.props.theme ?? 'auto',
    isMonthly: !y, isYearly: y, monthlySel: String(!y), yearlySel: String(y),
    monthlyBg: y ? off : on, monthlyInk: y ? offInk : onInk,
    yearlyBg: y ? on : off, yearlyInk: y ? onInk : offInk,
    showMonthly: () => this.setState({ period: 'monthly' }),
    showYearly: () => this.setState({ period: 'yearly' }),
  };
}
```

To swap icons with state (open and close, play and pause), put each SVG in its own `<sc-if>` branch; a `{{hole}}` can drive a rotation through `style="transform: {{rot}}"`.

## HTML files

The fallback when no Design canvas can be published: one self-contained `.html` file per screen in `input/` (or the `--out` folder), named after the screen (`pricing.html`, `checkout-mobile.html`). Each file has inline CSS, inline SVG icons and, when the screen is interactive, one short plain JavaScript block at the end. Google Fonts is the only outside request; no frameworks, CDNs or build step.

### Skeleton

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pricing</title>
<!-- Icons: Font Awesome Free 7 (CC BY 4.0) -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif&amp;family=Manrope:wght@400;500;700&amp;display=swap">
<style>
:root {
  color-scheme: light dark;
  --ground: light-dark(#F3EFE6, #14120F);
  --surface: light-dark(#FFFDF8, #1E1B17);
  --ink: light-dark(#1B1915, #F1ECE2);
  --muted: light-dark(#5E584D, #A9A193);
  --line: light-dark(#DDD5C6, #3A352D);
  --accent: light-dark(#C2410C, #FB8A4F);
  --on-accent: light-dark(#FFFFFF, #1A0B03);
  --display: 'Instrument Serif', Georgia, serif;
  --body: 'Manrope', system-ui, sans-serif;
}
[data-theme="light"] { color-scheme: light; }
[data-theme="dark"] { color-scheme: dark; }
body { margin: 0; background: var(--ground); color: var(--ink); font: 16px/24px var(--body); }
h1, h2, h3, h4, p, ul, ol, figure, blockquote { margin: 0; }
button, input, select, textarea { font: inherit; color: inherit; }
[hidden] { display: none !important; }
.icon { display: block; width: 16px; height: 16px; flex: none; }
/* shared classes for repeated pieces */
</style>
</head>
<body>
  <!-- the design -->
  <script>
  /* interaction, if any */
  </script>
</body>
</html>
```

- The variables are the direction's system; use them everywhere instead of raw colours. With both themes, the page follows the visitor's system setting, and `data-theme="light"` or `"dark"` on `<html>` forces one. For a single theme, write plain colour values and set `color-scheme` to that theme.
- Put shared pieces in classes and one-off values inline; the rhythm rules apply to both.
- Layout is fluid: a max-width container with side gutters, grids with `repeat(auto-fit, minmax(min(…, 100%), 1fr))` or media queries, so everything stacks on a phone.

### Interaction

Show the initial state in the markup, then wire behaviour with a small script at the end of `<body>`. Toggle `hidden` and ARIA state instead of building markup in JavaScript:

```html
<button type="button" class="faq-q" aria-expanded="false" aria-controls="faq-1">Question<svg class="icon chev" …></svg></button>
<p id="faq-1" hidden>Answer</p>
```

```js
document.querySelectorAll('.faq-q').forEach((q) => q.addEventListener('click', () => {
  const open = q.getAttribute('aria-expanded') !== 'true';
  q.setAttribute('aria-expanded', String(open));
  document.getElementById(q.getAttribute('aria-controls')).hidden = !open;
}));
```

- Style states from attributes (`.faq-q[aria-expanded="true"] .chev { transform: rotate(180deg); }`) so the script only flips them.
- To swap icons (open and close), keep both SVGs in the button and toggle `hidden` on each.
- A phone menu is a toggle button with `aria-controls` and `aria-expanded`, a panel with `hidden`, and a media query that hides both from 768px up.
