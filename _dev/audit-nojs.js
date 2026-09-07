/* ============================================================================
 * audit-nojs.js - does the page still deliver its content without JavaScript?
 *
 * Rendering with scripts off is unreliable in headless Chrome (--dump-dom
 * returns empty), so the check is done on the served markup plus a rendered
 * pass where the script file is swapped out. Both must show the same content.
 *
 *   1. every content row is in the HTML itself, not built by script
 *   2. the reveal targets are visible without the .js class
 *   3. the rotating headline carries a static text alternative
 *   4. the nav is usable: real links, not a script-only menu
 * ==========================================================================*/

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const fileUrl = (p) => 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20');

/* the probe renders a copy of the page with the site script removed, so the
   browser applies exactly the styles a no-JS visitor would get */
const PROBE = `
<script id="__probe">
(function () {
  function vis(el) {
    var cs = getComputedStyle(el);
    return parseFloat(cs.opacity) > 0.5 && cs.visibility !== 'hidden' && cs.display !== 'none';
  }
  var out = [];
  var reveals = [].slice.call(document.querySelectorAll('[data-reveal]'));
  var hidden = reveals.filter(function (el) { return !vis(el); });
  if (hidden.length) out.push(hidden.length + ' of ' + reveals.length + ' reveal targets are invisible without JS');

  var rot = document.querySelector('.rotator');
  if (rot) {
    var items = [].slice.call(rot.querySelectorAll('.rotator-item'));
    var shown = items.filter(vis);
    if (shown.length !== 1) out.push(shown.length + ' rotator words visible without JS (want exactly 1)');
  }

  var rows = document.querySelectorAll('.index-row, .cat-item, .guide-row').length;
  if (!rows) out.push('no content rows rendered');

  /* the mega panel cannot open without JS, so its links must also live in a
     place a no-JS visitor can reach: the drawer, which is plain markup */
  var drawerLinks = document.querySelectorAll('.drawer-link').length;
  if (drawerLinks < 14) out.push('drawer offers only ' + drawerLinks + ' links');

  var t = document.createElement('title');
  t.id = '__result';
  t.textContent = out.length ? out.join(' || ') : 'OK rows=' + rows + ' reveals=' + reveals.length + ' drawer=' + drawerLinks;
  document.head.appendChild(t);
})();
</script>
`;

const targets = process.argv.slice(2);
const list = targets.length ? targets : ['index.html', 'gothic-dark/index.html', 'blog/index.html', 'blog/how-to-store-filament/index.html'];

let failures = 0;
for (const relPath of list) {
  const file = path.join(ROOT, relPath.split('/').join(path.sep));
  const html = fs.readFileSync(file, 'utf8');
  const problems = [];

  /* 1. content must be in the markup as shipped */
  const rows = (html.match(/class="index-row"/g) || []).length
    + (html.match(/class="cat-item"/g) || []).length
    + (html.match(/class="guide-row"/g) || []).length;
  if (rows === 0) problems.push('no content rows in the served markup');

  /* 3. the static alternative for the rotating word */
  if (/data-rotator/.test(html) && !/class="vh">models: /.test(html)) {
    problems.push('the rotating headline has no static text alternative');
  }

  /* 4. real hrefs, not script-only handlers */
  const megaLinks = (html.match(/class="mega-link"/g) || []).length;
  const drawerLinks = (html.match(/class="drawer-link"/g) || []).length;
  if (megaLinks !== 12) problems.push('mega panel has ' + megaLinks + ' links');
  if (drawerLinks !== 14) problems.push('drawer has ' + drawerLinks + ' links');

  /* 2. render the page with the script removed */
  const stripped = html
    .replace(/<script src="[^"]*site\.js"[^>]*><\/script>/, '')
    .replace('</body>', PROBE + '</body>');
  const temp = path.join(path.dirname(file), '__nojs.html');
  fs.writeFileSync(temp, stripped, 'utf8');
  let dom = '';
  try {
    dom = execFileSync(CHROME, [
      '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
      '--virtual-time-budget=6000', '--window-size=1360,1000',
      '--dump-dom', fileUrl(temp),
    ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 40 * 1024 * 1024 });
  } catch (e) {
    problems.push('chrome error');
  }
  fs.unlinkSync(temp);

  const m = dom.match(/<title id="__result">([\s\S]*?)<\/title>/);
  const res = m ? m[1] : 'probe did not run';
  if (res.indexOf('OK') !== 0) {
    for (const line of res.split(' || ')) problems.push(line);
  }

  if (problems.length) {
    failures++;
    console.log('FAIL  ' + relPath);
    for (const p of problems) console.log('        ' + p);
  } else {
    console.log('  ok  ' + relPath + '   ' + res.slice(3));
  }
}

console.log('');
console.log(failures ? failures + ' page(s) fail without JS' : 'no-JS check passed');
process.exit(failures ? 1 : 0);

