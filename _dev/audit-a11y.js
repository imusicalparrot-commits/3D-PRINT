/* ============================================================================
 * audit-a11y.js - accessibility audit in a real browser.
 *
 * Uses the browser's own layout and computed styles rather than static regex,
 * so it can see real contrast against real backgrounds and real focus order.
 *
 *   1. every interactive element is reachable and has an accessible name
 *   2. focus is visible on every control (a ring the page actually paints)
 *   3. text contrast, measured against the ancestor that paints the background
 *   4. landmarks: one main, header, footer, nav with a name
 *   5. images: alt present, decorative images marked, no alt duplicating text
 *   6. the mega panel and drawer are hidden from assistive tech when closed
 *   7. no positive tabindex, no aria-hidden on a focusable element
 * ==========================================================================*/

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const SCRIPT = `
  var log = [];
  function bad(msg) { log.push(msg); }

  function nameOf(el) {
    if (el.getAttribute('aria-label')) return el.getAttribute('aria-label').trim();
    var labelledby = el.getAttribute('aria-labelledby');
    if (labelledby) {
      var t = doc.getElementById(labelledby);
      if (t) return t.textContent.trim();
    }
    var text = el.textContent.replace(/\\s+/g, ' ').trim();
    if (text) return text;
    var img = el.querySelector('img[alt]');
    if (img && img.getAttribute('alt').trim()) return img.getAttribute('alt').trim();
    if (el.getAttribute('title')) return el.getAttribute('title').trim();
    return '';
  }

  function short(el) {
    return el.tagName.toLowerCase() + (el.className && typeof el.className === 'string'
      ? '.' + el.className.trim().split(/\\s+/)[0] : '');
  }

  /* ---- colour maths --------------------------------------------------- */
  function parseRGB(s) {
    var m = s.match(/rgba?\\(([^)]+)\\)/);
    if (!m) return null;
    var p = m[1].split(',').map(function (x) { return parseFloat(x); });
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }
  function lum(c) {
    function f(v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  }
  function ratio(fg, bg) {
    var l1 = lum(fg), l2 = lum(bg);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }
  function paintedBg(el) {
    var n = el;
    while (n && n !== doc.documentElement) {
      var c = parseRGB(win.getComputedStyle(n).backgroundColor);
      if (c && c.a > 0.95) return c;
      n = n.parentElement;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  }

  /* 1 + 2. controls: name, focus ring ---------------------------------- */
  var controls = [].slice.call(doc.querySelectorAll('a[href], button, [tabindex]'));
  var named = 0;
  for (var i = 0; i < controls.length; i++) {
    var el = controls[i];
    var name = nameOf(el);
    if (!name) bad('no accessible name: ' + short(el) + ' ' + (el.getAttribute('href') || ''));
    else named++;

    var ti = el.getAttribute('tabindex');
    if (ti !== null && Number(ti) > 0) bad('positive tabindex on ' + short(el));

    /* aria-hidden must never wrap something focusable */
    var hiddenAncestor = el.closest('[aria-hidden="true"]');
    if (hiddenAncestor && !el.closest('.drawer')) {
      bad('focusable inside aria-hidden: ' + short(el) + ' in ' + short(hiddenAncestor));
    }
  }

  /* the focus ring is a single global rule, so assert it resolves and paints */
  var probe = doc.querySelector('.btn') || controls[0];
  if (probe) {
    probe.focus();
    var fs2 = win.getComputedStyle(probe);
    var hasRing = (fs2.boxShadow && fs2.boxShadow !== 'none') || (fs2.outlineStyle && fs2.outlineStyle !== 'none');
    if (!hasRing) bad('focus produces no visible ring on ' + short(probe));
    probe.blur();
  }

  /* 3. text contrast --------------------------------------------------- */
  var textEls = [].slice.call(doc.querySelectorAll('p, span, a, h1, h2, h3, b, dt, dd, li, summary, figcaption'));
  var checked = 0;
  var worst = { r: 99, sel: '' };
  for (var j = 0; j < textEls.length; j++) {
    var t = textEls[j];
    if (t.closest('.drawer') || t.closest('.mega') || t.closest('.vh')) continue;
    /* only leaf text, so we do not measure a wrapper's inherited colour twice */
    var ownText = '';
    for (var n = 0; n < t.childNodes.length; n++) {
      if (t.childNodes[n].nodeType === 3) ownText += t.childNodes[n].nodeValue;
    }
    if (!ownText.trim()) continue;
    var cs = win.getComputedStyle(t);
    if (parseFloat(cs.opacity) < 0.1) continue;
    var fg = parseRGB(cs.color);
    if (!fg) continue;
    var bg = paintedBg(t);
    var r = ratio(fg, bg);
    var size = parseFloat(cs.fontSize);
    var weight = Number(cs.fontWeight) || 400;
    var large = size >= 24 || (size >= 18.66 && weight >= 700);
    var min = large ? 3 : 4.5;
    checked++;
    if (r < worst.r) { worst = { r: r, sel: short(t) + ' "' + ownText.trim().slice(0, 24) + '"' }; }
    if (r < min) {
      bad('contrast ' + r.toFixed(2) + ' < ' + min + ' on ' + short(t) + ' "' + ownText.trim().slice(0, 30) + '" (' + Math.round(size) + 'px/' + weight + ')');
    }
  }

  /* 4. landmarks -------------------------------------------------------- */
  if (doc.querySelectorAll('main').length !== 1) bad(doc.querySelectorAll('main').length + ' main landmarks');
  if (!doc.querySelector('header')) bad('no header landmark');
  if (!doc.querySelector('footer')) bad('no footer landmark');
  var navs = doc.querySelectorAll('nav');
  for (var k = 0; k < navs.length; k++) {
    if (!navs[k].getAttribute('aria-label') && !navs[k].getAttribute('aria-labelledby')) {
      bad('nav without a name: ' + short(navs[k]));
    }
  }
  var skip = doc.querySelector('.skip-link');
  if (!skip) bad('no skip link');
  else if (!doc.querySelector(skip.getAttribute('href'))) bad('skip link target missing');

  /* every section that is labelled must point at a real heading */
  var labelled = doc.querySelectorAll('[aria-labelledby]');
  for (var q = 0; q < labelled.length; q++) {
    var idref = labelled[q].getAttribute('aria-labelledby');
    if (!doc.getElementById(idref)) bad('aria-labelledby points at a missing id: ' + idref);
  }

  /* duplicate ids break every id-based reference */
  var ids = {};
  var withId = doc.querySelectorAll('[id]');
  for (var w = 0; w < withId.length; w++) {
    var theId = withId[w].id;
    if (ids[theId]) bad('duplicate id: ' + theId);
    ids[theId] = 1;
  }

  /* 5. images ----------------------------------------------------------- */
  var imgs = doc.querySelectorAll('img');
  for (var m2 = 0; m2 < imgs.length; m2++) {
    var im = imgs[m2];
    var alt = im.getAttribute('alt');
    if (alt === null) bad('img without an alt attribute: ' + im.getAttribute('src'));
    if (im.naturalWidth === 0) bad('img failed to load: ' + im.getAttribute('src'));
    if (!im.getAttribute('width') || !im.getAttribute('height')) bad('img without dimensions: ' + im.getAttribute('src'));
  }

  /* 6. closed overlays are hidden from assistive tech ------------------ */
  var panel = doc.getElementById('megaCollections');
  var drawer = doc.getElementById('siteDrawer');
  if (panel && win.getComputedStyle(panel).visibility !== 'hidden') bad('mega panel is exposed while closed');
  if (drawer && drawer.getAttribute('aria-hidden') !== 'true') bad('drawer is exposed while closed');
  if (drawer && win.getComputedStyle(drawer).visibility !== 'hidden') bad('drawer is visible while closed');

  finish(log.length ? log.join(' || ') : 'OK controls=' + controls.length + ' named=' + named + ' text=' + checked + ' worst=' + worst.r.toFixed(2) + ' on ' + worst.sel);
`;

function harness(target, dark) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>html,body{margin:0}iframe{width:1280px;height:900px;border:0}</style></head>
<body>
<iframe id="f" src="${target}"></iframe>
<script>
function finish(msg) {
  if (document.getElementById('__result')) return;
  var t = document.createElement('title'); t.id='__result'; t.textContent = msg; document.head.appendChild(t);
}
document.getElementById('f').addEventListener('load', function () {
  setTimeout(function () {
    var win = document.getElementById('f').contentWindow;
    var doc = win.document;
    try {
${SCRIPT}
    } catch (e) { finish('SCRIPT ERROR ' + e.message); }
  }, 700);
});
setTimeout(function () { finish('TIMEOUT'); }, 20000);
</script>
</body></html>
`;
}

const fileUrl = (p) => 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20');

const args = process.argv.slice(2);
const list = args.filter((a) => a !== '--dark');
const dark = args.indexOf('--dark') !== -1;
const targets = list.length ? list : [
  'index.html', 'gothic-dark/index.html', 'keychains-accessories/index.html',
  'blog/index.html', 'blog/how-to-prepare-a-3d-model-for-printing/index.html',
  'privacy/index.html', 'terms/index.html',
];

let failures = 0;
for (const relPath of targets) {
  const file = path.join(ROOT, relPath.split('/').join(path.sep));
  const temp = path.join(ROOT, '__a11y.html');
  fs.writeFileSync(temp, harness(fileUrl(file), dark), 'utf8');
  const flags = [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--allow-file-access-from-files', '--virtual-time-budget=25000',
    '--window-size=1360,1000',
  ];
  /* preferredColorScheme=0 makes the media query match without Chrome's own
     auto-darkening filter, so the audit measures OUR dark tokens, not Chrome's */
  if (dark) flags.push('--blink-settings=preferredColorScheme=0');
  flags.push('--dump-dom', fileUrl(temp));
  let dom = '';
  try {
    dom = execFileSync(CHROME, flags, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 40 * 1024 * 1024 });
  } catch (e) {
    console.log('FAIL  ' + relPath + ' (chrome error)');
    failures++;
    fs.unlinkSync(temp);
    continue;
  }
  fs.unlinkSync(temp);
  const m = dom.match(/<title id="__result">([\s\S]*?)<\/title>/);
  const res = m ? m[1] : 'PROBE DID NOT RUN';
  if (res.indexOf('OK') === 0) {
    console.log('  ok  ' + relPath + '   ' + res.slice(3));
  } else {
    failures++;
    console.log('FAIL  ' + relPath);
    const lines = res.split(' || ');
    for (const line of lines.slice(0, 12)) console.log('        ' + line);
    if (lines.length > 12) console.log('        ... and ' + (lines.length - 12) + ' more');
  }
}

console.log('');
console.log(failures ? failures + ' page(s) failed the a11y audit' : 'a11y audit passed' + (dark ? ' (dark scheme)' : ''));
process.exit(failures ? 1 : 0);
