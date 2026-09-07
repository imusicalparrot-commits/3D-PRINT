/* assign.js — assigns passed_links.txt slugs to final site pages. */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const raw = fs.readFileSync(path.join(ROOT, 'passed_links.txt'), 'utf8')
  .split('\n').map(s => s.trim()).filter(Boolean);

const slugOf = (u) => u.split('/product/')[1].replace(/\/.*$/, '');

// Priority-ordered rules. First matching keyword wins.
const RULES = [
  ['halloween', ['halloween', 'helloween', 'spooky', 'ghost', 'witch', 'cauldron', 'skeleton', 'skull', 'pumpkin', 'skull-unicorn']],
  ['dragons-fantasy', ['unicorn-skeleton', 'dragon', 'phoenix-x', 'fantasy', 'fairy', 'magical', 'unicorn']],
  ['christmas', ['christmas', 'santa', 'reindeer', 'snowman', 'nutcracker', 'winter', 'elf-', '-elf', 'angel', 'merry', 'ornament', 'deer']],
  ['easter', ['easter', 'bunny', '-egg', 'egg-', 'gnome', 'spring', 'cherry-blossom', 'sakura', 'farm-animals', 'rabbit']],
  ['valentine', ['valentine', 'love-you', 'heart', 'rose', 'wedding', 'dress', 'bride']],
  ['gothic-dark', ['gothic', 'coffin', 'cathedral', 'rococo', 'vintage', 'art-nouveau']],
  ['kawaii-cute', ['kawaii', 'chibi', 'owl', 'penguin']],
  ['lamps-lights', ['candle', 'night-light', 'light-stand', 'lamp', 'wind-spinner', 'led', 'light-house', 'lighthouse']],
  ['decor-planters', ['planter', '-pot', 'pot-', 'vase', 'succulent', 'cactus', 'monstera']],
  ['flexi-toys', ['articulated', 'flexi', 'flexible', 'print-in-place', 'snake', 'axolotl', 'gecko', 'octopus', 'stingray', 'hedgehog', 'starfish', 'fidget', 'toy', 'alphabet', 'letters', 'school', 'graduation', 'planner', 'musical', 'bead']],
  ['organizers', ['holder', 'organizer', 'cradle', 'tray', 'coaster', '-box', 'box-', 'bowl', 'vanity', 'shelf', 'stand', 'tumbler', 'container', 'gift-box']],
  ['keychains-accessories', ['keychain', 'badge', 'earring', 'clay-cutter', 'cookie-cutter', 'cutter', 'bookmark', 'magnet', 'bow', 'ribbon', 'backpack', 'key-tag', 'topper', 'rolling-pin', 'embossing', 'texture-roller']],
  ['decor-planters', ['figurine', 'statue', 'decor', 'birdhouse', 'castle', 'animal', 'cat', 'dog', 'elephant', 'capybara', 'alien', 'mermaid', 'bull', 'duck', 'cow', 'horse', 'balloon', 'home', 'sign', 'bicycle', 'diamond', 'gemstone', 'mug', 'tree', 'cup', 'creature', 'house']],
];

function pageOf(slug) {
  for (const [page, kws] of RULES) {
    for (const kw of kws) {
      if (slug.includes(kw)) return page;
    }
  }
  return 'decor-planters';
}

const pages = {};
const urlsBySlug = {};
for (const u of raw) {
  const s = slugOf(u);
  const p = pageOf(s);
  (pages[p] = pages[p] || []).push(s);
  urlsBySlug[s] = u;
}

const out = { pages, urlsBySlug, order: raw.map(slugOf) };
fs.writeFileSync(path.join(ROOT, '_assignment.json'), JSON.stringify(out, null, 2));

let total = 0;
for (const [p, list] of Object.entries(pages)) { total += list.length; console.log(p.padEnd(24), list.length); }
console.log('TOTAL', total, 'of', raw.length);
