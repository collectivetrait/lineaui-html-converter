import { test } from 'node:test';
import assert from 'node:assert';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { scoreCssRatio } from './css-ratio.mjs';

let counter = 0;
function makeTmp() {
  const dir = join(import.meta.dirname, `.test-tmp-css-${++counter}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

test('counts custom SCSS lines', async () => {
  const tmp = makeTmp();
  const scss = join(tmp, 'custom.scss');
  const html = join(tmp, 'index.html');
  writeFileSync(scss, `.hero {
  background: var(--primary-subtle);
  padding: var(--s4);
}

.feature__icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--r-md);
}
`);
  writeFileSync(html, '<div>1</div><div>2</div><div>3</div><div>4</div><div>5</div>');
  const result = await scoreCssRatio(scss, html);
  assert.strictEqual(result.customLines, 9);
  rmSync(tmp, { recursive: true, force: true });
});

test('handles comment-only file', async () => {
  const tmp = makeTmp();
  const scss = join(tmp, 'custom.scss');
  const html = join(tmp, 'index.html');
  writeFileSync(scss, '// No custom styles needed.\n');
  writeFileSync(html, '<div>Simple</div>');
  const result = await scoreCssRatio(scss, html);
  assert.strictEqual(result.customLines, 0);
  assert.strictEqual(result.zeroCustom, true);
  assert.ok(result.overall > 0);
  rmSync(tmp, { recursive: true, force: true });
});

test('detects naming issues', async () => {
  const tmp = makeTmp();
  const scss = join(tmp, 'custom.scss');
  const html = join(tmp, 'index.html');
  writeFileSync(scss, `.myComponent {
  color: red;
}
.AnotherBad {
  margin: 0;
}
`);
  writeFileSync(html, '<div>Content</div>');
  const result = await scoreCssRatio(scss, html);
  assert.ok(result.namingIssues.length > 0);
  rmSync(tmp, { recursive: true, force: true });
});

test('computes lines per element ratio', async () => {
  const tmp = makeTmp();
  const scss = join(tmp, 'custom.scss');
  const html = join(tmp, 'index.html');
  writeFileSync(scss, `.a { color: red; }
.b { color: blue; }
.c { margin: 0; }
.d { padding: 0; }
`);
  writeFileSync(html, '<div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>10</div>');
  const result = await scoreCssRatio(scss, html);
  assert.strictEqual(result.linesPerElement, 0.4);
  rmSync(tmp, { recursive: true, force: true });
});
