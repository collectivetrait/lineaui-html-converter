import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

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
    const hasLnBlock = el.classes.some(c => /^ln-[a-z]/.test(c));
    for (const cls of el.classes) {
      if (/^ln-[a-z]/.test(cls) && !cls.includes('__')) {
        const blockName = cls.replace(/--.*/, '');
        lnBlocks.add(blockName);
      } else if (!isUtility(cls) && !cls.startsWith('ln-') && !hasLnBlock) {
        // Only count custom classes on elements WITHOUT a library block.
        // Custom classes alongside library blocks are extensions, not replacements.
        // Group BEM elements/modifiers under their block name.
        const blockName = cls.split('__')[0].split('--')[0];
        customClasses.add(blockName);
      }
    }

    const utils = el.classes.filter(c => isUtility(c));
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

  // Check custom SCSS for selectors that replicate utilities/helpers.
  const utilityLikeSelectors = [];
  const scssPath = join(dirname(htmlPath), 'assets', 'styles', 'custom.scss');
  if (existsSync(scssPath)) {
    const scss = readFileSync(scssPath, 'utf-8');
    // Parse simple rule blocks: .selector { prop: value; }
    // Match top-level selectors (not nested, not inside @media)
    const ruleRe = /^(\.[a-z][a-z0-9-]*)\s*\{([^}]*)\}/gm;
    const UTILITY_PROPS = {
      'display: flex': 'd-flex',
      'display: grid': 'd-grid',
      'display: block': 'd-block',
      'display: none': 'd-none',
      'display: inline-flex': 'd-inline-flex',
      'display: inline-block': 'd-inline-block',
      'overflow-x: auto': 'overflow-x-auto',
      'overflow-x: hidden': 'overflow-x-hidden',
      'text-align: center': 'text-center',
      'text-align: end': 'text-end',
      'flex-direction: column': 'flex-column',
      'flex-wrap: wrap': 'flex-wrap',
      'position: relative': 'position-relative',
      'position: absolute': 'position-absolute',
      'font-weight: 700': 'fw-bold',
      'font-weight: 600': 'fw-semibold',
      'font-weight: 500': 'fw-medium',
      'font-weight: 400': 'fw-normal',
    };
    // Also match margin/padding resets like margin-bottom: 0
    const SPACING_RESET_RE = /^(margin|padding)(-top|-bottom|-left|-right)?: (0|var\(--s[0-8h]\))/;

    let match;
    while ((match = ruleRe.exec(scss)) !== null) {
      const selector = match[1];
      const body = match[2];
      // Skip selectors that target library blocks (overrides are expected)
      if (selector.startsWith('.ln-')) continue;

      const declarations = body.split(';')
        .map(d => d.trim())
        .filter(d => d && !d.startsWith('//') && !d.startsWith('&'));

      // Only flag if the rule has 1-2 declarations, all of which are utility-replaceable
      if (declarations.length > 0 && declarations.length <= 2) {
        const replaceable = declarations.filter(d => {
          for (const [prop, util] of Object.entries(UTILITY_PROPS)) {
            if (d.startsWith(prop)) return true;
          }
          if (SPACING_RESET_RE.test(d)) return true;
          return false;
        });

        if (replaceable.length === declarations.length) {
          const utils = replaceable.map(d => {
            for (const [prop, util] of Object.entries(UTILITY_PROPS)) {
              if (d.startsWith(prop)) return util;
            }
            return d.split(':')[0].trim().replace(/^(margin|padding)/, (m) => m === 'margin' ? 'm' : 'p') + '-0';
          });
          utilityLikeSelectors.push(
            `${selector} { ${declarations.join('; ')} } → use ${utils.join(' + ')}`
          );
        }
      }
    }
  }

  // Count inline styles in the HTML. Scoped token overrides and JS runtime
  // values are acceptable, but mass inline styles mean the conversion dumped
  // the source's styles verbatim instead of moving them to SCSS/utilities.
  const inlineStyleCount = (html.match(/\sstyle="/gi) || []).length;

  const lnBlockCount = lnBlocks.size;
  const customClassCount = customClasses.size;

  // Coverage starts at 1.0 and deducts for problems:
  // - Each utility-only composition that should be a library block: -0.1
  // - Each orphaned BEM element (element class without block parent): -0.1
  // - Each custom selector that replicates a utility/helper: -0.05
  // - No library blocks used at all on a non-trivial page: -0.5
  // - Skewed custom-to-library ratio on non-trivial pages: up to -0.6
  // - Excessive inline styles (beyond 10 allowed): -0.01 each, max -0.2
  let overall = 1.0;
  if (utilityOnlyCompositions.length > 0) overall -= 0.1 * utilityOnlyCompositions.length;
  if (orphanedBemElements.length > 0) overall -= 0.1 * orphanedBemElements.length;
  if (utilityLikeSelectors.length > 0) overall -= 0.05 * utilityLikeSelectors.length;
  if (lnBlockCount === 0 && customClassCount > 0) overall -= 0.5;

  // Inline styles: allow 10 (scoped token overrides, JS runtime values,
  // SVG presentation attributes). Beyond that, each one costs -0.01,
  // capped at -0.2. 129 inline styles is a conversion that didn't move
  // the source's styles to SCSS.
  const excessInlineStyles = Math.max(0, inlineStyleCount - 10);
  if (excessInlineStyles > 0) {
    overall -= Math.min(0.2, excessInlineStyles * 0.01);
  }

  const ratio = (lnBlockCount + customClassCount) === 0
    ? 1.0
    : parseFloat((lnBlockCount / (lnBlockCount + customClassCount)).toFixed(2));

  // Penalize skewed ratio on non-trivial pages (8+ total class groups).
  // A page with many custom classes and few library blocks is underusing
  // the library. The penalty scales linearly: ratio 0.25+ is acceptable
  // (no penalty), ratio 0.0 on a non-trivial page costs the full -0.6.
  //
  // Examples at current settings:
  //   ratio 0.26 (pricing page, 7 blocks / 20 custom) → no penalty
  //   ratio 0.15 → penalty ≈ 0.24
  //   ratio 0.05 (2 blocks / 40 custom)              → penalty ≈ 0.48
  //   ratio 0.00                                      → penalty = 0.60
  const totalClasses = lnBlockCount + customClassCount;
  if (totalClasses >= 8 && ratio < 0.25) {
    const ratioPenalty = (0.25 - ratio) / 0.25 * 0.6;
    overall -= parseFloat(ratioPenalty.toFixed(2));
  }

  overall = parseFloat(Math.max(0, overall).toFixed(2));

  return {
    dimension: 'coverage',
    lnBlockCount,
    customClassCount,
    inlineStyleCount,
    utilityOnlyCompositions,
    orphanedBemElements,
    utilityLikeSelectors,
    ratio,
    overall,
  };
}

function isUtility(cls) {
  // Strip responsive suffix (@sm, @md, @lg, @xl, @2xl) before matching
  const base = cls.replace(/@\w+$/, '');

  if (KNOWN_UTILITIES.has(base)) return true;
  if (UTILITY_PATTERN.test(base)) return true;

  // Heading utilities: h1–h6 standalone (no trailing dash)
  if (/^h[1-6]$/.test(base)) return true;

  // Base classes: lead, numeric
  if (base === 'lead' || base === 'numeric') return true;

  // External library classes (Font Awesome)
  if (/^fa-/.test(cls)) return true;

  // Overflow utilities
  if (/^overflow-(x|y)-(auto|hidden|visible|scroll)$/.test(base)) return true;

  return false;
}
