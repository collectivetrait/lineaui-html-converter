import { readFileSync } from 'node:fs';

const EXPECTED_LANDMARKS = ['header', 'main', 'footer', 'nav'];
const ACTION_WORDS = /\b(delete|remove|close|cancel|submit|save|edit|toggle|dismiss)\b/i;

export async function scoreSemantics(htmlPath) {
  const html = readFileSync(htmlPath, 'utf-8');

  const landmarks = scoreLandmarks(html);
  const headings = scoreHeadings(html);
  const interactiveElements = scoreInteractive(html);
  const images = scoreImages(html);

  const subScores = [landmarks.score, headings.score, interactiveElements.score, images.score];
  const overall = parseFloat((subScores.reduce((a, b) => a + b, 0) / subScores.length).toFixed(2));

  return {
    dimension: 'semantic',
    landmarks,
    headings,
    interactiveElements,
    images,
    overall,
  };
}

function scoreLandmarks(html) {
  const found = [];
  const missing = [];

  for (const tag of EXPECTED_LANDMARKS) {
    if (new RegExp(`<${tag}[\\s>]`, 'i').test(html)) {
      found.push(tag);
    } else {
      missing.push(tag);
    }
  }

  const score = found.length / EXPECTED_LANDMARKS.length;
  return { found, missing, score };
}

function scoreHeadings(html) {
  const matches = [...html.matchAll(/<h([1-6])[^>]*>/gi)];
  const levels = matches.map(m => parseInt(m[1]));
  const hierarchy = matches.map(m => `h${m[1]}`);

  let skipped = false;
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] > levels[i - 1] + 1) {
      skipped = true;
      break;
    }
  }

  const multipleH1 = levels.filter(l => l === 1).length > 1;

  let score = 1.0;
  if (skipped) score -= 0.4;
  if (multipleH1) score -= 0.3;
  if (levels.length === 0) score -= 0.1;
  score = Math.max(0, score);

  return { hierarchy, skipped, multipleH1, score };
}

function scoreInteractive(html) {
  const issues = [];

  const anchorMatches = [...html.matchAll(/<a\s[^>]*href=["']#["'][^>]*>(.*?)<\/a>/gi)];
  for (const match of anchorMatches) {
    const text = match[1].replace(/<[^>]*>/g, '').trim();
    if (ACTION_WORDS.test(text)) {
      issues.push(`<a href="#"> with action text "${text}" should be a <button>`);
    }
  }

  const score = issues.length === 0 ? 1.0 : Math.max(0, 1.0 - issues.length * 0.2);
  return { issues, score };
}

function scoreImages(html) {
  const allImgs = [...html.matchAll(/<img\s[^>]*>/gi)];
  const total = allImgs.length;
  let missingAlt = 0;

  for (const img of allImgs) {
    if (!/\balt\s*=/i.test(img[0])) {
      missingAlt++;
    }
  }

  const score = total === 0 ? 1.0 : parseFloat(((total - missingAlt) / total).toFixed(2));
  return { total, missingAlt, score };
}
