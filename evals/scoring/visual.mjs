export async function scoreVisual(inputPath, outputHtmlPath, { browserAvailable = false } = {}) {
  if (browserAvailable) {
    return {
      dimension: 'visual',
      method: 'chrome',
      notes: `Compare ${inputPath} against ${outputHtmlPath} in the browser. Rate structural similarity, color accuracy, typography, and spacing on a 0–1 scale.`,
      overall: null,
    };
  }

  return {
    dimension: 'visual',
    method: 'skipped',
    notes: 'No browser tools available — visual fidelity not scored. Open both files in a browser to compare manually.',
    overall: null,
  };
}
