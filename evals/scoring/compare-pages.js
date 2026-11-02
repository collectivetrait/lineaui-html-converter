// Compare ALL computed properties of every identifiable element between output and source.
// No curated property list — checks every property getComputedStyle returns.
//
// Usage on the output tab:
//   const code = await fetch('/evals/scoring/compare-pages.js').then(r=>r.text());
//   await eval(code)('http://localhost:3001/input/index.html')

(function compare(sourceUrl) {
  // Properties to skip: browser-internal, always-different, or not visually relevant
  var SKIP = new Set([
    'animation-composition','animation-delay','animation-direction','animation-duration',
    'animation-fill-mode','animation-iteration-count','animation-name','animation-play-state',
    'animation-timing-function','animation-range-end','animation-range-start','animation-timeline',
    'transition-delay','transition-duration','transition-property','transition-timing-function',
    'transition-behavior',
    'perspective-origin','transform-origin',
    'will-change','contain','container-type','container-name',
    'scroll-behavior','scroll-margin','scroll-padding',
    '-webkit-locale','-webkit-text-size-adjust',
    'writing-mode','direction','unicode-bidi',
    'pointer-events','cursor','user-select','-webkit-user-select',
    'touch-action','resize',
    'appearance','-webkit-appearance',
    'isolation','mix-blend-mode',
    'object-position','background-position','background-repeat','background-attachment',
    'background-origin','background-clip','background-size',
    'border-image-outset','border-image-repeat','border-image-slice','border-image-source','border-image-width',
    'outline-offset',
    'tab-size','text-indent','text-shadow','text-overflow','word-spacing','word-break',
    'widows','orphans',
    'backface-visibility','border-collapse','border-spacing','caption-side','empty-cells',
    'list-style-image','list-style-position','list-style-type',
    'table-layout','vertical-align','visibility',
    'content','counter-increment','counter-reset',
    'page-break-after','page-break-before','page-break-inside',
    'break-after','break-before','break-inside',
    'column-count','column-gap','column-rule','column-span','column-width',
    'filter','backdrop-filter','clip-path','mask',
    'paint-order','fill','stroke','marker',
    'dominant-baseline','text-anchor',
    'font-optical-sizing','font-synthesis','font-synthesis-small-caps','font-synthesis-style','font-synthesis-weight',
    'font-feature-settings','font-variation-settings','font-kerning',
    'font-palette','font-size-adjust','font-stretch',
    '-webkit-font-smoothing','-webkit-text-stroke-width','-webkit-text-stroke-color',
    'text-rendering','text-decoration-style','text-decoration-color','text-decoration-thickness',
    'text-underline-offset','text-underline-position',
    'color-scheme','color-interpolation','color-interpolation-filters',
    'forced-color-adjust','accent-color','caret-color',
    'image-rendering','shape-rendering',
    'overflow-anchor','overflow-wrap','overscroll-behavior',
    'scroll-snap-type','scroll-snap-align',
    '-webkit-line-clamp','-webkit-box-orient',
    'math-depth','math-style',
    'r','rx','ry','cx','cy','x','y','d',
    'vector-effect','stop-color','stop-opacity','flood-color','flood-opacity','lighting-color',
    'baseline-source','alignment-baseline',
    'text-wrap','text-wrap-mode','text-wrap-style',
    'white-space-collapse',
    'ruby-position',
    'field-sizing',
    'interpolate-size',
    'overlay',
    'position-anchor','position-area','position-try','position-try-fallbacks','position-try-order','position-visibility',
    'inset-area',
    'view-timeline','view-transition-class','view-transition-name',
    'timeline-scope',
    'rotate','scale','translate',
  ]);

  function identify(el) {
    if (el.id) return '#' + el.id;
    var tag = el.tagName.toLowerCase();
    if (/^h[1-6]$/.test(tag)) return tag + ':' + (el.textContent || '').trim().substring(0, 50);
    if (tag === 'section') {
      if (el.getAttribute('aria-label')) return 'section[aria-label="' + el.getAttribute('aria-label') + '"]';
      if (el.getAttribute('aria-labelledby')) return 'section[aria-labelledby="' + el.getAttribute('aria-labelledby') + '"]';
      if (el.id) return 'section#' + el.id;
    }
    if (tag === 'nav' || tag === 'header' || tag === 'footer' || tag === 'main') return tag;
    if (tag === 'a' || tag === 'button') {
      var txt = (el.textContent || '').trim().substring(0, 30);
      if (txt) return tag + ':' + txt;
    }
    if (tag === 'figure' && el.getAttribute('aria-label')) return 'figure[' + el.getAttribute('aria-label').substring(0, 30) + ']';
    if (el.getAttribute('role') === 'note') return '[role=note]';
    if (el.getAttribute('role') === 'tablist') return 'tablist:' + (el.getAttribute('aria-label') || '');
    if (el.getAttribute('role') === 'table') return 'table:' + (el.getAttribute('aria-label') || '');
    if (el.getAttribute('role') === 'img') return 'img:' + (el.getAttribute('aria-label') || el.id || '');
    return null;
  }

  function collect(doc) {
    var map = {};
    var els = doc.querySelectorAll('*');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var key = identify(el);
      if (!key) continue;
      if (map[key]) continue;
      var tag = el.tagName.toLowerCase();
      if (tag === 'script' || tag === 'style') continue;
      var s = getComputedStyle(el);
      var data = {};
      for (var j = 0; j < s.length; j++) {
        var prop = s[j];
        if (SKIP.has(prop)) continue;
        data[prop] = s.getPropertyValue(prop).substring(0, 80);
      }
      map[key] = data;
    }
    return map;
  }

  var outputMap = collect(document);

  return new Promise(function(resolve) {
    var iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:0;left:0;width:' + window.innerWidth + 'px;height:' + window.innerHeight + 'px;opacity:0;pointer-events:none;z-index:-1';
    document.body.appendChild(iframe);
    iframe.onload = function() {
      try {
        var sourceMap = collect(iframe.contentDocument);
        document.body.removeChild(iframe);

        var mismatches = [];
        var matched = 0;
        var keys = Object.keys(sourceMap);
        for (var k = 0; k < keys.length; k++) {
          var key = keys[k];
          if (!outputMap[key]) {
            mismatches.push({ element: key, issue: 'missing in output' });
            continue;
          }
          matched++;
          var s = sourceMap[key];
          var o = outputMap[key];
          var diffs = {};
          var hasDiff = false;
          var allProps = new Set(Object.keys(s).concat(Object.keys(o)));
          allProps.forEach(function(prop) {
            var sv = s[prop] || '';
            var ov = o[prop] || '';
            if (sv === ov) return;
            // Skip tiny pixel rounding
            var sn = parseFloat(sv), on = parseFloat(ov);
            if (!isNaN(sn) && !isNaN(on) && Math.abs(sn - on) < 1) return;
            // Skip font-family (intentionally different)
            if (prop === 'font-family') return;
            diffs[prop] = { s: sv.substring(0, 40), o: ov.substring(0, 40) };
            hasDiff = true;
          });
          if (hasDiff) {
            mismatches.push({ element: key, diffs: diffs });
          }
        }

        var oKeys = Object.keys(outputMap);
        for (var m = 0; m < oKeys.length; m++) {
          if (!sourceMap[oKeys[m]]) {
            mismatches.push({ element: oKeys[m], issue: 'only in output' });
          }
        }

        resolve(JSON.stringify({
          sourceElements: keys.length,
          outputElements: oKeys.length,
          matched: matched,
          mismatchedElements: mismatches.length,
          details: mismatches
        }, null, 2));
      } catch(e) {
        document.body.removeChild(iframe);
        resolve(JSON.stringify({ error: e.message }));
      }
    };
    iframe.src = sourceUrl;
  });
})
