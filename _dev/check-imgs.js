/* check-imgs.js — verifies every assets/img/ reference in built HTML exists on disk */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
let total = 0, missing = [];
function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    if (f === '.git' || f === '_dev' || f === 'assets') continue;
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (f === 'index.html') {
      const s = fs.readFileSync(p, 'utf8');
      const re = /assets\/img\/([^"']+)/g;
      let m;
      while ((m = re.exec(s))) {
        total++;
        if (!fs.existsSync(path.join(ROOT, 'assets', 'img', m[1]))) missing.push(m[1]);
      }
    }
  }
}
walk(ROOT);
console.log('total img refs:', total);
console.log('missing:', missing.length);
missing.slice(0, 15).forEach(x => console.log(' -', x));
