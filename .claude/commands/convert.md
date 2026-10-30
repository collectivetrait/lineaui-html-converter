---
description: Convert a visual design (raw HTML) into a pixel-perfect Linea UI implementation
argument-hint: Path to the input file (e.g. input/mockup.html)
---

# Convert to Linea UI

You are converting a visual design into a pixel-perfect implementation using the Linea UI CSS library. The input is the visual spec — how it looks is what matters, not how it's built.

## Setup

1. Read the three reference files — these are your sole source of library knowledge:
   - `node_modules/@collectivetrait/lineaui-reference/tokens.md`
   - `node_modules/@collectivetrait/lineaui-reference/classes.md`
   - `node_modules/@collectivetrait/lineaui-reference/rules.md`

2. Read the input file at: `$ARGUMENTS`
   - If no argument was provided, ask the user for the input file path.

3. If the input is an HTML file, render it in the browser (using Claude in Chrome if available) to understand its visual appearance. If browser tools are unavailable, read the HTML and its inline styles to infer the visual intent.

## Phase 1: Analysis

Work through these steps before writing any output files. Write your analysis as structured thinking.

### 1. Understand the visual intent

Study the input. What does it look like? Ignore the implementation — focus on the visual result: layout, typography, colors, spacing, components.

### 2. Decompose into semantic regions

Break the page into top-level regions and assign each the correct HTML5 landmark element:

- Site header with navigation → `<header>` with `<nav>`
- Primary content → `<main>`
- Content groups → `<section>` with appropriate headings
- Complementary content → `<aside>`
- Site footer → `<footer>`

Determine the heading hierarchy by document relevance — `<h1>` for the page title, `<h2>` for major sections, `<h3>` for subsections. Never choose a heading level for its visual size; use heading utility classes (`.h1`–`.h6`, `.text-display-1`, `.text-display-2`) to adjust appearance independently.

### 3. Map components to library blocks

For each visual element within a region, find the best Linea UI block match. Follow this order:

1. **Semantic fit first** — which block's purpose matches this element's role? A group of navigation links is `ln-menu`, not a styled `<ul>`. A product display is `ln-product-card`, not a custom card.
2. **Visual fit second** — which modifiers get closest to the design's appearance? Check `classes.md` for every modifier the block offers before considering custom CSS.
3. **Consult `rules.md`** for composition patterns — many blocks are designed to nest (e.g. `ln-product-card` contains `ln-price` and `ln-swatch`).

### 4. Identify recurring patterns

Look for visual elements that repeat across the page:
- Card grids, list items, section layouts
- Repeated spacing or typography patterns
- Shared color treatments

These should use the same block or custom class, not be styled independently.

### 5. Plan custom CSS

For elements that don't map to any library block, or whose appearance can't be fully achieved with modifiers and utilities:

- Plan a custom class name following the project conventions:
  - **BEM format** for component-level adjustments (e.g. `hero__backdrop`, `feature-grid__icon`)
  - **Utility/helper format** (bare unprefixed) for general-purpose adjustments
- Note which Linea UI tokens to use in the custom CSS (`var(--s3)`, `var(--primary)`, etc.)
- Never hardcode a value that a token covers

**Red flags to check:**
- If you have zero custom classes on a non-trivial page, you likely missed something or took shortcuts
- If you have many custom classes, check `classes.md` again — the library probably has a block for it

### 6. Plan accessibility

Review each region and component for accessibility requirements:

- **Images** — every `<img>` needs an `alt` attribute. Decorative images get `alt=""`. Meaningful images get descriptive text.
- **Icon buttons** — buttons with only an icon and no visible text need `aria-label` describing the action.
- **Decorative icons** — icons next to text labels get `aria-hidden="true"` to avoid screen reader duplication.
- **Form controls** — every `<input>`, `<select>`, and `<textarea>` needs a visible `<label>` (linked via `for`/`id`) or an `aria-label`.
- **Navigation landmarks** — `<nav>` elements need `aria-label` when there are multiple on the page (e.g. `aria-label="Main"`, `aria-label="Footer"`).
- **Interactive disclosure** — accordions, dropdowns, modals, and drawers need `aria-expanded`, `aria-controls`, and `aria-hidden` on the appropriate elements.
- **Skip link** — add a `.sr-only` skip link as the first element inside `<body>` that targets `<main>`: `<a href="#main" class="sr-only">Skip to content</a>`, with `id="main"` on `<main>`.
- **Focus management** — modals and drawers should trap focus when open. Tab order should follow visual order.
- **Color contrast** — Linea UI tokens are contrast-checked by default. Only verify custom colors meet WCAG AA (4.5:1 for text, 3:1 for large text).

## Dispatch decision

After analysis, decide whether to use parallel workers or implement directly:

- **4 or more top-level semantic regions** → use coordinator mode (dispatch section workers)
- **3 or fewer regions** → implement directly (single-agent mode, skip to Phase 2)

---

## Coordinator mode (parallel dispatch)

Use this path when the page has 4+ regions.

### 1. Prepare section briefs

Group the regions into up to 3 batches (e.g. "header + navbar", "main content sections", "footer"). For each batch, create a brief file at `.converter-tmp/section-{n}-brief.md` following this structure:

```markdown
# Section Brief: {section_name}

## Region
{description of the semantic region(s) this section covers}

## HTML structure
- Root element: `<{element}>`
- Heading level: `<h{n}>` for the section title (if applicable)

## Linea UI blocks
{list of blocks to use, from your analysis step 3}

## Shared patterns
{decisions that apply across ALL sections — workers must follow these exactly}

## Custom classes
{pre-assigned custom class names for this section — workers use these, don't invent new ones}

## Content
{the actual text, images, and links to preserve from the input}
```

**Critical:** The coordinator decides ALL heading levels, ALL custom class names, and ALL shared pattern choices upfront. Workers execute, they don't decide.

### 2. Dispatch workers

Create the temp directory and dispatch up to 3 `section-worker` agents **in parallel** (all Agent calls in one message):

```bash
mkdir -p .converter-tmp
```

Each agent's prompt must include:
- Brief file path: `.converter-tmp/section-{n}-brief.md`
- HTML output path: `.converter-tmp/section-{n}.html`
- SCSS output path: `.converter-tmp/section-{n}.scss`

### 3. Review fragments

After all workers complete, read each fragment and check:

1. **Heading hierarchy** — scan all HTML fragments in section order for `<h1>`–`<h6>`. Verify no skipped levels, exactly one `<h1>`, and logical nesting. Fix heading levels in the fragments if needed and note any changes in the completion report.

2. **Custom class deduplication** — collect all class names from the SCSS fragments. If two workers defined the same class with different rules, merge or rename.

3. **Pattern consistency** — verify each fragment used the blocks and modifiers specified in its brief. If a worker deviated (used `ln-list` when the brief said `ln-card`), correct the fragment.

4. **HTML validity** — check for unclosed tags, orphaned BEM elements (element class without block parent). Fix in place.

5. **Accessibility** — verify images have `alt`, icon-only buttons have `aria-label`, decorative icons have `aria-hidden="true"`, form controls have labels, and `<nav>` elements have `aria-label` when multiple exist. Fix in place.

6. **Worker failure** — if a fragment file is missing or empty, implement that section yourself using the brief.

### 4. Merge and build

1. **Assemble `index.html`:**
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>{page title from input}</title>
     <link rel="stylesheet" href="assets/styles/styles.css">
   </head>
   <body>
     {section-1.html content}
     {section-2.html content}
     {section-3.html content}
     <script src="assets/scripts/main.js"></script> <!-- only if needed -->
   </body>
   </html>
   ```

2. **Assemble `assets/styles/custom.scss`:** concatenate all SCSS fragments with a section comment between each:
   ```scss
   // --- Section 1: {name} ---
   {section-1.scss content}

   // --- Section 2: {name} ---
   {section-2.scss content}
   ```

3. **Create `assets/styles/styles.scss`:**
   ```scss
   @use '../../node_modules/@collectivetrait/lineaui/scss' as *;
   @use 'custom';
   ```

4. **Compile:** run `npm run compile`. Fix any SCSS errors and retry.

5. **Create JS if needed:** if the input has interactive behavior (dropdowns, modals, tabs, accordions, mobile navigation), create `assets/scripts/main.js`. Workers don't handle JS — this is the coordinator's responsibility.

6. **Clean up:** remove `.converter-tmp/` directory.

Then skip to the Visual comparison step below.

---

## Single-agent mode (direct implementation)

Use this path when the page has 3 or fewer regions, or as fallback for any section a worker failed on.

### 1. Build the HTML

Create `index.html` in the project root with:
- `<!DOCTYPE html>`, `lang` attribute on `<html>`, charset meta, viewport meta
- `<link rel="stylesheet" href="assets/styles/styles.css">` in the head
- A skip link as the first element in `<body>`: `<a href="#main" class="sr-only">Skip to content</a>`
- `id="main"` on the `<main>` element
- Semantic structure following your analysis
- Linea UI classes from `classes.md`
- Accessibility attributes from your analysis step 6 (alt text, aria-labels, aria-expanded, etc.)
- Content preserved from the input
- `<script src="assets/scripts/main.js"></script>` before `</body>` only if interactions are needed

### 2. Write custom SCSS

Create `assets/styles/custom.scss`:
- If custom styles are needed, define them using Linea UI tokens for all values
- If no custom CSS is needed, write the file with a comment explaining why:
  ```scss
  // No custom styles needed — all visual patterns covered by Linea UI classes.
  ```

### 3. Create the import file

Create `assets/styles/styles.scss`:
```scss
@use '../../node_modules/@collectivetrait/lineaui/scss' as *;
@use 'custom';
```

### 4. Compile

Run:
```bash
npm run compile
```

If compilation fails, fix the SCSS errors and retry until it succeeds.

### 5. Create JS if needed

If the input has interactive behavior (dropdowns, modals, tabs, accordions, mobile navigation), create `assets/scripts/main.js` with the minimal JavaScript needed. Use the library's `data-ln-*` attributes and initialization patterns where they exist.

---

## Visual comparison

If browser tools are available, open both the input and `index.html` side by side. Compare:
- Layout structure and alignment
- Typography sizes and weights
- Colors and backgrounds
- Spacing and gaps
- Component appearance

Fix any discrepancies by adjusting classes or custom SCSS in `assets/styles/`, then recompile.

## Score the output

Run the quality scoring pipeline:

```bash
node evals/scoring/score-card.mjs . $ARGUMENTS
```

Read `score-card.json` and review the per-dimension scores. If any dimension scores below 0.7, review the output and fix before reporting:
- **Semantic < 0.7**: check landmark elements and heading hierarchy
- **Coverage < 0.7**: check for utility-only compositions that should use library blocks
- **CSS Ratio < 0.7**: check naming conventions and whether custom CSS duplicates library functionality

After fixing, recompile and re-score until all available dimensions are at 0.7 or above.

## Start the dev server

After all files are written and compiled, start (or restart) the live-reload server:

```bash
# Kill any existing dev server
pkill -f browser-sync 2>/dev/null || true

# Start fresh
npm run dev &
```

Wait a moment for the server to start, then display the link:

**Preview: http://localhost:3000**

If port 3000 is in use, browser-sync will pick the next available port — read its output for the actual URL.

## Completion

Report to the user:
1. What files were created
2. Which mode was used (coordinator with N workers, or single-agent)
3. Which Linea UI blocks were used and why
4. Any custom classes that were added, with brief justification for each
5. Quality scores (per-dimension and overall from score-card.json)
6. Any areas where the library couldn't match the design exactly
7. **Preview: http://localhost:3000** (or the actual URL from the server output)
