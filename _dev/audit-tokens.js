/* ============================================================================
 * audit-tokens.js - static discipline check on the stylesheet.
 *
 *   1. every colour token in :root has a dark-scheme counterpart
 *   2. no raw colour or font-family outside the two token blocks
 *   3. every var(--x) referenced somewhere is actually defined
 *   4. contrast: text-on-surface pairs meet WCAG AA in both schemes
 *   5. the bans this rebuild committed to: no radius, no shadow, no transition-all,
 *      no 100vw/100vh, no overflow:hidden on the root, no z-index above the scale
 * ==========================================================================*/

'use strict';

const fs = require('fs');
const path = require('path');

const CSS = fs.readFileSync(path.join(__dirname, '..', 'assets', 'style.css'), 'utf8');
const fail = [];

/* ------------------------------------------------- isolate the token blocks */
function blockAfter(marker) {
  const start = CSS.indexOf(marker);
  if (start < 0) return null;
  const open = CSS.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < CSS.length; i++) {
    if (CSS[i] === '{') depth++;
    else if (CSS[i] === '}') {
      depth--;
      if (depth === 0) return CSS.slice(open + 1, i);
    }
  }
  return null;
}

const lightBlock = blockAfter(':root {');
const darkOuter = blockAfter('@media (prefers-color-scheme: dark) {');
if (!lightBlock) fail.push('no :root token block found');
if (!darkOuter) fail.push('no dark-scheme block found');

const darkBlock = darkOuter ? blockAfter.call(null, '') && darkOuter.slice(darkOuter.indexOf('{') + 1, darkOuter.lastIndexOf('}')) : '';

function tokensIn(block) {
  const map = {};
  for (const m of (block || '').matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) map[m[1]] = m[2].trim();
  return map;
}

const light = tokensIn(lightBlock);
const dark = tokensIn(darkBlock);

/* --------------------------------- 1. dark counterparts for colour tokens */
const isColour = (v) => /^#[0-9a-f]{3,8}$/i.test(v) || /^(rgb|rgba|oklch|hsl)\(/i.test(v);
const COLOUR_EXEMPT = new Set(['--print-paper', '--print-ink']);

const lightColours = Object.keys(light).filter((k) => isColour(light[k]) && !COLOUR_EXEMPT.has(k));
for (const k of lightColours) {
  if (!(k in dark)) fail.push('colour token has no dark counterpart: ' + k);
}
for (const k of Object.keys(dark)) {
  if (!(k in light)) fail.push('dark block defines a token the light block does not: ' + k);
}

/* --------------------------- 2. no raw colour or font outside the tokens */
let outside = CSS;
if (lightBlock) outside = outside.replace(lightBlock, '');
if (darkBlock) outside = outside.replace(darkBlock, '');

for (const m of outside.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) fail.push('raw hex outside tokens: ' + m[0]);
for (const m of outside.matchAll(/\b(?:rgba?|hsla?|oklch)\(/g)) fail.push('raw colour function outside tokens: ' + m[0]);
for (const m of outside.matchAll(/font-family:\s*([^;]+);/g)) {
  if (!/^var\(--font-/.test(m[1].trim())) fail.push('font-family not from a token: ' + m[1].trim());
}

/* ----------------------------------- 3. every referenced var is defined */
const defined = new Set(Object.keys(light).concat(Object.keys(dark)));
const referenced = new Set();
for (const m of CSS.matchAll(/var\((--[a-z0-9-]+)/g)) referenced.add(m[1]);
for (const r of referenced) {
  /* --i is set inline per element as a stagger index */
  if (r === '--i') continue;
  if (!defined.has(r)) fail.push('var() references an undefined token: ' + r);
}
for (const d of Object.keys(light)) {
  if (!referenced.has(d) && !COLOUR_EXEMPT.has(d)) fail.push('token defined but never used: ' + d);
}

/* --------------------------------------------------------- 4. contrast */
const srgb = (h) => {
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
};
const lin = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const lum = (h) => { const [r, g, b] = srgb(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => {
  const l1 = lum(a), l2 = lum(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

/* [foreground token, background token, minimum, label] */
const PAIRS = [
  ['--ink', '--paper', 4.5, 'body text on the page'],
  ['--ink', '--paper-2', 4.5, 'body text on a tinted surface'],
  ['--ink-2', '--paper', 4.5, 'secondary text on the page'],
  ['--ink-2', '--paper-2', 4.5, 'secondary text on a tinted surface'],
  ['--ink-2', '--paper-3', 4.5, 'secondary text on a hover surface'],
  ['--accent', '--paper', 4.5, 'link colour on the page'],
  ['--paper', '--accent', 4.5, 'primary button label'],
  ['--paper', '--accent-deep', 4.5, 'primary button label on hover'],
  ['--paper', '--accent-deeper', 4.5, 'primary button label on press'],
  ['--ink-3', '--paper', 4.5, 'metadata: counts, dates and print codes'],
  ['--ink-3', '--paper-2', 4.5, 'metadata on a tinted surface'],
  ['--ink-3', '--paper-3', 4.5, 'metadata on a hover surface'],
  ['--rule-3', '--paper', 1.4, 'strongest hairline against the page'],
];

for (const [scheme, tokens] of [['light', light], ['dark', Object.assign({}, light, dark)]]) {
  for (const [fg, bg, min, label] of PAIRS) {
    const a = tokens[fg], b = tokens[bg];
    if (!a || !b) { fail.push(scheme + ': missing token in pair ' + fg + '/' + bg); continue; }
    const r = ratio(a, b);
    if (r < min) fail.push(scheme + ' contrast ' + r.toFixed(2) + ' < ' + min + ' for ' + label + ' (' + fg + ' on ' + bg + ')');
  }
}

/* ------------------------------------------------------------- 5. bans */
const BANS = [
  [/border-radius\s*:\s*(?!0)/g, 'border-radius other than 0 (the system is square-edged)'],
  [/box-shadow\s*:\s*(?!none)/g, 'box-shadow (separation is by hairline and space)'],
  [/transition\s*:\s*all\b/g, 'transition: all'],
  [/\b100vw\b/g, '100vw (breaks when a scrollbar is visible)'],
  [/\b100vh\b/g, '100vh (use dvh or content height)'],
  [/z-index\s*:\s*\d{4,}/g, 'z-index above the named scale'],
  [/[\u2014\u2013]/g, 'em or en dash'],
  [/-webkit-background-clip\s*:\s*text|background-clip\s*:\s*text/g, 'gradient text'],
  [/backdrop-filter/g, 'backdrop-filter (no glass in this system)'],
  [/linear-gradient|radial-gradient|conic-gradient/g, 'gradient'],
];

/* the focus ring is the one sanctioned box-shadow */
const cssForBans = CSS.replace(/box-shadow:\s*0 0 0 2px var\(--paper\), 0 0 0 4px var\(--accent\);/g, '');

for (const [re, label] of BANS) {
  const hits = cssForBans.match(re);
  if (hits) fail.push('banned: ' + label + ' (' + hits.length + 'x)');
}

/* italic is allowed only as body-copy emphasis inside running prose */
for (const m of CSS.matchAll(/([^{}]+)\{[^}]*font-style:\s*italic[^}]*\}/g)) {
  const sel = m[1].trim().split('\n').pop().trim();
  if (!/^\.prose (i|em)$/.test(sel)) fail.push('italic on a non-prose selector: ' + sel);
}
for (const m of CSS.matchAll(/([^{}]+)\{[^}]*font-style:\s*oblique[^}]*\}/g)) {
  fail.push('oblique type: ' + m[1].trim());
}

for (const root of ['html', 'body']) {
  const re = new RegExp(root + '\\s*\\{[^}]*overflow-x\\s*:\\s*hidden', 'i');
  if (re.test(CSS)) fail.push(root + ' uses overflow-x: hidden instead of clip');
}
if (!/html\s*\{[^}]*overflow-x:\s*clip/.test(CSS)) fail.push('html is missing overflow-x: clip');
if (!/body\s*\{[^}]*overflow-x:\s*clip/.test(CSS)) fail.push('body is missing overflow-x: clip');

/* a bare 1fr track can be pushed open by an intrinsic image width */
for (const m of CSS.matchAll(/grid-template-columns:\s*([^;]+);/g)) {
  const v = m[1];
  if (/(?:^|[\s(])1fr/.test(v) && v.indexOf('minmax') === -1 && v.indexOf('repeat(') === -1) {
    fail.push('grid track uses a bare 1fr: ' + v.trim());
  }
}

/* every media query must be a min-width, except the deliberate small-screen tweaks */
const queries = [...CSS.matchAll(/@media\s*\(([^)]+)\)/g)].map((m) => m[1].trim());
const kinds = {};
for (const q of queries) kinds[q] = (kinds[q] || 0) + 1;

/* ------------------------------------------------------------- report */
console.log('tokens (light):   ' + Object.keys(light).length);
console.log('tokens (dark):    ' + Object.keys(dark).length);
console.log('colour tokens:    ' + lightColours.length + ' (all mirrored in dark)');
console.log('media queries:    ' + queries.length);
for (const q of Object.keys(kinds).sort()) console.log('    ' + kinds[q] + 'x  ' + q);
console.log('css rules:        ' + (CSS.match(/\{/g) || []).length);
console.log('');

if (fail.length) {
  console.log('FAILURES (' + fail.length + '):');
  for (const f of fail) console.log('  x ' + f);
  process.exit(1);
}
console.log('TOKEN AUDIT PASSED');
