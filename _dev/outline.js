/* outline.js - print the visible heading + section outline of a page */
'use strict';

const fs = require('fs');
const path = require('path');

const file = process.argv[2] || 'index.html';
const html = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

const clean = (s) => s
  .replace(/<svg[\s\S]*?<\/svg>/g, '')
  .replace(/<span class="rotator"[\s\S]*?<\/span>\s*<\/span>/g, '[rotating word]')
  .replace(/<span class="vh">[\s\S]*?<\/span>/g, '')
  .replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&middot;/g, '.')
  .replace(/&#39;/g, "'")
  .replace(/\s+/g, ' ')
  .trim();

const marks = [];
const re = /<(section|h1|h2|h3|figcaption|p class="lede"|p class="footer-statement"|dl class="colophon"|div class="catalogue-grid"|div class="index-list"|div class="picks-scroll"|div class="guide-list"|article class="prose")\b[^>]*>/g;
let m;
while ((m = re.exec(html)) !== null) marks.push({ tag: m[1], at: m.index });

for (const mk of marks) {
  if (/^h[123]$/.test(mk.tag)) {
    const end = html.indexOf('</' + mk.tag + '>', mk.at);
    const body = clean(html.slice(mk.at, end));
    const indent = { h1: '', h2: '  ', h3: '    ' }[mk.tag];
    console.log(indent + mk.tag.toUpperCase() + '  ' + body);
  } else if (mk.tag === 'section') {
    const cls = (html.slice(mk.at, mk.at + 120).match(/class="([^"]*)"/) || [])[1] || '';
    console.log('\n[section ' + cls + ']');
  } else if (mk.tag.startsWith('p class="lede"')) {
    const end = html.indexOf('</p>', mk.at);
    console.log('    lede: ' + clean(html.slice(mk.at, end)).slice(0, 110));
  } else if (mk.tag.startsWith('p class="footer-statement"')) {
    const end = html.indexOf('</p>', mk.at);
    console.log('  statement: ' + clean(html.slice(mk.at, end)));
  } else if (mk.tag.startsWith('figcaption')) {
    const end = html.indexOf('</figcaption>', mk.at);
    console.log('    caption: ' + clean(html.slice(mk.at, end)));
  } else {
    const kind = mk.tag.split('"')[1];
    const counts = {
      'catalogue-grid': (html.match(/class="cat-item"/g) || []).length + ' model cells',
      'index-list': null,
      'picks-scroll': (html.match(/class="pick"/g) || []).length + ' picks',
      'guide-list': null,
      colophon: (html.match(/<div><dt>/g) || []).length + ' facts',
    }[kind];
    console.log('    [' + kind + (counts ? ': ' + counts : '') + ']');
  }
}
