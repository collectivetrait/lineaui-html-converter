# Linea UI HTML Converter

An AI-powered tool that converts visual HTML mockups into pixel-perfect implementations using the [Linea UI](https://github.com/collectivetrait/lineaui) CSS library. It analyzes a design, maps visual patterns to the correct library components, and produces semantic HTML with proper class usage and minimal custom CSS.

This tool runs inside [Claude Code](https://docs.anthropic.com/en/docs/claude-code) as a set of slash commands and agent definitions.

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

The converter will analyze the design, map components to Linea UI blocks, and produce:

- `index.html` — semantic HTML with Linea UI classes
- `assets/styles/custom.scss` — custom styles for anything the library can't cover
- `assets/styles/styles.scss` — imports the library and custom styles
- `assets/styles/styles.css` — compiled stylesheet (generated, do not edit)
- `assets/scripts/main.js` — interactive behavior (only when needed)

Open `index.html` in a browser to see the result.

## How it works

The converter follows a two-phase workflow:

**Phase 1 — Analysis.** The agent reads the [Linea UI Reference](https://www.npmjs.com/package/@collectivetrait/lineaui-reference) files, studies the input design, decomposes it into semantic regions, and maps each visual element to the best library block following a strict decision hierarchy: semantics first, then block match, then modifiers, then utilities, then custom CSS as a last resort.

**Phase 2 — Implementation.** The agent builds the HTML with correct landmark elements and heading hierarchy, writes any necessary custom SCSS using library tokens, compiles everything into a single stylesheet, and scores the output.

For larger pages (4+ sections), the converter dispatches up to three parallel worker agents — each implementing a section of the page — then reviews and merges their output for cross-section consistency.

## Commands

| Command | Description |
|---------|-------------|
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

- **Fixtures** — add test cases to `evals/fixtures/`. Each fixture is a directory with an `input.html` file and optionally a `baseline-scores.json` for regression detection.

- **Regression runs** — use `/eval` to run the converter on all fixtures, score the output, and compare against baselines. Regressions are flagged when a dimension drops more than 0.05 from the baseline.

## Project structure

```
lineaui-html-converter/
  index.html              # Generated: the converted page
  assets/
    styles/               # Generated: SCSS source and compiled CSS
    scripts/              # Generated: JS for interactions
  input/                  # Place input mockups here
  evals/
    scoring/              # Quality scoring scripts (Node.js)
    corrections/          # Human feedback records (JSON)
    fixtures/             # Test cases for regression runs
  .claude/
    commands/             # Slash commands (/convert, /score, /correct, /eval)
    agents/               # Agent definitions (section-worker)
    templates/            # Section brief template for multi-agent mode
  CLAUDE.md               # Agent instructions and project conventions
  package.json
```

## Running tests

```bash
node --test evals/scoring/*.test.mjs
```

## License

MIT
