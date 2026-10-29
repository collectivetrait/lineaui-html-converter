import { test } from 'node:test';
import assert from 'node:assert';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { scoreSemantics } from './semantic.mjs';

const TMP = join(import.meta.dirname, '.test-tmp');

function setup() {
  mkdirSync(TMP, { recursive: true });
}

function teardown() {
  rmSync(TMP, { recursive: true, force: true });
}

function writeHtml(name, body) {
  const path = join(TMP, name);
  writeFileSync(path, `<!DOCTYPE html><html><head></head><body>${body}</body></html>`);
  return path;
}

test('scores landmarks — all present', async () => {
  setup();
  const path = writeHtml('landmarks.html', `
    <header><nav>Nav</nav></header>
    <main><section><h2>Content</h2></section></main>
    <footer>Footer</footer>
  `);
  const result = await scoreSemantics(path);
  assert.strictEqual(result.dimension, 'semantic');
  assert.deepStrictEqual(result.landmarks.missing, []);
  assert.strictEqual(result.landmarks.score, 1.0);
  teardown();
});

test('detects missing landmarks — divs only', async () => {
  setup();
  const path = writeHtml('no-landmarks.html', `
    <div>Header</div>
    <div>Content</div>
    <div>Footer</div>
  `);
  const result = await scoreSemantics(path);
  assert.ok(result.landmarks.missing.includes('main'));
  assert.ok(result.landmarks.score < 1.0);
  teardown();
});

test('detects heading hierarchy — skipped level', async () => {
  setup();
  const path = writeHtml('skip-heading.html', `
    <main>
      <h1>Title</h1>
      <h3>Subsection</h3>
    </main>
  `);
  const result = await scoreSemantics(path);
  assert.strictEqual(result.headings.skipped, true);
  assert.ok(result.headings.score < 1.0);
  teardown();
});

test('detects multiple h1', async () => {
  setup();
  const path = writeHtml('multi-h1.html', `
    <main>
      <h1>First</h1>
      <h1>Second</h1>
    </main>
  `);
  const result = await scoreSemantics(path);
  assert.strictEqual(result.headings.multipleH1, true);
  teardown();
});

test('detects missing alt text', async () => {
  setup();
  const path = writeHtml('no-alt.html', `
    <main>
      <img src="photo.jpg">
      <img src="logo.png" alt="Logo">
    </main>
  `);
  const result = await scoreSemantics(path);
  assert.strictEqual(result.images.total, 2);
  assert.strictEqual(result.images.missingAlt, 1);
  teardown();
});

test('detects anchor used as button', async () => {
  setup();
  const path = writeHtml('anchor-button.html', `
    <main>
      <a href="#">Delete</a>
      <a href="/about">About</a>
    </main>
  `);
  const result = await scoreSemantics(path);
  assert.ok(result.interactiveElements.issues.length > 0);
  teardown();
});

test('overall is average of sub-scores', async () => {
  setup();
  const path = writeHtml('full.html', `
    <header><nav>Nav</nav></header>
    <main><h1>Title</h1><p>Text</p></main>
    <footer>Footer</footer>
  `);
  const result = await scoreSemantics(path);
  const expected = (
    result.landmarks.score +
    result.headings.score +
    result.interactiveElements.score +
    result.images.score
  ) / 4;
  assert.strictEqual(result.overall, parseFloat(expected.toFixed(2)));
  teardown();
});
