/* peek.js - print a slice of a generated page for eyeballing the markup */
const fs = require('fs');
const path = require('path');

const file = process.argv[2] || 'gothic-dark/index.html';
const marker = process.argv[3] || '<main id="main">';
const len = Number(process.argv[4] || 3200);

const html = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const i = marker === 'ALL' ? 0 : html.indexOf(marker);
if (i < 0) {
  console.log('marker not found: ' + marker);
  process.exit(0);
}
console.log(html.slice(i, i + len));
