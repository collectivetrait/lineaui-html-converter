import { readFileSync } from 'node:fs';

const BEM_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z][a-z0-9]*(-[a-z0-9]+)*)?(--[a-z][a-z0-9]*(-[a-z0-9]+)*)?$/;
const UTILITY_PATTERN = /^[a-z][a-z0-9-]*$/;

export async function scoreCssRatio(scssPath, htmlPath) {
  const scss = readFileSync(scssPath, 'utf-8');
  const html = readFileSync(htmlPath, 'utf-8');

  const lines = scss.split('\n');
  const customLines = lines.filter(line => {
    const trimmed = line.trim();
    return trimmed.length > 0 && !trimmed.startsWith('//') && !trimmed.startsWith('/*') && !trimmed.startsWith('*');
  }).length;

  const htmlElements = [...html.matchAll(/<[a-z][a-z0-9]*[\s>]/gi)].length;

  const linesPerElement = htmlElements === 0 ? 0 : parseFloat((customLines / htmlElements).toFixed(2));

  const classNames = [...scss.matchAll(/\.([a-zA-Z][a-zA-Z0-9_-]*)\s*[{,]/g)].map(m => m[1]);
  const namingIssues = [];
  for (const name of classNames) {
    if (!BEM_PATTERN.test(name) && !UTILITY_PATTERN.test(name)) {
      namingIssues.push(`"${name}" does not follow BEM or utility naming conventions`);
    }
  }

  const zeroCustom = customLines === 0;

  let overall = 1.0;
  if (namingIssues.length > 0) overall -= 0.1 * namingIssues.length;
  if (linesPerElement > 1.0) overall -= 0.2;
  if (zeroCustom) overall = 0.8;
  overall = parseFloat(Math.max(0, Math.min(1, overall)).toFixed(2));

  return {
    dimension: 'css_ratio',
    customLines,
    htmlElements,
    linesPerElement,
    namingIssues,
    zeroCustom,
    overall,
  };
}
