#!/usr/bin/env node

import { writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { scoreSemantics } from './semantic.mjs';
import { scoreCoverage } from './coverage.mjs';
import { scoreCssRatio } from './css-ratio.mjs';
import { scoreVisual } from './visual.mjs';

export async function generateScoreCard(inputPath, outputDir, options = {}) {
  const htmlPath = join(outputDir, 'index.html');
  const scssPath = join(outputDir, 'assets', 'styles', 'custom.scss');

  const semantic = await scoreSemantics(htmlPath);
  const coverage = await scoreCoverage(htmlPath);

  let cssRatio;
  if (existsSync(scssPath)) {
    cssRatio = await scoreCssRatio(scssPath, htmlPath);
  } else {
    cssRatio = {
      dimension: 'css_ratio',
      customLines: 0,
      htmlElements: 0,
      linesPerElement: 0,
      namingIssues: [],
      zeroCustom: true,
      overall: 0.8,
    };
  }

  const visual = await scoreVisual(inputPath, htmlPath, options);

  const scores = { semantic, coverage, css_ratio: cssRatio, visual };

  const numerics = [semantic.overall, coverage.overall, cssRatio.overall]
    .concat(visual.overall !== null ? [visual.overall] : []);
  const overall = numerics.length > 0
    ? parseFloat((numerics.reduce((a, b) => a + b, 0) / numerics.length).toFixed(2))
    : null;

  const card = {
    timestamp: new Date().toISOString(),
    input: inputPath,
    scores,
    overall,
  };

  const outPath = join(outputDir, 'score-card.json');
  writeFileSync(outPath, JSON.stringify(card, null, 2));

  return card;
}

const isMain = process.argv[1] && import.meta.url === new URL(`file://${resolve(process.argv[1])}`).href;
if (isMain) {
  const outputDir = process.argv[2] || '.';
  const inputPath = process.argv[3] || 'input/source.html';

  generateScoreCard(inputPath, outputDir).then(card => {
    console.log('\n=== Score Card ===');
    console.log(`Semantic:    ${card.scores.semantic.overall}`);
    console.log(`Coverage:    ${card.scores.coverage.overall}`);
    console.log(`CSS Ratio:   ${card.scores.css_ratio.overall}`);
    console.log(`Visual:      ${card.scores.visual.overall ?? card.scores.visual.method}`);
    console.log(`Overall:     ${card.overall}`);

    const low = Object.values(card.scores).filter(s => s.overall !== null && s.overall < 0.7);
    if (low.length > 0) {
      console.log(`\n⚠ Dimensions below 0.7: ${low.map(s => s.dimension).join(', ')}`);
    }
  }).catch(err => {
    console.error(err.message);
    process.exit(1);
  });
}
