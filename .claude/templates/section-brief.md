# Section Brief: {section_name}

## Region

{description of the semantic region(s) this section covers — what it looks like visually and what role it serves on the page}

## HTML structure

- Root element: `<{element}>` (e.g. `<header>`, `<section>`, `<footer>`)
- Heading level: `<h{n}>` for the section title (if applicable)
- Landmark role: {any ARIA landmark if not implicit from the element}

## Linea UI blocks

{list of blocks to use with brief rationale — the worker uses these, not alternatives}

- `ln-navbar` — navigation bar with links and CTA
- `ln-button--solid ln-button--primary` — primary call-to-action

## Shared patterns

{decisions that apply across ALL sections — every worker must follow these exactly}

- Section spacing: `ln-section--space-xl`
- Card style: `ln-card--flat` with `__title` and `__body` only
- Button style: `ln-button--solid ln-button--primary` for primary CTAs

## Custom classes

{pre-assigned custom class names for this section — workers use ONLY these names}

- `.hero__gradient` — background gradient treatment (use `var(--primary-subtle)`)
- `.feature-grid__icon` — icon container (use `var(--r-md)` for radius)

## Content

{the actual text, images, links, and data to preserve from the input — copied verbatim}

### Heading

Build something great

### Body text

A simple platform for teams that want to move fast without breaking things.

### Links / buttons

- CTA: "Get started" → href="#"

### Images

- Hero image: https://example.com/hero.jpg (alt: "Platform overview")
