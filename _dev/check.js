/* ============================================================================
 * check.js - the whole gate in one command.
 *
 *   node check.js          build, then run every audit
 *   node check.js --fast   skip the browser-driven audits
 * ==========================================================================*/

'use strict';

const { execFileSync } = require('child_process');
const path = require('path');

const DEV = __dirname;
const fast = process.argv.indexOf('--fast') !== -1;

const STAGES = [
  ['build', 'build.js', []],
  ['data + link integrity', 'verify.js', []],
  ['design tokens', 'audit-tokens.js', []],
  ['css reachability', 'audit-css-usage.js', []],
  ['copy and content shape', 'audit-copy.js', []],
  ['layout (320-1440)', 'audit-layout.js', [], true],
  ['behaviour (menu, drawer, rotator)', 'audit-behaviour.js', [], true],
  ['works without JS', 'audit-nojs.js', [], true],
  ['accessibility (light)', 'audit-a11y.js', [], true],
  ['accessibility (dark)', 'audit-a11y.js', ['--dark'], true],
];

let failed = 0;
const results = [];

for (const [label, script, args, needsBrowser] of STAGES) {
  if (fast && needsBrowser) {
    results.push(['skip', label, 'browser audit skipped']);
    continue;
  }
  process.stdout.write('running: ' + label + ' ... ');
  let out = '';
  let ok = true;
  try {
    out = execFileSync(process.execPath, [path.join(DEV, script)].concat(args), {
      encoding: 'utf8', cwd: DEV, maxBuffer: 40 * 1024 * 1024,
    });
  } catch (e) {
    ok = false;
    out = (e.stdout || '') + (e.stderr || '');
    failed++;
  }
  const lines = out.trim().split('\n');
  const tail = lines[lines.length - 1] || '';
  console.log(ok ? 'ok' : 'FAILED');
  results.push([ok ? 'ok' : 'FAIL', label, tail.trim()]);
  if (!ok) {
    for (const line of lines.slice(-25)) console.log('    ' + line);
  }
}

console.log('');
console.log('== gate summary ==');
for (const [state, label, tail] of results) {
  console.log(' ' + state.padEnd(5) + label.padEnd(38) + tail.slice(0, 60));
}
console.log('');
console.log(failed ? failed + ' stage(s) failed' : 'ALL STAGES PASSED');
process.exit(failed ? 1 : 0);
