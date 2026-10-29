---
description: Run the converter on all fixture inputs and compare scores against baselines
argument-hint: (none — runs all fixtures in evals/fixtures/)
---

# Run Eval Suite

Run the converter on each fixture input, score the output, and compare against baseline scores to detect regressions.

## Steps

1. List all directories in `evals/fixtures/`. Each directory is a test case containing:
   - `input.html` — the input design to convert
   - `baseline-scores.json` (optional) — the baseline scores from a previous run

```bash
ls evals/fixtures/
```

If no fixtures exist, tell the user to add fixtures (each is a directory with an `input.html` file).

2. For each fixture directory:

### a. Convert

Run `/convert` on the fixture's input:

```
/convert evals/fixtures/{name}/input.html
```

This produces `index.html`, `custom.scss`, `styles.scss`, `styles.css` in the project root.

### b. Score

Run the scoring pipeline:

```bash
node evals/scoring/score-card.mjs . evals/fixtures/{name}/input.html
```

### c. Compare against baseline

Read `score-card.json` from the project root.

If `evals/fixtures/{name}/baseline-scores.json` exists:
- Compare each dimension's `overall` score against the baseline
- A **regression** is when the new score is more than 0.05 below the baseline
- Record: fixture name, dimension, baseline score, new score, delta

If no baseline exists:
- Copy `score-card.json` to `evals/fixtures/{name}/baseline-scores.json`
- Record: fixture name, "new baseline created"

### d. Clean up

Move the generated output files aside or note them for the next fixture.

3. Report a summary table:

| Fixture | Semantic | Coverage | CSS Ratio | Visual | Status |
|---------|----------|----------|-----------|--------|--------|
| simple-page | 0.95 | 0.88 | 0.90 | skipped | PASS |
| complex-page | 0.80 ↓ | 0.92 | 0.85 | skipped | REGRESSED |

- **PASS**: no dimension regressed more than 0.05 from baseline
- **REGRESSED**: at least one dimension dropped > 0.05
- **NEW**: baseline was just created (no comparison possible)

4. If any fixture regressed, list each regression with:
   - Fixture name
   - Dimension that regressed
   - Baseline score → new score (delta)
   - Recommendation: check the output for that fixture and either fix the skill/reference or update the baseline if the change is intentional

5. If all fixtures pass, report success. Suggest running `/correct` on any output that looks wrong despite passing scores.
