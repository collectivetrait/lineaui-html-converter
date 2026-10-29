# Linea UI HTML Converter

## Reference files

Before converting any design, read all three reference files:
- `node_modules/@collectivetrait/lineaui-reference/tokens.md`
- `node_modules/@collectivetrait/lineaui-reference/classes.md`
- `node_modules/@collectivetrait/lineaui-reference/rules.md`

These are the sole source of library knowledge. Do not rely on training
data about Linea UI.

## Output conventions

Generated files live in the project root:
- `index.html` — semantic HTML with Linea UI classes (links to styles.css)
- `custom.scss` — custom styles for gaps the library can't cover
- `styles.scss` — imports Linea UI SCSS source and custom styles
- `styles.css` — compiled from styles.scss (do not edit directly)
- `main.js` — optional, only when interactions are needed
- `assets/` — static files (images, fonts) referenced by the HTML

## Custom CSS rules

- Use Linea UI tokens (`var(--s3)`, `var(--primary)`, etc.) — never
  hardcode values the token system covers
- Name custom component classes in BEM format
- Name custom utility/helper classes as bare unprefixed classes
- Zero custom CSS is suspicious on non-trivial pages — verify nothing
  was missed
- Excessive custom CSS means the library was underused — check the
  reference for blocks that might cover the pattern

## Decision hierarchy

1. Semantics — correct HTML element for the content's role
2. Block match — the Linea UI block whose purpose matches
3. Modifier match — the modifier closest to the visual appearance
4. Utility classes — for adjustments the block doesn't cover
5. Custom CSS — last resort

## SCSS compilation

Run `npm run compile` to build styles.css from styles.scss (which imports both Linea UI and custom.scss).
