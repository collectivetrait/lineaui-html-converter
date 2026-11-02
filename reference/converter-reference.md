# Converter Reference

Cascade layers: `external, reset, tokens, base, layout, blocks, helpers, utilities`. Utilities always win. Prefix `ln-` on layout and block classes only. Responsive suffixes `@sm`(576) `@md`(768) `@lg`(1024) `@xl`(1280) `@2xl`(1536) on classes marked [R].

## Tokens

### Spacing

`--s{N}` = N × 8px. `--s3` = 24px = one baseline line.

| Token | rem | px |
|-------|-----|----|
| `--s-h` | 0.25 | 4 |
| `--s1` | 0.5 | 8 |
| `--s2` | 1 | 16 |
| `--s3` | 1.5 | 24 |
| `--s4` | 2 | 32 |
| `--s5` | 2.5 | 40 |
| `--s6` | 3 | 48 |
| `--s7` | 3.5 | 56 |
| `--s8` | 4 | 64 |

### Typography scale

Each token expands to `--t-{name}-s` (font-size) and `--t-{name}-lh` (line-height).

| Token | Font | Size | Line-height |
|-------|------|------|-------------|
| `--t-display-1` | prose | 80px | 96px |
| `--t-display-2` | prose | 56px | 72px |
| `--t-h1` | prose | 40px | 48px |
| `--t-h2` | prose | 32px | 48px |
| `--t-h3` | prose | 20px | 24px |
| `--t-h4` | ui | 18px | 24px |
| `--t-h5` | ui | 16px | 24px |
| `--t-h6` | mono | 12px | 16px |
| `--t-lead` | prose | 18px | 24px |
| `--t-body` | ui | 16px | 24px |
| `--t-body-sm` | ui | 14px | 24px |
| `--t-body-xs` | ui | 12px | 16px |
| `--t-meta` | mono | 12px | 16px |

### Font stacks

| Token | Role |
|-------|------|
| `--f-prose` | Headings h1–h3, editorial, blockquotes (default: serif) |
| `--f-ui` | Body, labels, interface, h4–h5 (default: sans-serif) |
| `--f-mono` | Code, kbd, meta, h6 (default: monospace) |

### Colors

**Surfaces:** `--canvas` (page bg), `--surface` (card bg), `--surface-raised` (hover/dropdown), `--surface-sunken` (inputs), `--surface-inverse` (inverted), `--overlay` (backdrop)
**Text:** `--text` (primary), `--c-muted` (secondary), `--c-subtle` (tertiary), `--c-disabled`, `--c-inverse`
**Borders:** `--border` (default), `--border-control` (forms), `--border-strong` (emphasis)
**Links:** `--link` (from primary-text), `--link-hover`, `--focus` (from primary), `--selection`
**Intents:** `--primary`, `--secondary`, `--success`, `--warning`, `--danger`, `--info`. Sub-tokens: `--{intent}` (fill), `--{intent}-text` (text on light bg), `--on-{intent}` (text on filled bg), `--{intent}-subtle` (tinted bg), `--{intent}-hover` (hover fill), `--{intent}-border` (border accent).

### Border radii

| Token | px |
|-------|----|
| `--r-none` | 0 | `--r-xs` | 2 | `--r-sm` | 4 | `--r-md` | 8 | `--r-lg` | 12 | `--r-xl` | 16 | `--r-pill` | 624.9375 | `--r-circle` | 50% |

### Motion

| Token | Value |
|-------|-------|
| `--dur-fast` | 120ms |
| `--dur-base` | 200ms |
| `--dur-slow` | 320ms |
| `--e-standard` | cubic-bezier(0.4, 0, 0.2, 1) |
| `--e-enter` | cubic-bezier(0, 0, 0.2, 1) |
| `--e-exit` | cubic-bezier(0.4, 0, 1, 1) |

### Layout

| Token | Default | Purpose |
|-------|---------|---------|
| `--container` | 56.25rem (900px) | Content max-width |
| `--container-wide` | 75rem (1200px) | Wide layout max-width |
| `--measure` | 37.5rem (~70ch) | Prose measure |
| `--gutter` | 1rem / 2rem at md+ | Inline container padding |

### Breakpoints

`@sm` 576px, `@md` 768px, `@lg` 1024px, `@xl` 1280px, `@2xl` 1536px

### Theme

`data-theme="light"` or `data-theme="dark"` on any element to force theme.

---

## Layout Blocks

### ln-container
Centered max-width wrapper. Default 900px, gutter 1rem (2rem at md+).
**Modifiers:** `--narrow` (measure), `--wide` (1200px), `--full` (none), `--flush` (no padding)

### ln-grid
CSS grid. Default gap 24px.
**Elements:** `__item--span-{1-12}` [R], `__item--span-full` [R], `__item--start-{1-12}` [R], `__item--subgrid`
**Modifiers:** `--cols-{1-6}` [R], `--cols-12` [R], `--auto`, `--gap-0`, `--gap-xs` (8), `--gap-sm` (16), `--gap-md` (24), `--gap-lg` (32)

### ln-cluster
Flex row with wrap. Default gap 8px, align-items center.
**Modifiers:** `--gap-xs`/`--gap-sm`/`--gap-md`, `--justify-start`/`center`/`end`/`between` [R], `--align-start`/`center`/`baseline`/`end` [R], `--nowrap` [R]

### ln-section
Full-width band. Padding-block 32px.
**Elements:** `__inner` (centered, max-width container, gutter), `__header` (mb 32px), `__eyebrow` (uppercase meta mono), `__title` (h2 font), `__lead` (lead font prose)
**Modifiers:** `--narrow` (measure), `--wide` (container-wide), `--space-lg` (48px), `--space-xl` (72px), `--space-2xl` (96px), `--space-3xl` (144px), `--surface-sunken`/`raised`/`inverse`, `--center`

---

## Content Blocks

### ln-card
Contained surface. Flex column, surface bg, outline border, rounded.
**Elements:** `__media` (full-bleed), `__media-object` (width 100%), `__header` (bottom border), `__eyebrow` (uppercase meta), `__title` (h5 font), `__subtitle` (body-sm muted), `__body`, `__footer` (mt auto), `__actions` (flex gap), `__link` (stretched)
**Modifiers:** `--flat`, `--shadow-{1-4}`, `--interactive`, `--horizontal`, `--pad-sm`(16)/`md`(24)/`lg`(32), `--subtle`, `--{intent}`
**State:** `[aria-selected="true"]` / `:has(:checked)`

### ln-accordion
Collapsible panels using `<details>`.
**Elements:** `__item` (bottom border), `__summary` (flex, padding, cursor pointer), `__title` (h5 font 600), `__icon` (rotates on open), `__content` (padding, body-sm)
**Modifiers:** `--flush` (no borders), `--sm`

### ln-stat
Key metric. 24px padding, surface bg, outline border, rounded.
**Elements:** `__icon` (40px square rounded sunken), `__label` (body-sm 500 muted), `__value` (32px/40px 600 tabular-nums), `__unit` (body 400 muted), `__delta` (body-sm 500 tabular-nums), `__delta--positive`/`--negative`, `__meta` (meta subtle)
**Modifiers:** `--sm`, `--lg`, `--flat`, `--inline`

### ln-table
Data table. Overflow-x auto, radius, surface bg.
**Elements:** `__grid` (table, collapse, w100%), `__header` (th body-sm 600 muted), `__header--numeric`, `__cell` (td body-sm), `__cell--numeric`/`--mono`/`--truncate`/`--nowrap`, `__row`, `__row--danger`/`warning`/`success`, `__foot`, `__caption`, `__actions`, `__sort`, `__select`, `__empty`
**Modifiers:** `--divided`, `--striped`, `--bordered`, `--compact`, `--spacious`, `--sticky-header`, `--sticky-first`, `--stack`

---

## Component Blocks

### ln-navbar
Top navigation. Relative, z 100.
**Elements:** `__inner` (flex, container, gutter, 48px height), `__brand` (flex-shrink 0, 600), `__nav` (flex gap), `__item`, `__link` (flex body-sm muted hover text), `__actions` (flex gap ml-auto), `__toggle` (hidden on desktop), `__toggle-open`/`__toggle-close`, `__panel` (hidden desktop, flex column mobile), `__keep`, `__mega`, `__mega-toggle`, `__megamenu`, `__megamenu-inner`, `__megamenu-link`
**Modifiers:** `--sticky`, `--transparent`, `--center`, `--collapse`, `--actions-visible`, `--{intent}`
**State:** `.is-stuck`

### ln-button
Inline-flex, center, 40px height, gap 8px, radius, 500 body-sm.
**Elements:** `__label`, `__icon` (16px), `__spinner`, `__badge` (ml auto)
**Modifiers:** `--solid`, `--neutral`, `--subtle`, `--outline`, `--ghost`, `--link`, `--sm`(32px)[R], `--lg`(48px)[R], `--block`[R], `--icon`, `--pill`, `--square`, `--rounded-sm`/`md`/`lg`/`xl`, `--{intent}`

### ln-price
Inline-flex, center, 8px gap, ui font, tabular-nums.
**Elements:** `__current` (h4 600), `__original` (body-sm muted line-through), `__discount` (body-sm 600 danger-text), `__currency` (body-sm 500), `__period` (meta muted)
**Modifiers:** `--sale`, `--range`, `--stacked`, `--sm`, `--lg`, `--xl`

### ln-badge
Inline-block, 24px height, pill radius, 12px/24px, 500, subtle bg.
**Elements:** `__dot`, `__icon` (12px)
**Modifiers:** `--solid`, `--outline`, `--sm` (16px), `--pill`, `--count`, `--{intent}`

### ln-site-footer
Body-sm ui, muted.
**Elements:** `__inner` (container padding), `__brand` (mb), `__columns` (auto-fit grid gap), `__column`, `__heading` (600 text), `__links` (flex column gap), `__link` (muted hover text), `__description` (body-sm), `__social` (flex gap), `__bottom` (border-top flex), `__legal` (body-sm subtle)
**Modifiers:** `--compact`, `--center`, `--inverse`

### ln-tabs
Tabbed panels.
**Elements:** `__list` (flex gap bottom-border), `__tab` (flex gap padding body-sm muted), `__icon` (16px), `__badge` (ml auto), `__panel` (padding-top)
**Modifiers:** `--pills`, `--boxed`, `--vertical`, `--fill`, `--sm`, `--{intent}`
**State:** `[aria-selected="true"]` on `__tab`

---

## Utilities

All utilities are [R] responsive unless noted.

### Display [R]
`.d-none`, `.d-inline`, `.d-inline-block`, `.d-block`, `.d-flex`, `.d-inline-flex`, `.d-grid`, `.d-inline-grid`, `.d-contents`

### Flex [R]
**Direction:** `.flex-row`, `.flex-column`, `.flex-row-reverse`, `.flex-column-reverse`
**Wrap:** `.flex-wrap`, `.flex-nowrap`, `.flex-wrap-reverse`
**Sizing (not R):** `.flex-fill` (1 1 auto), `.flex-grow-0`/`1`, `.flex-shrink-0`/`1`

### Justify content [R]
`.justify-content-start`/`center`/`end`/`between`/`around`/`evenly`

### Align items [R]
`.align-items-start`/`center`/`end`/`baseline`/`stretch`

### Align self [R]
`.align-self-start`/`center`/`end`/`baseline`/`stretch`/`auto`

### Spacing [R]
Pattern: `.{prefix}{value}` — value: `0`, `half`(4), `1`(8)–`8`(64), `auto` (margin only).

| Prefix | Property |
|--------|----------|
| `m-`/`mt-`/`mb-`/`ms-`/`me-`/`mx-`/`my-` | margin |
| `p-`/`pt-`/`pb-`/`ps-`/`pe-`/`px-`/`py-` | padding |
| `gap-`/`row-gap-`/`col-gap-` | gap |

Negative margins: `.-m-{1px|1-8}`, `.-mx-{…}`, `.-my-{…}` [R]

### Sizing
`.w-{25|50|75|100|auto}` [R], `.w-measure`/`.w-contained`/`.w-wide` [R], `.h-{25|50|75|100|auto}`, `.mw-100`, `.mh-100`

### Typography — Headings [R]

| Class | Font | Size | LH | Weight | Extra |
|-------|------|------|----|--------|-------|
| `.h1` | prose | 40px | 48px | 400 | ls: -0.01em |
| `.h2` | prose | 32px | 48px | 400 | ls: -0.005em |
| `.h3` | prose | 20px | 24px | 400 | |
| `.h4` | ui | 18px | 24px | 600 | |
| `.h5` | ui | 16px | 24px | 600 | |
| `.h6` | mono | 12px | 16px | 500 | uppercase, 0.08em, muted |

### Typography — Display/Body [R]

| Class | Font | Size | LH |
|-------|------|------|----|
| `.text-display-1` | prose | 80px | 96px |
| `.text-display-2` | prose | 56px | 72px |
| `.text-body-lg` | inherit | 18px | 24px |
| `.text-body-sm` | inherit | 14px | 24px |
| `.text-body-xs` | inherit | 12px | 16px |
| `.text-meta` | mono | 12px | 16px |

### Typography — Weight/Style/Family [R]
`.fw-normal`(400), `.fw-medium`(500), `.fw-semibold`(600), `.fw-bold`(700)
`.fs-normal`, `.fs-italic`
`.font-prose`, `.font-ui`, `.font-mono`

### Text [R for alignment]
**Align:** `.text-start`, `.text-center`, `.text-end`
**Wrap (not R):** `.text-wrap`, `.text-nowrap`, `.text-balance`, `.text-pretty`
**Decoration (not R):** `.text-decoration-none`/`underline`/`line-through`
**Color (not R):** `.text-primary`/`secondary`/`success`/`warning`/`danger`/`info`/`muted`/`subtle`/`inverse`

### Background (not R)
`.bg-primary`/`primary-subtle`/`secondary`/`secondary-subtle`/`success`/`success-subtle`/`warning`/`warning-subtle`/`danger`/`danger-subtle`/`info`/`info-subtle`/`canvas`/`surface`/`surface-raised`/`surface-sunken`/`surface-inverse`/`transparent`

### Borders
**Outline (not R):** `.border` (1px), `.border-0`, `.border-2`, `.border-3`, `.border-default`/`-2`/`-3`
**Shadow [R]:** `.border-sh`/`-t`/`-b`/`-s`/`-e`/`-x`/`-y`/`-0`/`-t-0`/`-b-0`/`-s-0`/`-e-0`
**Native [R]:** `.border-n`/`-t`/`-b`/`-s`/`-e`/`-x`/`-y`
**Radius (not R):** `.rounded-none`(0)/`xs`(2)/`sm`(4)/`md`(8)/`lg`(12)/`xl`(16)/`pill`/`circle`

### Shadows (not R)
`.shadow-0`/`1`/`2`/`3`/`4`, `.shadow-inset-1`/`2`/`3`/`4`

### Other (not R)
**Position:** `.position-static`/`relative`/`absolute`/`fixed`/`sticky`
**Z-index:** `.z-0`/`10`/`20`/`30`/`40`/`50`/`auto`
**Float [R]:** `.float-start`/`end`/`none`
**Overflow:** `.overflow-auto`/`hidden`/`visible`/`scroll`, `.overflow-x-*`, `.overflow-y-*`
**Accessibility:** `.sr-only`

---

## Decision Rules

### Borders

| | Outline `.border` | Shadow `.border-sh` | Native `.border-n` |
|---|---|---|---|
| Per-side | No | Yes | Yes |
| Rhythm-safe | Yes | Yes | No |
| Respects radius | Yes | No | Yes |
| Works with `.shadow-*` | Yes | No | Yes |
| Responsive | No | Yes | Yes |

### Spacing
- **8px grid**: horizontal spacing, padding, component dimensions snap to 8px multiples
- **24px line grid**: line-heights, vertical margins, section spacing are 24px multiples
- **`--s-h` (4px)**: only for inline component internals (badge padding, tag gap)
- Use block modifiers over utility spacing when available
- **Component heights**: small=32px, default=40px, large=48px

### Layout
- Known column count → `ln-grid --cols-{n}` [R]. Responsive: `--cols-1 --cols-3@md`
- Auto-fit → `ln-grid--auto`, override `--grid-min`
- Inline group → `ln-cluster`
- One-off flex → utilities: `d-flex`, `justify-content-*`, `gap-*`
- Container: `ln-container` (900px), `--wide` (1200px), `--narrow` (70ch)
- Full-width band → `ln-section` with `__inner`. `--surface-*` for bg

### Typography
- Semantic `<h1>`–`<h6>` gets base styles + margin automatically
- Visual override → `.h1`–`.h6` utilities (no margin)
- Hero → `.text-display-1` (80px) or `.text-display-2` (56px)
- Intro paragraph → `.lead` (prose 18px/24px)
- Responsive size → combine: `.h4 .h2@md`
- Font roles: prose=h1–h3/editorial, ui=body/labels/h4–h5, mono=code/h6/meta

### Components vs. utilities
- Block modifier > utility class when both could work
- Utilities for one-off adjustments outside blocks
- Utilities always win by cascade layer order

### Responsive
- Mobile-first: base=mobile, add `@{bp}` for wider
- Block: `ln-button--sm ln-button--lg@md`
- Utility: `d-none d-block@md`
- Common: hide=`d-none d-block@md`, stack-to-row=`flex-column flex-row@md`, 1-to-3-col=`--cols-1 --cols-3@md`

### Vertical rhythm
- Line-heights: multiples of 24px (12px tokens use 16px)
- Spacing tokens maintain grid: `--s3`=24px=1 line, `--s6`=48px=2 lines
- Outline/shadow borders preserve rhythm; native borders break it
- Component heights: 32/40/48px (8px grid)

### Composition (common patterns)
- Dashboard → `ln-grid` > `ln-stat` + `ln-table` with toolbar
- Navigation → `ln-navbar` (may contain `ln-dropdown` for sub-menus)
- Footer → `ln-site-footer` with `__columns` for link groups
