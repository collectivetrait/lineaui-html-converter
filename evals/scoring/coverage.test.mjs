import { test } from 'node:test';
import assert from 'node:assert';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { scoreCoverage } from './coverage.mjs';

let counter = 0;
function makeTmp() {
  const dir = join(import.meta.dirname, `.test-tmp-cov-${++counter}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

function tmpFile(tmp, name, content) {
  const path = join(tmp, name);
  writeFileSync(path, content);
  return path;
}

test('counts ln- block classes', async () => {
  const tmp = makeTmp();
  const html = tmpFile(tmp, 'blocks.html', `
    <div class="ln-card"><div class="ln-card__body">Card</div></div>
    <button class="ln-button">Click</button>
    <nav class="ln-navbar"><div class="ln-navbar__inner">Nav</div></nav>
  `);
  const result = await scoreCoverage(html);
  assert.strictEqual(result.lnBlockCount, 3);
  rmSync(tmp, { recursive: true, force: true });
});

test('counts custom classes', async () => {
  const tmp = makeTmp();
  const html = tmpFile(tmp, 'custom.html', `
    <div class="hero__backdrop">Hero</div>
    <div class="feature-grid__icon">Icon</div>
    <div class="ln-card">Card</div>
  `);
  const result = await scoreCoverage(html);
  assert.strictEqual(result.customClassCount, 2);
  rmSync(tmp, { recursive: true, force: true });
});

test('detects utility-only card pattern', async () => {
  const tmp = makeTmp();
  const html = tmpFile(tmp, 'util-card.html', `
    <div class="d-flex flex-column p-3 border rounded-sm">
      <h3>Title</h3>
      <p>Content</p>
    </div>
  `);
  const result = await scoreCoverage(html);
  assert.ok(result.utilityOnlyCompositions.length > 0);
  assert.ok(result.utilityOnlyCompositions[0].includes('ln-card'));
  rmSync(tmp, { recursive: true, force: true });
});

test('detects orphaned BEM elements', async () => {
  const tmp = makeTmp();
  const html = tmpFile(tmp, 'orphan.html', `
    <div>
      <div class="ln-card__title">Title without card parent</div>
    </div>
  `);
  const result = await scoreCoverage(html);
  assert.ok(result.orphanedBemElements.includes('ln-card__title'));
  rmSync(tmp, { recursive: true, force: true });
});

test('ratio favors high ln- usage', async () => {
  const tmp = makeTmp();
  const html = tmpFile(tmp, 'good-ratio.html', `
    <div class="ln-card"><div class="ln-card__body">1</div></div>
    <div class="ln-card"><div class="ln-card__body">2</div></div>
    <div class="ln-card"><div class="ln-card__body">3</div></div>
    <button class="ln-button">Click</button>
    <nav class="ln-navbar">Nav</nav>
    <div class="hero__custom">Custom</div>
  `);
  const result = await scoreCoverage(html);
  assert.ok(result.ratio > 0.7);
  rmSync(tmp, { recursive: true, force: true });
});
