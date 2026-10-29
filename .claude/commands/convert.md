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

## Phase 2: Implementation

### 1. Build the HTML

Create `index.html` in the project root with:
- `<!DOCTYPE html>`, charset meta, viewport meta
- `<link rel="stylesheet" href="node_modules/@collectivetrait/lineaui/dist/styles.css">` in the head (library styles)
- `<link rel="stylesheet" href="styles.css">` in the head (custom styles, loaded second so they can override)
- Semantic structure following your analysis
- Linea UI classes from `classes.md`
- Content preserved from the input
- `<script src="main.js"></script>` before `</body>` only if interactions are needed

### 2. Write custom SCSS

Create `custom.scss` in the project root:
- If custom styles are needed, define them using Linea UI tokens for all values
- If no custom CSS is needed, write the file with a comment explaining why:
  ```scss
  // No custom styles needed — all visual patterns covered by Linea UI classes.
  ```

### 3. Compile

Run:
```bash
npm run compile
```

If compilation fails, fix the SCSS errors and retry until it succeeds.

### 4. Create JS if needed

If the input has interactive behavior (dropdowns, modals, tabs, accordions, mobile navigation), create `main.js` in the project root with the minimal JavaScript needed. Use the library's `data-ln-*` attributes and initialization patterns where they exist.

### 5. Visual comparison

If browser tools are available, open both the input and `index.html` side by side. Compare:
- Layout structure and alignment
- Typography sizes and weights
- Colors and backgrounds
- Spacing and gaps
- Component appearance

Fix any discrepancies by adjusting classes or custom SCSS, then recompile.

## Completion

Report to the user:
1. What files were created
2. Which Linea UI blocks were used and why
3. Any custom classes that were added, with brief justification for each
4. Any areas where the library couldn't match the design exactly
5. How to view the result: open `index.html` in a browser
