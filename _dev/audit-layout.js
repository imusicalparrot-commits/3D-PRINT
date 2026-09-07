/* ============================================================================
 * audit-layout.js - real-browser layout audit of the generated site.
 *
 * Chrome on Windows refuses a window narrower than ~500px, so --window-size=320
 * silently gives a 504px viewport. To measure true phone widths the page is
 * loaded inside an iframe of exactly W pixels: media queries inside an iframe
 * evaluate against the iframe's own viewport, so the layout is the real one.
 * --allow-file-access-from-files lets the harness read into the frame.
 *
 * Checks, per page per width:
 *   1. no horizontal scroll on the document
 *   2. no element sticking out past the viewport edge
 *   3. no clickable label wrapping to two lines
 *   4. tap targets at least 44px tall below 40rem
 *   5. exactly one h1, wrapping to at most three lines
 *   6. the rotating word reserves its own line and never overflows
 * ==========================================================================*/

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const DEV = __dirname;
const ROOT = path.join(DEV, '..');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const WIDTHS = [320, 375, 414, 768, 1024, 1440];

const MEASURE = `
  function textLines(el) {
    var walker = doc.createTreeWalker(el, 4 /* SHOW_TEXT */, {
      acceptNode: function (n) {
        if (!n.nodeValue.trim().length) return 3 /* REJECT */;
        var p = n.parentElement;
        if (!p) return 3;
        if (p.closest('.vh')) return 3;
        if (parseFloat(win.getComputedStyle(p).opacity) < 0.05) return 3;
        return 1 /* ACCEPT */;
      }
    });
    var tops = [], n;
    while ((n = walker.nextNode())) {
      var r = doc.createRange();
      r.selectNodeContents(n);
      var rects = r.getClientRects();
      for (var i = 0; i < rects.length; i++) {
        if (rects[i].width < 0.5) continue;
        var top = rects[i].top, found = false;
        for (var j = 0; j < tops.length; j++) if (Math.abs(tops[j] - top) < 4) { found = true; break; }
        if (!found) tops.push(top);
      }
    }
    return tops.length || 1;
  }

  function label(el) {
    return el.tagName.toLowerCase() + (el.className && typeof el.className === 'string'
      ? '.' + el.className.trim().split(/\\s+/).slice(0, 2).join('.') : '');
  }

  function text(el) { return el.textContent.trim().replace(/\\s+/g, ' ').slice(0, 30); }

  var out = [];
  var vw = doc.documentElement.clientWidth;

  if (doc.documentElement.scrollWidth > vw + 1) {
    out.push('HSCROLL doc ' + doc.documentElement.scrollWidth + ' > ' + vw);
  }

  var all = doc.querySelectorAll('body *');
  for (var i = 0; i < all.length; i++) {
    var el = all[i];
    if (el.closest('.drawer') || el.closest('.mega')) continue;
    var box = el.getBoundingClientRect();
    if (box.width === 0 && box.height === 0) continue;
    if (box.right > vw + 1.5 || box.left < -1.5) {
      if (!el.closest('.picks-scroll, .switcher-inner')) {
        out.push('OVERFLOW ' + label(el) + ' l=' + Math.round(box.left) + ' r=' + Math.round(box.right));
      }
    }
  }

  var clickables = doc.querySelectorAll('.nav-link, .btn, .btn-ghost, .tlink, .footer-links a, .crumb, .burger, .switcher-link, .mega-aside a, .cat-item-open, .brand');
  for (var j = 0; j < clickables.length; j++) {
    var c = clickables[j];
    if (c.closest('.drawer') || c.closest('.mega')) continue;
    if (c.getBoundingClientRect().width === 0) continue;
    var n = textLines(c);
    if (n > 1) out.push('WRAP ' + label(c) + ' (' + n + ') "' + text(c) + '"');
  }

  if (vw < 640) {
    var targets = doc.querySelectorAll('a[href], button');
    for (var k = 0; k < targets.length; k++) {
      var tg = targets[k];
      if (tg.closest('.drawer') || tg.closest('.mega') || tg.classList.contains('skip-link')) continue;
      if (tg.closest('.prose, .editorial, .faq-a, .legal, .a-callout, figcaption, .step, .footer-note')) continue;
      var tb = tg.getBoundingClientRect();
      if (tb.width === 0 || tb.height === 0) continue;
      if (tb.height < 44) out.push('SMALLTAP ' + label(tg) + ' h=' + Math.round(tb.height) + ' "' + text(tg) + '"');
    }
  }

  var h1s = doc.querySelectorAll('h1');
  if (h1s.length !== 1) out.push('H1COUNT ' + h1s.length);
  if (h1s.length === 1) {
    var hl = textLines(h1s[0]);
    if (hl > 3) out.push('H1LINES ' + hl);
  }

  var rot = doc.querySelector('.rotator');
  if (rot) {
    var rb = rot.getBoundingClientRect();
    if (rb.height < 10) out.push('ROTATOR collapsed h=' + Math.round(rb.height));
    var items = rot.querySelectorAll('.rotator-item');
    for (var q = 0; q < items.length; q++) {
      var ib = items[q].getBoundingClientRect();
      if (ib.right > vw + 1.5) out.push('ROTATOR overflow "' + items[q].textContent + '"');
    }
  }
`;

function harness(target, width) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
html,body{margin:0;padding:0;background:#fff}
iframe{display:block;width:${width}px;height:900px;border:0}
</style></head>
<body>
<iframe id="f" src="${target}"></iframe>
<script>
function run() {
  var frame = document.getElementById('f');
  var win = frame.contentWindow;
  var doc = win.document;
  var out = [];
  try {
${MEASURE}
    finish(out.length ? out.join(' || ') : 'OK');
  } catch (e) {
    finish('PROBE ERROR ' + e.message);
  }
}
function finish(msg) {
  var t = document.createElement('title');
  t.id = '__result';
  t.textContent = msg;
  document.head.appendChild(t);
}
var frame = document.getElementById('f');
frame.addEventListener('load', function () { setTimeout(run, 500); });
setTimeout(function () { if (!document.getElementById('__result')) finish('TIMEOUT'); }, 12000);
</script>
</body></html>
`;
}

function walk(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '_dev' || e.name === 'assets' || e.name.startsWith('.') || e.name.startsWith('__')) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, acc);
    else if (e.name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

const only = process.argv[2];
let pages = walk(ROOT, []);

/* One representative page per template by default; pass a path fragment to widen. */
const SAMPLE = [
  'index.html',
  'gothic-dark/index.html',
  'keychains-accessories/index.html',
  'blog/index.html',
  'blog/how-to-prepare-a-3d-model-for-printing/index.html',
  'privacy/index.html',
  'terms/index.html',
];

pages = pages.filter((p) => {
  const r = path.relative(ROOT, p).split(path.sep).join('/');
  if (!only) return SAMPLE.indexOf(r) !== -1;
  /* an exact path wins over a substring, so "index.html" means the root page */
  return r === only || (only.indexOf('/') !== -1 && r.indexOf(only) !== -1);
});

const fileUrl = (p) => 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20');

let failures = 0;
for (const file of pages) {
  const id = path.relative(ROOT, file).split(path.sep).join('/');
  for (const w of WIDTHS) {
    const temp = path.join(ROOT, '__harness.html');
    fs.writeFileSync(temp, harness(fileUrl(file), w), 'utf8');
    let dom = '';
    try {
      dom = execFileSync(CHROME, [
        '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
        '--allow-file-access-from-files',
        '--virtual-time-budget=20000',
        '--window-size=' + Math.max(w + 40, 560) + ',1000',
        '--dump-dom', fileUrl(temp),
      ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 40 * 1024 * 1024 });
    } catch (e) {
      console.log('FAIL  ' + id + ' @' + w + ' (chrome error)');
      failures++;
      fs.unlinkSync(temp);
      continue;
    }
    fs.unlinkSync(temp);
    const m = dom.match(/<title id="__result">([\s\S]*?)<\/title>/);
    const res = m ? m[1] : 'PROBE DID NOT RUN';
    if (res === 'OK') {
      console.log('  ok  ' + id + ' @' + w);
    } else {
      failures++;
      console.log('FAIL  ' + id + ' @' + w);
      for (const line of res.split(' || ')) console.log('        ' + line);
    }
  }
}

console.log('');
console.log(failures ? failures + ' viewport check(s) failed' : 'layout audit passed');
process.exit(failures ? 1 : 0);
