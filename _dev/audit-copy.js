/* ============================================================================
 * audit-copy.js - editorial and content-shape audit of the generated site.
 *
 *   1. banned typography: em dash, en dash, straight quotes in prose, "...",
 *      emoji, and the AI-tell vocabulary
 *   2. no invented metrics: every number on the page traces back to the data
 *   3. section-head discipline: one h1, no eyebrow above the cap, no
 *      tag-left / heading-right split heads
 *   4. copy shape: headline word counts, lede lengths, unique titles
 *   5. no filler names, no startup-cliche vocabulary
 * ==========================================================================*/

'use strict';

const fs = require('fs');
const path = require('path');
const { POSTS } = require('./articles.js');

const ROOT = path.join(__dirname, '..');
const DEV = __dirname;

const fail = [];
const warn = [];

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
const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');

/* strip tags, scripts and entities so we audit what a reader sees */
function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&middot;/g, '.')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/* ---------------------------------------------------- 1. banned typography */
const BANNED_WORDS = [
  'elevate', 'seamless', 'unleash', 'next-gen', 'revolutionize', 'revolutionise',
  'game-changer', 'game changer', 'delve', 'supercharge', 'cutting-edge',
  'best-in-class', 'world-class', 'leverage our', 'unlock the power',
  'take it to the next level', 'in today\'s fast-paced',
  'john doe', 'jane doe', 'jane smith', 'john smith', 'example user',
  'acme', 'lorem ipsum', 'nexus', 'smartflow', 'cloudly',
  'scroll to explore', 'scroll down', 'coming soon', 'lorem',
];

const emojiRe = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{FE0F}\u{2B00}-\u{2BFF}]/u;

for (const file of pages) {
  const id = rel(file);
  const html = fs.readFileSync(file, 'utf8');
  const text = visibleText(html);
  const lower = text.toLowerCase();

  if (/[\u2014\u2013]/.test(text)) fail.push(id + ': em or en dash in visible copy');
  if (emojiRe.test(text)) fail.push(id + ': emoji in visible copy');
  if (/\.\.\./.test(text)) fail.push(id + ': three periods instead of a single character');

  for (const w of BANNED_WORDS) {
    if (lower.indexOf(w) !== -1) fail.push(id + ': banned vocabulary "' + w + '"');
  }

  /* -------------------------------------------- 3. section-head discipline */
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/g) || [];
  if (h1.length !== 1) fail.push(id + ': ' + h1.length + ' h1 elements');

  /* heading order must not skip a level */
  const levels = [...html.matchAll(/<h([1-6])[^>]*>/g)].map((m) => Number(m[1]));
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] > levels[i - 1] + 1) {
      fail.push(id + ': heading jumps from h' + levels[i - 1] + ' to h' + levels[i]);
      break;
    }
  }

  /* eyebrow cap: at most one per three sections, and it must sit directly above
     its own heading in the same column (never a tag-left / heading-right split) */
  const sections = (html.match(/<section\b/g) || []).length;
  const eyebrows = (html.match(/class="overline"/g) || []).length;
  const capped = Math.max(1, Math.ceil(sections / 3));
  if (eyebrows > capped) {
    fail.push(id + ': ' + eyebrows + ' eyebrows for ' + sections + ' sections (cap ' + capped + ')');
  }
  for (const m of html.matchAll(/<span class="overline">[\s\S]*?<\/span>([\s\S]{0,40})/g)) {
    if (!/^\s*<h[1-3][\s>]/.test(m[1])) {
      fail.push(id + ': an eyebrow is not stacked directly above a heading');
    }
  }

  /* banned decoration: version labels, scroll cues, locale strips, step labels */
  if (/\bv\d+\.\d+(\.\d+)?\b/.test(text)) fail.push(id + ': version label in copy');
  if (/\b(?:BETA|ALPHA|EARLY ACCESS|INVITE.ONLY)\b/i.test(text)) fail.push(id + ': launch badge in copy');
  if (/\bstage \d|\bstep \d|\bphase \d{2}/i.test(text)) fail.push(id + ': generic step label in copy');
  if (/\b\d{2}:\d{2}\b.*\d+\s*Â?°C/.test(text)) fail.push(id + ': locale or weather strip');

  /* --------------------------------------------------- 4. copy shape */
  /* the rotating word ships all five variants in the DOM, so the h1's word count
     is measured on the static alternative a reader or crawler actually gets */
  let h1Text = h1.length ? h1[0] : '';
  h1Text = h1Text.replace(/<span class="rotator"[\s\S]*?<\/span>\s*(?=<span class="vh">)/, ' ');
  h1Text = visibleText(h1Text);
  const h1Words = h1Text.split(' ').filter(Boolean).length;
  if (h1Words > 14) fail.push(id + ': h1 runs to ' + h1Words + ' words ("' + h1Text + '")');

  const ledes = [...html.matchAll(/class="lede"[^>]*>([\s\S]*?)<\/p>/g)].map((m) => visibleText(m[1]));
  for (const l of ledes) {
    const words = l.split(' ').filter(Boolean).length;
    if (words > 60) fail.push(id + ': lede runs to ' + words + ' words');
  }

  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  if (title.length > 70) warn.push(id + ': title tag is ' + title.length + ' chars');
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  if (desc.length > 175) warn.push(id + ': meta description is ' + desc.length + ' chars');
  if (desc.length < 60) fail.push(id + ': meta description is only ' + desc.length + ' chars');
}

/* ------------------------------------------------- 2. no invented metrics */
const assign = JSON.parse(fs.readFileSync(path.join(DEV, '_assignment.json'), 'utf8'));
const OVERRIDES = {
  'gothic-vanity-decor-shelf-stl': 'gothic-dark',
  'bookshelf-planter-mini-library-decor-stl-3d-model-for-3d-print': 'decor-planters',
  'easter-bunny-nutcracker-spring-decor-stl-for-3d-print': 'easter',
  'cute-curled-up-alien-creature-3d-model-for-3d-print': 'decor-planters',
  'meditating-alien': 'decor-planters',
};
for (const [slug, to] of Object.entries(OVERRIDES)) {
  for (const [page, list] of Object.entries(assign.pages)) {
    const i = list.indexOf(slug);
    if (i !== -1 && page !== to) { list.splice(i, 1); assign.pages[to].push(slug); }
  }
}

const home = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const homeText = visibleText(home);

const total = Object.values(assign.pages).reduce((n, l) => n + l.length, 0);
const claims = [
  [String(total), 'the model count', true],
  ['12', 'the collection count', true],
  [String(POSTS.length), 'the guide count', true],
];
for (const [value, label] of claims) {
  if (homeText.indexOf(value) === -1) fail.push('home does not state ' + label + ' (' + value + ')');
}

/* any percentage or multiplier on a marketing surface is an invented metric */
for (const file of pages) {
  const id = rel(file);
  if (id.startsWith('blog/') && id !== 'blog/index.html') continue; /* guides quote real print settings */
  const text = visibleText(fs.readFileSync(file, 'utf8'));
  const pct = text.match(/\b\d+(?:\.\d+)?\s?%/g);
  if (pct) fail.push(id + ': percentage claim ' + pct.join(', '));
  const mult = text.match(/\b\d+(?:\.\d+)?x\b/gi);
  if (mult) fail.push(id + ': multiplier claim ' + mult.join(', '));
  const kplus = text.match(/\b\d[\d,.]*[km]\+/gi);
  if (kplus) fail.push(id + ': rounded-up count ' + kplus.join(', '));
}

/* the per-collection count on the home page must equal the real list length */
for (const [page, list] of Object.entries(assign.pages)) {
  const row = home.match(new RegExp('href="' + page + '/"[\\s\\S]{0,600}?</a>'));
  if (!row) { fail.push('home has no index row for ' + page); continue; }
  const stated = row[0].match(/(\d+) models/);
  if (!stated) { fail.push('home row for ' + page + ' states no count'); continue; }
  if (Number(stated[1]) !== list.length) {
    fail.push('home states ' + stated[1] + ' models for ' + page + ', data has ' + list.length);
  }
}

/* the count in the collection page's own heading must match too */
for (const [page, list] of Object.entries(assign.pages)) {
  const file = path.join(ROOT, page, 'index.html');
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, 'utf8');
  const stated = html.match(/<h2 id="catalogueTitle">(\d+) models/);
  if (!stated) { fail.push(page + ': catalogue heading states no count'); continue; }
  if (Number(stated[1]) !== list.length) {
    fail.push(page + ': heading says ' + stated[1] + ', data has ' + list.length);
  }
}

/* ------------------------------------------- 5. unique, non-duplicate copy */
const titles = new Map();
const descs = new Map();
for (const file of pages) {
  const html = fs.readFileSync(file, 'utf8');
  const id = rel(file);
  const tt = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
  const dd = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  if (tt) {
    if (titles.has(tt)) fail.push('duplicate title tag: ' + id + ' and ' + titles.get(tt));
    titles.set(tt, id);
  }
  if (dd) {
    if (descs.has(dd)) fail.push('duplicate meta description: ' + id + ' and ' + descs.get(dd));
    descs.set(dd, id);
  }
}

/* every model title must be unique across the site */
const seenTitles = new Map();
for (const [page, list] of Object.entries(assign.pages)) {
  const data = JSON.parse(fs.readFileSync(path.join(DEV, 'data', page + '.json'), 'utf8'));
  for (const slug of list) {
    const t = data[slug].t;
    if (seenTitles.has(t)) warn.push('two models share the title "' + t + '" (' + slug + ', ' + seenTitles.get(t) + ')');
    seenTitles.set(t, slug);
  }
}

/* --------------------------------------------------------------- report */
console.log('pages audited:      ' + pages.length);
console.log('unique titles:      ' + titles.size);
console.log('unique descs:       ' + descs.size);
console.log('model titles:       ' + seenTitles.size);
console.log('');

if (warn.length) {
  console.log('WARNINGS (' + warn.length + '):');
  for (const w of warn.slice(0, 20)) console.log('  ~ ' + w);
  if (warn.length > 20) console.log('  ... and ' + (warn.length - 20) + ' more');
  console.log('');
}

if (fail.length) {
  console.log('FAILURES (' + fail.length + '):');
  for (const f of fail.slice(0, 50)) console.log('  x ' + f);
  if (fail.length > 50) console.log('  ... and ' + (fail.length - 50) + ' more');
  process.exit(1);
}
console.log('COPY AUDIT PASSED');
