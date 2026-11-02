// Output spacing auditor — browser-injectable.
// Flags violations of spacing, styling, and naming rules.
// Run via javascript_tool on the output page.
//
// Returns a JSON report of all issues found.

(function auditSpacing() {
  var issues = [];

  function add(el, rule, detail) {
    var path = [];
    var node = el;
    while (node && node !== document.body) {
      var tag = node.tagName;
      var id = node.id ? '#' + node.id : '';
      var cls = '';
      if (node.className && typeof node.className === 'string') {
        var first = node.className.split(' ')[0];
        if (first) cls = '.' + first;
      }
      path.unshift(tag + id + cls);
      node = node.parentElement;
    }
    issues.push({
      rule: rule,
      path: path.join(' > ').substring(0, 80),
      detail: detail,
    });
  }

  var allEls = document.querySelectorAll('header *, main *, footer *');

  for (var i = 0; i < allEls.length; i++) {
    var el = allEls[i];
    var s = getComputedStyle(el);
    var rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) continue;

    var mb = parseFloat(s.marginBottom) || 0;
    var mt = parseFloat(s.marginTop) || 0;

    // Rule 1: margin-top > 0
    if (mt > 0) {
      add(el, 'no-margin-top', 'margin-top: ' + s.marginTop);
    }

    // Rule 2: margin + gap stacking
    // Walk up ancestors — a margin anywhere inside a flex/grid container
    // with gap creates stacking, not just on direct children
    if (mb > 0) {
      var ancestor = el.parentElement;
      while (ancestor && ancestor !== document.body) {
        var as = getComputedStyle(ancestor);
        var ag = parseFloat(as.gap) || parseFloat(as.rowGap) || 0;
        if (ag > 0 && (as.display === 'flex' || as.display === 'grid' ||
            as.display === 'inline-flex' || as.display === 'inline-grid')) {
          add(el, 'margin-gap-stack',
            'margin-bottom: ' + s.marginBottom + ' inside ' +
            as.display + ' ancestor with gap: ' + as.gap);
          break;
        }
        ancestor = ancestor.parentElement;
      }
    }

    // Rule 3: combined margin-bottom + next sibling padding-top
    if (mb > 0) {
      var next = el.nextElementSibling;
      if (next) {
        var ns = getComputedStyle(next);
        var npt = parseFloat(ns.paddingTop) || 0;
        if (npt > 0) {
          add(el, 'margin-padding-combine',
            'margin-bottom: ' + s.marginBottom +
            ' + next paddingTop: ' + ns.paddingTop);
        }
      }
    }

    // Rule 4: inline styles (not scoped token overrides or JS positioning)
    var inline = el.getAttribute('style');
    if (inline) {
      // Allow: color/background using var(), custom properties (--), left/width/top (JS positioning)
      var parts = inline.split(';').filter(function(p) { return p.trim(); });
      for (var pi = 0; pi < parts.length; pi++) {
        var part = parts[pi].trim();
        if (!part) continue;
        var prop = part.split(':')[0].trim();
        var val = part.split(':').slice(1).join(':').trim();

        // Allow scoped token overrides (value uses var() or property is a custom prop)
        if (prop.startsWith('--')) continue;
        if (val.indexOf('var(') !== -1) continue;

        // Allow JS-positioned properties
        if (/^(left|right|top|bottom|width|transform)$/.test(prop)) continue;

        add(el, 'inline-style',
          'style="' + prop + ': ' + val.substring(0, 40) + '"');
      }
    }
  }

  // Rule 5: px values in the stylesheet (check custom.scss via link)
  // This runs on compiled CSS — look for px on vertical-rhythm properties
  var pxIssues = [];
  var sheets = document.styleSheets;
  for (var si = 0; si < sheets.length; si++) {
    try {
      var rules = sheets[si].cssRules;
      for (var ri = 0; ri < rules.length; ri++) {
        var rule = rules[ri];
        if (!rule.style) continue;
        var sel = rule.selectorText || '';
        // Skip library rules (in @layer)
        if (rule.parentRule && rule.parentRule.type === CSSRule.SUPPORTS_RULE) continue;

        var rhythmProps = ['fontSize', 'lineHeight', 'paddingTop', 'paddingBottom',
                          'marginTop', 'marginBottom', 'height', 'minHeight'];
        for (var rpi = 0; rpi < rhythmProps.length; rpi++) {
          var rp = rhythmProps[rpi];
          var rv = rule.style[rp];
          if (rv && /[1-9]\d*px/.test(rv) && !/calc/.test(rv) && rv !== '0px') {
            pxIssues.push({
              rule: 'px-rhythm',
              path: sel.substring(0, 60),
              detail: rp + ': ' + rv,
            });
          }
        }
      }
    } catch(e) {}
  }

  // Rule 6: short/abbreviated class names
  var customClasses = document.querySelectorAll('[class]');
  var shortSeen = {};
  for (var ci = 0; ci < customClasses.length; ci++) {
    var cn = customClasses[ci].getAttribute('class') || '';
    var classes = cn.split(/\s+/);
    for (var cci = 0; cci < classes.length; cci++) {
      var cls = classes[cci];
      if (!cls || cls.startsWith('ln-') || cls.startsWith('fa-') ||
          cls.startsWith('d-') || cls.startsWith('flex-') ||
          cls.startsWith('justify-') || cls.startsWith('align-') ||
          cls.startsWith('text-') || cls.startsWith('bg-') ||
          cls.startsWith('border-') || cls.startsWith('shadow-') ||
          cls.startsWith('rounded-') || cls.startsWith('position-') ||
          cls.startsWith('overflow-') || cls.startsWith('opacity-') ||
          cls.startsWith('pointer-') || cls.startsWith('float-') ||
          cls.startsWith('sr-') || cls.startsWith('fw-') ||
          cls.startsWith('fs-') || cls.startsWith('font-') ||
          /^[mphwz][tbsexy]?-/.test(cls) || /^-[mphy]/.test(cls) ||
          /^gap-|^row-gap|^col-gap/.test(cls) ||
          /^h[1-6]$/.test(cls) || /^h[1-6]@/.test(cls) ||
          /^lead$/.test(cls) || /^numeric$/.test(cls) ||
          /^show-grid$/.test(cls) || /^grid-toggle$/.test(cls)) continue;

      if (cls.length <= 3 && !shortSeen[cls]) {
        shortSeen[cls] = true;
        issues.push({
          rule: 'short-name',
          path: customClasses[ci].tagName,
          detail: 'class="' + cls + '" — use a semantic name',
        });
      }
    }
  }

  // Combine and deduplicate
  var allIssues = issues.concat(pxIssues);

  // Deduplicate by rule + detail
  var seen = {};
  var deduped = [];
  for (var di = 0; di < allIssues.length; di++) {
    var key = allIssues[di].rule + '|' + allIssues[di].detail;
    if (seen[key]) continue;
    seen[key] = true;
    deduped.push(allIssues[di]);
  }

  return JSON.stringify({
    total: deduped.length,
    byRule: {
      'no-margin-top': deduped.filter(function(i) { return i.rule === 'no-margin-top'; }).length,
      'margin-gap-stack': deduped.filter(function(i) { return i.rule === 'margin-gap-stack'; }).length,
      'margin-padding-combine': deduped.filter(function(i) { return i.rule === 'margin-padding-combine'; }).length,
      'inline-style': deduped.filter(function(i) { return i.rule === 'inline-style'; }).length,
      'px-rhythm': deduped.filter(function(i) { return i.rule === 'px-rhythm'; }).length,
      'short-name': deduped.filter(function(i) { return i.rule === 'short-name'; }).length,
    },
    issues: deduped,
  });
})();
