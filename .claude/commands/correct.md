---
description: Record a correction to the converter's output for future eval runs
argument-hint: Describe what the converter got wrong (e.g. "the hero section should use ln-section, not d-flex")
---

# Record Correction

Record a human correction to the converter's output. This becomes eval data that measures whether the agent improves over time.

## Steps

1. Collect the correction details. If `$ARGUMENTS` describes the issue, extract from it. Otherwise, ask the user:
   - **What was wrong?** (the agent's choice)
   - **What should it have been?** (the correct choice)
   - **Which section of the page?**

2. Determine the **dimension** — which quality aspect does this correct?
   - `semantic` — wrong HTML element, missing landmark, heading issue
   - `coverage` — wrong block choice, utility-only when a block exists, orphaned BEM
   - `css_ratio` — unnecessary custom CSS, naming convention violation
   - `visual` — visual mismatch with the input design

3. Determine the **severity**:
   - `critical` — fundamentally wrong (wrong semantic element, completely wrong block)
   - `important` — suboptimal choice that noticeably affects quality
   - `minor` — polish issue, slightly better alternative exists

4. Generate the correction record:

```bash
node -e "
  const id = crypto.randomUUID();
  const record = {
    id,
    timestamp: new Date().toISOString(),
    run_id: 'manual',
    input: '<input file path>',
    section: '<section name>',
    dimension: '<semantic|coverage|css_ratio|visual>',
    severity: '<critical|important|minor>',
    agent_choice: '<what the converter produced>',
    correct_choice: '<what it should have produced>',
    notes: '<additional context>'
  };
  require('fs').writeFileSync(
    'evals/corrections/' + id + '.json',
    JSON.stringify(record, null, 2)
  );
  console.log('Saved:', 'evals/corrections/' + id + '.json');
"
```

Fill in the values from the user's feedback. Use the actual `input` file path from the conversion run if known.

5. Confirm to the user what was saved and which dimension/severity it was filed under.
