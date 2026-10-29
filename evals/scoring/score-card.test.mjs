import { test } from 'node:test';
import assert from 'node:assert';
import { writeFileSync, readFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { generateScoreCard } from './score-card.mjs';

let counter = 0;
function makeTmp() {
  const dir = join(import.meta.dirname, `.test-tmp-sc-${++counter}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

function writeInDir(dir, name, content) {
  writeFileSync(join(dir, name), content);
}

test('assembles all four dimensions', async () => {
  const tmp = makeTmp();
  writeInDir(tmp, 'index.html', `<!DOCTYPE html><html><body>
    <header><nav>Nav</nav></header>
    <main><h1>Title</h1><div class="ln-card">Card</div></main>
    <footer>Footer</footer>
  </body></html>`);
  writeInDir(tmp, 'custom.scss', '.hero { color: var(--primary); }');

  const card = await generateScoreCard('input/test.html', tmp);
  assert.ok(card.scores.semantic);
  assert.ok(card.scores.coverage);
  assert.ok(card.scores.css_ratio);
  assert.ok(card.scores.visual);
  assert.strictEqual(card.scores.semantic.dimension, 'semantic');
  assert.strictEqual(card.scores.coverage.dimension, 'coverage');
  assert.strictEqual(card.scores.css_ratio.dimension, 'css_ratio');
  assert.strictEqual(card.scores.visual.dimension, 'visual');
  rmSync(tmp, { recursive: true, force: true });
});

test('computes overall from non-null scores', async () => {
  const tmp = makeTmp();
  writeInDir(tmp, 'index.html', `<!DOCTYPE html><html><body>
    <header><nav>Nav</nav></header>
    <main><h1>Title</h1></main>
    <footer>Footer</footer>
  </body></html>`);
  writeInDir(tmp, 'custom.scss', '// No custom styles.');

  const card = await generateScoreCard('input/test.html', tmp);
  assert.strictEqual(card.scores.visual.overall, null);
  assert.strictEqual(typeof card.overall, 'number');
  const expected = (card.scores.semantic.overall + card.scores.coverage.overall + card.scores.css_ratio.overall) / 3;
  assert.strictEqual(card.overall, parseFloat(expected.toFixed(2)));
  rmSync(tmp, { recursive: true, force: true });
});

test('writes score card to file', async () => {
  const tmp = makeTmp();
  writeInDir(tmp, 'index.html', '<main><h1>Test</h1></main>');
  writeInDir(tmp, 'custom.scss', '// empty');

  await generateScoreCard('input/test.html', tmp);
  const cardPath = join(tmp, 'score-card.json');
  assert.ok(existsSync(cardPath));
  const parsed = JSON.parse(readFileSync(cardPath, 'utf-8'));
  assert.ok(parsed.timestamp);
  assert.strictEqual(parsed.input, 'input/test.html');
  rmSync(tmp, { recursive: true, force: true });
});

test('handles missing custom.scss', async () => {
  const tmp = makeTmp();
  writeInDir(tmp, 'index.html', '<main><h1>Test</h1></main>');

  const card = await generateScoreCard('input/test.html', tmp);
  assert.strictEqual(card.scores.css_ratio.customLines, 0);
  assert.strictEqual(card.scores.css_ratio.zeroCustom, true);
  rmSync(tmp, { recursive: true, force: true });
});
