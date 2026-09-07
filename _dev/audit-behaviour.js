/* ============================================================================
 * audit-behaviour.js - drives the page's own JS in a real browser and asserts
 * that the three interaction primitives actually work.
 *
 *   1. mega-menu: closed by default, opens on click, sets aria-expanded,
 *      raises the scrim, closes on Escape
 *   2. drawer: closed by default, opens, locks the body, closes on Escape
 *   3. rotator: reserves a fixed line box, moves the visible word over time,
 *      and never changes the headline's height while doing it
 *   4. reveal: every [data-reveal] in the first screen ends up visible
 *
 * NOTE on measurement: with --virtual-time-budget, headless Chrome advances
 * timers but freezes the CSS transition clock, so getComputedStyle keeps
 * returning each transition's START value. State is therefore asserted from the
 * class list plus the resolved CSS rule, which is what actually drives the
 * paint, rather than from the mid-transition computed value.
 * ==========================================================================*/

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const SCRIPT = `
  var log = [];
  function ok(cond, msg) { if (!cond) log.push('FAIL ' + msg); }

  /* read a declaration straight out of the stylesheet, bypassing transitions */
  function ruleValue(selector, prop) {
    var sheets = doc.styleSheets;
    var found = null;
    for (var s = 0; s < sheets.length; s++) {
      var rules;
      try { rules = sheets[s].cssRules; } catch (e) { continue; }
      for (var r = 0; r < rules.length; r++) {
        if (rules[r].selectorText === selector) {
          var v = rules[r].style.getPropertyValue(prop);
          if (v) found = v.trim();
        }
      }
    }
    return found;
  }

  var trigger = doc.querySelector('[data-mega-trigger]');
  var panel = doc.getElementById('megaCollections');
  var scrim = doc.querySelector('[data-scrim]');
  var burger = doc.querySelector('[data-drawer-toggle]');
  var drawer = doc.getElementById('siteDrawer');
  var h1 = doc.querySelector('h1');
  var rot = doc.querySelector('.rotator');

  ok(trigger && panel && scrim, 'mega parts present');
  ok(burger && drawer, 'drawer parts present');

  /* 1. mega-menu -------------------------------------------------------- */
  ok(!panel.classList.contains('is-open'), 'mega starts closed');
  ok(trigger.getAttribute('aria-expanded') === 'false', 'mega aria starts false');
  ok(win.getComputedStyle(panel).visibility === 'hidden', 'mega hidden from AT when closed');
  ok(ruleValue('.mega', 'visibility') === 'hidden', 'closed rule hides the panel');
  ok(ruleValue('.mega.is-open', 'visibility') === 'visible', 'open rule reveals the panel');
  ok(ruleValue('.mega.is-open', 'opacity') === '1', 'open rule sets full opacity');

  trigger.click();
  ok(panel.classList.contains('is-open'), 'mega opens on click');
  ok(panel.matches('.mega.is-open'), 'open rule now applies');
  ok(trigger.getAttribute('aria-expanded') === 'true', 'mega aria true when open');
  ok(scrim.classList.contains('is-open'), 'scrim raised with mega');
  var megaLinks = panel.querySelectorAll('.mega-link').length;
  ok(megaLinks === 12, 'mega lists 12 collections, got ' + megaLinks);

  doc.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  ok(!panel.classList.contains('is-open'), 'Escape closes mega');
  ok(!scrim.classList.contains('is-open'), 'Escape drops scrim');
  ok(trigger.getAttribute('aria-expanded') === 'false', 'aria resets after Escape');

  trigger.click();
  trigger.click();
  ok(!panel.classList.contains('is-open'), 'second click closes mega');

  /* 2. drawer ----------------------------------------------------------- */
  ok(!drawer.classList.contains('is-open'), 'drawer starts closed');
  ok(drawer.getAttribute('aria-hidden') === 'true', 'drawer aria-hidden when closed');
  burger.click();
  ok(drawer.classList.contains('is-open'), 'drawer opens');
  ok(doc.body.classList.contains('is-locked'), 'body locked with drawer');
  ok(drawer.getAttribute('aria-hidden') === 'false', 'drawer exposed when open');
  var drawerLinks = drawer.querySelectorAll('.drawer-link').length;
  ok(drawerLinks === 14, 'drawer lists 12 collections + index + guides, got ' + drawerLinks);
  doc.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  ok(!drawer.classList.contains('is-open'), 'Escape closes drawer');
  ok(!doc.body.classList.contains('is-locked'), 'body unlocked after drawer');

  /* 3. rotator ---------------------------------------------------------- */
  if (rot) {
    var h0 = Math.round(h1.getBoundingClientRect().height);
    var items = [].slice.call(rot.querySelectorAll('.rotator-item'));
    ok(items.length === 5, 'rotator holds 5 words, got ' + items.length);
    ok(rot.getAttribute('aria-hidden') === 'true', 'rotator hidden from AT');
    ok(doc.querySelector('h1 .vh'), 'headline carries a static text alternative');
    ok(ruleValue('.rotator-item.is-in', 'opacity') === '1', 'incoming word rule is opaque');
    ok(ruleValue('.rotator-item', 'opacity') === '0', 'resting word rule is transparent');

    var inAt0 = items.filter(function (el) { return el.classList.contains('is-in'); });
    ok(inAt0.length === 1, 'exactly one word marked visible, got ' + inAt0.length);
    var first = inAt0[0] ? inAt0[0].textContent : '';
    ok(items.indexOf(inAt0[0]) === 0, 'starts on the first word');

    /* wait past one interval and re-read the class state */
    setTimeout(function () {
      var h2 = Math.round(h1.getBoundingClientRect().height);
      ok(h2 === h0, 'headline height stable while rotating (' + h0 + ' vs ' + h2 + ')');
      var inLater = items.filter(function (el) { return el.classList.contains('is-in'); });
      ok(inLater.length === 1, 'still exactly one word marked visible, got ' + inLater.length);
      ok(inLater[0] && inLater[0].textContent !== first,
        'word advanced from "' + first + '" to "' + (inLater[0] ? inLater[0].textContent : '') + '"');
      stage2();
    }, 3400);
  } else {
    setTimeout(stage2, 50);
  }

  function stage2() {
    /* 4. reveal ----------------------------------------------------------
       The IntersectionObserver adds .is-visible once a target enters the
       viewport. CSS then transitions it to opaque, but that transition relies
       on a compositor clock that freezes under --virtual-time-budget, so the
       thing to assert here is the class state, which is the deterministic
       part the JS actually controls. */
    var reveals = [].slice.call(doc.querySelectorAll('[data-reveal]'));
    var hidden = reveals.filter(function (el) { return !el.classList.contains('is-visible'); });
    ok(hidden.length === 0, reveals.length + ' reveal targets, ' + hidden.length + ' without the visible class');
    ok(doc.documentElement.classList.contains('js'), 'js class set on html');
    finish(log.length ? log.join(' || ') : 'OK');
  }
`;

function harness(target) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>html,body{margin:0}iframe{display:block;width:1280px;height:900px;border:0}</style></head>
<body>
<iframe id="f" src="${target}"></iframe>
<script>
function finish(msg) {
  if (document.getElementById('__result')) return;
  var t = document.createElement('title');
  t.id = '__result';
  t.textContent = msg;
  document.head.appendChild(t);
}
function run() {
  var frame = document.getElementById('f');
  var win = frame.contentWindow;
  var doc = win.document;
  try {
${SCRIPT}
  } catch (e) {
    finish('SCRIPT ERROR ' + e.message);
  }
}
  document.getElementById('f').addEventListener('load', function () { setTimeout(run, 700); });
setTimeout(function () { finish('TIMEOUT'); }, 30000);
</script>
</body></html>
`;
}

const fileUrl = (p) => 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20');

const targets = process.argv.slice(2);
const list = targets.length ? targets : ['index.html', 'gothic-dark/index.html', 'blog/index.html', 'blog/how-to-paint-3d-prints/index.html', 'terms/index.html'];

let failures = 0;
for (const relPath of list) {
  const file = path.join(ROOT, relPath.split('/').join(path.sep));
  const temp = path.join(ROOT, '__behaviour.html');
  fs.writeFileSync(temp, harness(fileUrl(file)), 'utf8');
  let dom = '';
  try {
    dom = execFileSync(CHROME, [
      '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
      '--allow-file-access-from-files', '--virtual-time-budget=30000',
      '--window-size=1360,1000', '--dump-dom', fileUrl(temp),
    ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 40 * 1024 * 1024, timeout: 60000 });
  } catch (e) {
    console.log('FAIL  ' + relPath + ' (chrome error)');
    failures++;
    fs.unlinkSync(temp);
    continue;
  }
  fs.unlinkSync(temp);
  const m = dom.match(/<title id="__result">([\s\S]*?)<\/title>/);
  const res = m ? m[1] : 'PROBE DID NOT RUN';
  if (res === 'OK') {
    console.log('  ok  ' + relPath);
  } else {
    failures++;
    console.log('FAIL  ' + relPath);
    for (const line of res.split(' || ')) console.log('        ' + line);
  }
}

console.log('');
console.log(failures ? failures + ' page(s) failed the behaviour audit' : 'behaviour audit passed');
process.exit(failures ? 1 : 0);
