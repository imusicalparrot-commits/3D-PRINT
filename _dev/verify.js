/* verify.js — confirm assignment slugs match data files (with overrides). */
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const a = JSON.parse(fs.readFileSync(path.join(ROOT, '_assignment.json'), 'utf8'));

const OVERRIDES = {
  'gothic-vanity-decor-shelf-stl': 'gothic-dark',
  'bookshelf-planter-mini-library-decor-stl-3d-model-for-3d-print': 'decor-planters',
  'easter-bunny-nutcracker-spring-decor-stl-for-3d-print': 'easter',
  'cute-curled-up-alien-creature-3d-model-for-3d-print': 'decor-planters',
  'meditating-alien': 'decor-planters',
};

// apply overrides
for (const [slug, to] of Object.entries(OVERRIDES)) {
  for (const [page, list] of Object.entries(a.pages)) {
    const i = list.indexOf(slug);
    if (i !== -1 && page !== to) { list.splice(i, 1); a.pages[to].push(slug); }
  }
}

let problems = 0, total = 0;
for (const [page, list] of Object.entries(a.pages)) {
  const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', page + '.json'), 'utf8'));
  const keys = Object.keys(data);
  const missing = list.filter(s => !data[s]);
  const extra = keys.filter(k => !list.includes(k));
  total += list.length;
  if (missing.length || extra.length) {
    problems++;
    console.log(`\n[${page}] assigned=${list.length} data=${keys.length}`);
    if (missing.length) console.log('  MISSING in data:', missing);
    if (extra.length) console.log('  EXTRA in data (not assigned):', extra);
  } else {
    console.log(`[${page}] OK (${list.length})`);
  }
}
console.log(`\nTOTAL assigned: ${total}`);
console.log(problems ? `\n${problems} page(s) with problems.` : '\nAll pages consistent.');
