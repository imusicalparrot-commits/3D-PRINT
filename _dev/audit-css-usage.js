/* ============================================================================
 * audit-css-usage.js - is every rule in the stylesheet actually reachable?
 *
 * Dead CSS is weight the visitor downloads for nothing, and it hides mistakes:
 * a class that exists in the stylesheet but nowhere in the markup usually means
 * a renamed component left half-migrated.
 *
 *   1. every class selector in the stylesheet appears in some generated page
 *   2. every class used in the markup is styled by the stylesheet
 *   3. every data- attribute the script looks for exists in the markup
 * ==========================================================================*/

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CSS = fs.readFileSync(path.join(ROOT, 'assets', 'style.css'), 'utf8');
const JS = fs.readFileSync(path.join(ROOT, 'assets', 'site.js'), 'utf8');

function walk(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '_dev' || e.name === 'assets' || e.name.startsWith('.') || e.name.startsWith('__')) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, acc);
    else if (e.name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

const pages = walk(ROOT, []);
const allHtml = pages.map((f) => fs.readFileSync(f, 'utf8')).join('\n');

/* classes used in the markup */
const used = new Set();
for (const m of allHtml.matchAll(/class="([^"]+)"/g)) {
  for (const c of m[1].trim().split(/\s+/)) used.add(c);
}

/* classes the script adds at runtime, so they are legitimately absent from HTML */
const RUNTIME = new Set(['js', 'is-open', 'is-locked', 'is-visible', 'is-in', 'is-out']);

/* classes declared in the stylesheet */
const declared = new Set();
const cssNoComments = CSS.replace(/\/\*[\s\S]*?\*\//g, '');
for (const block of cssNoComments.split('}')) {
  const head = block.split('{')[0];
  if (!head || head.indexOf('@') !== -1) continue;
  for (const m of head.matchAll(/\.([a-zA-Z][\w-]*)/g)) declared.add(m[1]);
}

const fail = [];

for (const c of declared) {
  if (!used.has(c) && !RUNTIME.has(c)) fail.push('styled but never used in markup: .' + c);
}
for (const c of used) {
  if (!declared.has(c) && !RUNTIME.has(c)) fail.push('used in markup but never styled: .' + c);
}

/* the hooks the script queries must exist in the markup */
for (const m of JS.matchAll(/querySelector(?:All)?\('\[([a-z-]+)\]'\)/g)) {
  if (allHtml.indexOf(m[1]) === -1) fail.push('script looks for [' + m[1] + '], markup has none');
}
for (const m of JS.matchAll(/getElementById\('([\w-]+)'\)/g)) {
  if (allHtml.indexOf('id="' + m[1] + '"') === -1) fail.push('script looks for #' + m[1] + ', markup has none');
}

console.log('classes in stylesheet: ' + declared.size);
console.log('classes in markup:     ' + used.size);
console.log('runtime-only classes:  ' + RUNTIME.size);
console.log('');

if (fail.length) {
  console.log('FAILURES (' + fail.length + '):');
  for (const f of fail) console.log('  x ' + f);
  process.exit(1);
}
console.log('CSS USAGE AUDIT PASSED');
