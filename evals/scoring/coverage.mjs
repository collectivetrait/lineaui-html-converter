import { readFileSync } from 'node:fs';

const KNOWN_UTILITIES = new Set([
  'd-none', 'd-inline', 'd-inline-block', 'd-block', 'd-flex', 'd-inline-flex', 'd-grid', 'd-inline-grid', 'd-contents',
  'flex-row', 'flex-column', 'flex-row-reverse', 'flex-column-reverse',
  'flex-wrap', 'flex-nowrap', 'flex-fill', 'flex-grow-0', 'flex-grow-1', 'flex-shrink-0', 'flex-shrink-1',
  'justify-content-start', 'justify-content-center', 'justify-content-end', 'justify-content-between',
  'align-items-start', 'align-items-center', 'align-items-end', 'align-items-baseline', 'align-items-stretch',
  'text-start', 'text-center', 'text-end', 'text-nowrap',
  'fw-normal', 'fw-medium', 'fw-semibold', 'fw-bold',
  'position-relative', 'position-absolute', 'position-fixed', 'position-sticky',
  'overflow-auto', 'overflow-hidden',
  'sr-only', 'pointer-none', 'pointer-auto',
]);

const UTILITY_PATTERN = /^(mt|mb|ms|me|mx|my|pt|pb|ps|pe|px|py|gap|row-gap|col-gap|mw|mh|float|opacity|shadow|rounded|border|bg|text|font|fs|fw|h[1-6])-|^[mphwz]-\d|^-[mphy]/;

const CARD_LIKE_UTILITIES = new Set(['d-flex', 'p-3', 'border', 'rounded-sm']);
const CARD_LIKE_THRESHOLD = 3;

export async function scoreCoverage(htmlPath) {
  const html = readFileSync(htmlPath, 'utf-8');

  const classAttrs = [...html.matchAll(/class="([^"]*)"/gi)];
  const elements = classAttrs.map(m => ({
    classes: m[1].split(/\s+/).filter(Boolean),
    raw: m[0],
  }));

  const lnBlocks = new Set();
  const customClasses = new Set();
  const utilityOnlyCompositions = [];
  const orphanedBemElements = [];

  for (const el of elements) {
    for (const cls of el.classes) {
      if (/^ln-[a-z]/.test(cls) && !cls.includes('__')) {
        const blockName = cls.replace(/--.*/, '');
        lnBlocks.add(blockName);
      } else if (!isUtility(cls) && !cls.startsWith('ln-')) {
        customClasses.add(cls);
      }
    }

    const utils = el.classes.filter(c => isUtility(c));
    const hasLnBlock = el.classes.some(c => /^ln-[a-z]/.test(c));
    if (!hasLnBlock && utils.length >= CARD_LIKE_THRESHOLD) {
      const cardLikeCount = utils.filter(u => CARD_LIKE_UTILITIES.has(u)).length;
      if (cardLikeCount >= CARD_LIKE_THRESHOLD) {
        utilityOnlyCompositions.push(
          `Element with [${utils.join(', ')}] could be ln-card`
        );
      }
    }
  }

  for (const el of elements) {
    for (const cls of el.classes) {
      if (cls.includes('__') && cls.startsWith('ln-')) {
        const blockName = cls.split('__')[0].replace(/--.*/, '');
        const blockInHtml = new RegExp(`class="[^"]*\\b${blockName}\\b[^"]*"`, 'i').test(html);
        if (!blockInHtml) {
          orphanedBemElements.push(cls);
        }
      }
    }
  }

  const lnBlockCount = lnBlocks.size;
  const customClassCount = customClasses.size;
  const total = lnBlockCount + customClassCount;
  const ratio = total === 0 ? 1.0 : parseFloat((lnBlockCount / total).toFixed(2));

  let overall = ratio;
  if (utilityOnlyCompositions.length > 0) overall = Math.max(0, overall - 0.1 * utilityOnlyCompositions.length);
  if (orphanedBemElements.length > 0) overall = Math.max(0, overall - 0.1 * orphanedBemElements.length);
  overall = parseFloat(overall.toFixed(2));

  return {
    dimension: 'coverage',
    lnBlockCount,
    customClassCount,
    utilityOnlyCompositions,
    orphanedBemElements,
    ratio,
    overall,
  };
}

function isUtility(cls) {
  if (KNOWN_UTILITIES.has(cls)) return true;
  if (UTILITY_PATTERN.test(cls)) return true;
  return false;
}
