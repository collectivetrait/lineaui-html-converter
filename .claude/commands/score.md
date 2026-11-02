---
description: Run quality scoring on the current converter output
argument-hint: (none — scores output/index.html and output/assets/styles/custom.scss)
---

# Score Converter Output

Run the four-dimension quality scoring pipeline on the current output.

## Steps

1. Verify `output/index.html` exists. If not, tell the user to run `/convert` first.

2. Run the scoring pipeline:

```bash
node evals/scoring/score-card.mjs output input/source.html
```

If the input file path is different, adjust the second argument. If the user provides the input path as $ARGUMENTS, use that.

3. Read `output/score-card.json`.

4. Present results as a table:

| Dimension | Score | Status |
|-----------|-------|--------|
| Semantic | 0.XX | OK / Needs attention |
| Coverage | 0.XX | OK / Needs attention |
| CSS Ratio | 0.XX | OK / Needs attention |
| Visual | 0.XX or skipped | OK / Skipped |
| **Overall** | **0.XX** | |

Mark any dimension below 0.7 as "Needs attention" and explain what the low score means:
- **Semantic < 0.7**: Missing landmark elements or heading hierarchy issues
- **Coverage < 0.7**: Too many custom classes or utility-only compositions where library blocks exist
- **CSS Ratio < 0.7**: Naming convention violations or excessive custom CSS relative to HTML complexity
- **Visual**: Only scored when browser tools are available

5. If visual fidelity was skipped, note: "Visual fidelity was not scored — open both the input and output/index.html in a browser to compare manually."
