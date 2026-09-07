/* rename-imgs.js — strips %XX emoji tokens from image filenames (browser decodes them -> 404) */
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'assets', 'img');
for (const f of fs.readdirSync(DIR)) {
  if (!/%[0-9A-Fa-f]{2}/.test(f)) continue;
  const ext = path.extname(f);
  let clean = f.slice(0, -ext.length)
    .replace(/%[0-9A-Fa-f]{2}/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '') + ext;
  fs.renameSync(path.join(DIR, f), path.join(DIR, clean));
  console.log(f, '->', clean);
}
console.log('done');
