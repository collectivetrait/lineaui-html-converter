# Linea UI HTML Converter

An AI-powered tool that converts visual HTML mockups into pixel-perfect implementations using the [Linea UI](https://github.com/collectivetrait/lineaui) CSS library. It analyzes a design, maps visual patterns to the correct library components, and produces semantic HTML with proper class usage and minimal custom CSS.

This tool runs inside [Claude Code](https://docs.anthropic.com/en/docs/claude-code) as a set of slash commands.

## Related projects

- [Linea UI](https://github.com/collectivetrait/lineaui) — the CSS component library
- [Linea UI Docs](https://lineaui.com) — documentation site for human reference
- [Linea UI Reference](https://www.npmjs.com/package/@collectivetrait/lineaui-reference) — machine-readable API reference for agents

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or later
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI or desktop app

### Installation

```bash
git clone https://github.com/collectivetrait/lineaui-html-converter.git
cd lineaui-html-converter
npm install
```

### Convert a design

1. Place your HTML mockup in the `input/` directory.

2. Open the project in Claude Code:

   ```bash
   claude
   ```

3. Run the convert command:

   ```
   /convert input/your-mockup.html
   ```

The converter will analyze the design, map components to Linea UI blocks, and produce output in the `output/` directory:

- `output/source-map.json` — structured JSON map describing every section in natural language
- `output/index.html` — semantic HTML with Linea UI classes
- `output/assets/styles/custom.scss` — custom styles for anything the library can't cover
- `output/assets/styles/styles.scss` — imports the library and custom styles
- `output/assets/styles/styles.css` — compiled stylesheet (generated, do not edit)
- `output/assets/scripts/main.js` — interactive behavior (only when needed)

### Creating mockups

You can also generate the input mockup itself with `/mockup`:

```
/mockup A pricing page for a developer tools SaaS
```

The command designs a UI mockup following Linea UI's vertical rhythm (8px grid, 24px text grid) and block vocabulary (navbar, cards, stats, tables, etc.), without loading the library's CSS. It asks about direction (palette, fonts, feel), then builds the design.

**Where mockups go:**

- **Claude Design canvas** (preferred) — if the session supports artifacts, the mockup is published as editable artboards on a Claude Design canvas with a shareable link. You can keep editing the design on claude.ai before converting it. To convert a canvas mockup, export its raw HTML and save it to `input/` manually — the converter reads local files, not canvas links.
- **HTML files** (fallback) — if no canvas can be published, the mockup is written as a self-contained `.html` file directly to `input/`, ready for `/convert`. You can also pass `--out` to write to a different folder.

**The mockup-to-conversion pipeline:**

1. `/mockup` designs a raw HTML mockup
2. If it went to a canvas: export the HTML and save it to `input/`
3. `/convert input/your-mockup.html` converts it to a Linea UI implementation in `output/`

### Previewing the result

Start the dev server for live-reload previewing:

```bash
npm run dev
```

This watches SCSS for changes and serves the `output/` directory with automatic browser refresh. You can also run the pieces individually:

| Script | Description |
|--------|-------------|
| `npm run compile` | Compile SCSS to CSS (one-shot) |
| `npm run watch` | Watch SCSS and recompile on changes |
| `npm run serve` | Start a live-reload HTTP server serving `output/` |
| `npm run dev` | Run watch + serve together |

## How it works

The converter follows an eight-phase pipeline:

1. **Setup** — read the library reference files (`reference/converter-reference.md`, skeleton, gap overrides) and the input design.
2. **Source mapping** — produce a structured JSON map (`output/source-map.json`) that describes every section of the page in natural language — visual appearance, text content, library block assignments, border/shadow/radius treatment, typography details. This map drives all subsequent phases.
3. **Build skeleton** — write the HTML shell (head, navbar, empty main, footer) and base SCSS (token overrides, shared surface resets, gap overrides).
4. **Build sections** — for each content section in the map, dispatch a sequential fork that inherits the full conversation context. Each fork writes an HTML fragment and SCSS fragment following a strict decision hierarchy: semantics first, then block match, then modifiers, then utilities, then custom CSS as a last resort.
5. **Map review** — an independent agent audits the assembled output against the source map, checking verbatim text, IDs, borders, typography, icons, spacing, SVGs, layout, colors, and link decoration.
6. **Visual comparison** — a fork opens both the source and output in Chrome and compares computed styles across all regions using `getComputedStyle`.
7. **Score** — run the four-dimension quality scorer.
8. **Spacing audit** — verify spacing matches the source via automated checks.

## Commands

| Command | Description |
|---------|-------------|
| `/mockup <brief>` | Design a UI mockup following Linea UI's principles |
| `/convert <path>` | Convert an HTML mockup to a Linea UI implementation |
| `/score` | Run quality scoring on the current output |
| `/correct <description>` | Record a correction for future eval runs |
| `/eval` | Run the converter on all fixtures and check for regressions |

## Quality scoring

After each conversion, the tool scores the output across four dimensions:

| Dimension | What it measures |
|-----------|-----------------|
| **Semantic** | Correct landmarks, heading hierarchy, form labels, alt text, interactive element tags |
| **Coverage** | Percentage of components using library blocks vs. custom classes, anti-pattern detection |
| **CSS ratio** | Amount of custom CSS relative to HTML complexity, naming convention compliance |
| **Visual** | Visual similarity to the input design (requires browser tools) |

Run `/score` to see the score card at any time.

## Eval framework

The eval system supports feedback-driven improvement:

- **Corrections** — use `/correct` to record what the converter got wrong. Each correction is a JSON file in `evals/corrections/` that becomes part of the eval data.

- **Fixtures** — add test cases to `evals/fixtures/`. Each fixture is a directory with an `input.html` file and optionally a `baseline-scores.json` for regression detection. Three fixtures are included: `simple-page`, `full-page`, and `malformed`.

- **Regression runs** — use `/eval` to run the converter on all fixtures, score the output, and compare against baselines. Regressions are flagged when a dimension drops more than 0.05 from the baseline.

## Project structure

```
lineaui-html-converter/
  output/                 # Generated conversion output
    index.html
    source-map.json
    assets/
      styles/
      scripts/
  input/                  # Place input mockups here
  reference/              # Library reference templates
    converter-reference.md
    skeleton.html
    _gap-overrides.scss
  evals/
    scoring/              # Quality scoring scripts (Node.js)
    corrections/          # Human feedback records (JSON)
    fixtures/             # Test cases for regression runs
      simple-page/
      full-page/
      malformed/
  .claude/
    commands/             # Slash commands (/mockup, /convert, /score, /correct, /eval)
  CLAUDE.md               # Agent instructions and project conventions
  package.json
```

## Running tests

```bash
node --test evals/scoring/*.test.mjs
```

## License

MIT
