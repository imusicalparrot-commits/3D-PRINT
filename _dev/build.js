/* build.js — Filament Finds (ShopVibe v3): pages + blog + legal */
const fs = require('fs');
const path = require('path');
const DEV = __dirname;                 // _dev/ — build tools and data live here
const ROOT = path.join(DEV, '..');     // site root — HTML and assets live here

const a = JSON.parse(fs.readFileSync(path.join(DEV, '_assignment.json'), 'utf8'));
const OVERRIDES = {
  'gothic-vanity-decor-shelf-stl': 'gothic-dark',
  'bookshelf-planter-mini-library-decor-stl-3d-model-for-3d-print': 'decor-planters',
  'easter-bunny-nutcracker-spring-decor-stl-for-3d-print': 'easter',
  'cute-curled-up-alien-creature-3d-model-for-3d-print': 'decor-planters',
  'meditating-alien': 'decor-planters',
};
for (const [slug, to] of Object.entries(OVERRIDES)) {
  for (const [page, list] of Object.entries(a.pages)) {
    const i = list.indexOf(slug);
    if (i !== -1 && page !== to) { list.splice(i, 1); a.pages[to].push(slug); }
  }
}

const BRAND = '3D PRINT';
const AFF = 'https://rzekl.com/g/1e8d11449451da3d44eb16525dc3e8/?ulp=https%3A%2F%2Fwww.aliexpress.com%2Fw%2Fwholesale-3D-Printer.html';
const REL = 'target="_blank" rel="nofollow sponsored noopener noreferrer"';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// image resolution: actual files in assets/img/ (prefer .webp); slug normalized same way as filenames
const cleanSlug = (s) => s.replace(/%[0-9A-Fa-f]{2}/g, '').replace(/-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
const IMG_EXT = {};
{
  const imgDir = path.join(ROOT, 'assets', 'img');
  if (fs.existsSync(imgDir)) {
    for (const f of fs.readdirSync(imgDir)) {
      const m = f.match(/^(.+)\.(webp|png|jpe?g)$/i);
      if (!m) continue;
      const slug = cleanSlug(m[1]);
      const ext = m[2].toLowerCase() === 'jpeg' ? 'jpg' : m[2].toLowerCase();
      const rank = { webp: 0, png: 1, jpg: 2 }[ext] || 3;
      if (!(slug in IMG_EXT) || rank < IMG_EXT[slug].r) IMG_EXT[slug] = { ext, r: rank };
    }
  }
}
const imgFile = (slug) => {
  const key = cleanSlug(slug);
  return (IMG_EXT[key] ? key + '.' + IMG_EXT[key].ext : key + '.webp');
};

// affiliate ref + per-product intro lines
const REF = '16881082';
const pfUrl = (u) => u.replace(/\/+$/, '') + '/ref/' + REF + '/';
const INTROS = JSON.parse(fs.readFileSync(path.join(DEV, 'data', 'intros.json'), 'utf8'));

const DATA = {};
const data = (page) => {
  if (!DATA[page]) DATA[page] = JSON.parse(fs.readFileSync(path.join(DEV, 'data', page + '.json'), 'utf8'));
  return DATA[page];
};

const META = {
  'christmas': { dir: 'christmas', name: 'Christmas & Winter', emoji: '🎄',
    blurb: 'Trees, reindeer, angels and nutcrackers to print and display the whole season through.',
    intro: 'From low-poly reindeer to layered light stands, these prints bring the season indoors without the plastic-bin look. Mix matte whites, walnut browns, and a single bold red for a palette that feels considered. Most pieces need no supports and make an easy weekend project for the tree, the mantel, or a teacher gift.' },
  'halloween': { dir: 'halloween', name: 'Halloween & Spooky', emoji: '🎃',
    blurb: 'Ghosts, skulls, cauldrons and straw toppers for a party that feels designed.',
    intro: 'Creepy can still be tasteful. These models lean into restraint: layered silhouettes, soft candle glow, and a few kawaii monsters for the younger crowd. Print them in near-black with one glowing accent, or go full pastel-skull for a friendlier fright. Every piece is sized for a shelf, a straw, or a candy bowl.' },
  'easter': { dir: 'easter', name: 'Easter & Spring', emoji: '🐰',
    blurb: 'Bunnies, eggs, gnomes and blossom coasters for the first warm weeks.',
    intro: 'Soft pastels and rounded forms define the spring shelf. These bunnies, eggs, and gnomes print quickly and read sweet rather than saccharine, and the blossom coasters carry the season straight to the coffee table. A good intro to two-tone printing if you want petals that pop.' },
  'valentine': { dir: 'valentine', name: "Valentine's & Wedding", emoji: '💝',
    blurb: 'Roses, hearts, and bridal vanity pieces for love in every season.',
    intro: 'A small but heartfelt set of prints for gifting and the vanity alike. The 3D roses never wilt, the heart dishes catch the little things, and the dress-shaped holders make a wedding morning feel like a photo. Keep it to one or two tones for a look that reads romantic, not busy.' },
  'dragons-fantasy': { dir: 'dragons-fantasy', name: 'Dragons & Fantasy', emoji: '🐉',
    blurb: 'Articulated dragons, fairy shelves, and mythic holders for the collectors.',
    intro: 'This is where 3D printing shows off. Print-in-place articulated dragons, hatching eggs, and tiny fairy shelves turn a shelf into a small exhibit. The jointed models come off the bed ready to pose, which is half the fun. Fantasy lovers will find a centerpiece and a dozen desk companions here.' },
  'flexi-toys': { dir: 'flexi-toys', name: 'Flexi Toys & Learning', emoji: '🧸',
    blurb: 'Articulated animals, alphabet beads, and planners for kids and makers.',
    intro: 'Fidget-friendly and classroom-friendly in equal measure. The articulated creatures flex right off the bed, the letter beads and planner tiles make learning tactile, and the whole set prints in harmless, playful colors. These are the models people actually pick up and never put down.' },
  'lamps-lights': { dir: 'lamps-lights', name: 'Lamps & Night Lights', emoji: '🕯️',
    blurb: 'Layered light stands, night-light puzzles, and spinning decor.',
    intro: 'Light changes everything, and these prints are built to glow. Layered panels throw soft silhouettes across a wall; spinning and water-lily forms make calm bedside companions. Drop in a tea light or a small LED and let the cutouts do the work. Quiet, warm, and surprisingly grown-up.' },
  'organizers': { dir: 'organizers', name: 'Desk & Home Organizers', emoji: '🗂️',
    blurb: 'Phone stands, brush holders, trays, and coasters that earn their spot.',
    intro: 'The prints you use every day. Phone stands, brush holders, and catch-all trays keep surfaces calm, while themed coasters and badge reels add a little personality. Most are quick, single-material jobs that pay back in daily order. Practical first, characterful second.' },
  'keychains-accessories': { dir: 'keychains-accessories', name: 'Keychains & Craft Tools', emoji: '🔑',
    blurb: 'Keychains, badge reels, clay cutters and rollers for makers.',
    intro: 'A big, maker-minded drawer of small prints. Keychains and badge toppers for gifting, plus a deep set of clay and cookie cutters for the craft table. The floral earring cutters alone cover a whole jewelry line. Functional, batchable, and easy to test in one sitting.' },
  'decor-planters': { dir: 'decor-planters', name: 'Decor, Planters & Figurines', emoji: '🪴',
    blurb: 'Planters, statues, signs and whimsical figures for the home.',
    intro: 'Characters and calm objects for shelves, windowsills, and the reading nook. Planters with personality, gentle statues, and a few internet-famous figurines round out a home that feels collected rather than decorated. These are the slow, satisfying prints you keep on display.' },
  'gothic-dark': { dir: 'gothic-dark', name: 'Gothic & Dark Aesthetic', emoji: '🦇',
    blurb: 'Coffin brush holders, rococo vanities, and shadowed trinket dishes.',
    intro: 'A moody little corner of the catalog for darker shelves and vanities. Coffin and cathedral brush holders, rococo scrollwork, and shadowed trinket dishes lean romantic-gothic rather than costume. Print in near-black or deep oxblood for the full effect.' },
  'kawaii-cute': { dir: 'kawaii-cute', name: 'Kawaii & Cute', emoji: '🌸',
    blurb: 'Sleepy cats, baby owls, and cloud holders with big, soft charm.',
    intro: 'Maximum cozy. Round baby owls, sleeping dinos, and cloud brush holders trade detail for pure warmth. These are the desk companions that make people smile on a hard day, and they print fast in a single pastel tone. Impossible not to like.' },
};

const ORDER = ['christmas','halloween','easter','valentine','dragons-fantasy','flexi-toys','lamps-lights','organizers','keychains-accessories','decor-planters','gothic-dark','kawaii-cute'];

// short text codes for nav/cards (no emojis — Verdana Health is calm, typographic)
const SHORT = {
  'christmas': 'XMAS', 'halloween': 'HWEN', 'easter': 'EAST', 'valentine': 'VAL',
  'dragons-fantasy': 'DRGN', 'flexi-toys': 'FLXI', 'lamps-lights': 'LAMP',
  'organizers': 'ORG', 'keychains-accessories': 'KEY', 'decor-planters': 'DECO',
  'gothic-dark': 'GOTH', 'kawaii-cute': 'KAWA'
};

const DATE = '2026-09-04';
const { POSTS, BODY } = require('./articles');
const READING = {
  'christmas': ['3d-print-christmas-gifts-ideas', 'bed-adhesion-first-layer-fixes', 'multicolor-printing-without-ams'],
  'halloween': ['halloween-props-you-can-print', 'print-in-place-how-it-works', 'how-to-paint-3d-prints'],
  'easter': ['easter-crafts-to-print-with-kids', 'multicolor-printing-without-ams', 'how-to-paint-3d-prints'],
  'valentine': ['valentines-3d-print-gifts', 'how-to-paint-3d-prints', 'bed-adhesion-first-layer-fixes'],
  'dragons-fantasy': ['supports-when-and-how', 'print-in-place-how-it-works', 'how-to-paint-3d-prints'],
  'flexi-toys': ['print-in-place-how-it-works', 'fdm-vs-resin-which-printer-first', 'your-first-week-of-3d-printing'],
  'lamps-lights': ['supports-when-and-how', 'print-speed-vs-quality', 'safe-3d-printing-at-home'],
  'organizers': ['slicer-settings-that-matter', 'pla-petg-abs-filament-guide', 'how-to-store-filament'],
  'keychains-accessories': ['bed-adhesion-first-layer-fixes', 'print-speed-vs-quality', 'fdm-vs-resin-which-printer-first'],
  'decor-planters': ['how-to-paint-3d-prints', 'pla-petg-abs-filament-guide', 'stringing-warping-troubleshooting'],
  'gothic-dark': ['how-to-paint-3d-prints', 'stringing-warping-troubleshooting', 'supports-when-and-how'],
  'kawaii-cute': ['multicolor-printing-without-ams', 'safe-3d-printing-at-home', 'how-to-paint-3d-prints'],
};
const FEATURED = ['how-to-prepare-a-3d-model-for-printing', 'print-in-place-how-it-works', 'your-first-week-of-3d-printing'];

const TIPS = [
  { h: 'PLA first, exotic later',
    p: 'For shelf decor and toys, plain PLA is the honest answer: cheap, matte and dimensionally stable. Save PETG for holders that live in sunlight or cars, and resin for when you genuinely need micro-detail. The slicer matters more than the spool — see the software guide.',
    link: { href: 'blog/3d-printing-software-explained/', text: 'Software, explained' } },
  { h: 'Why articulated dragons need no assembly',
    p: 'Print-in-place joints are modeled with micro-gaps between links, so the printer lays down a hinge that is already connected and already free. The secret is a well-calibrated first layer — then you can pick anything from the flexi collection and it just moves.',
    link: { href: 'flexi-toys/', text: 'Flexi Toys & Learning' } },
  { h: 'The 15-minute finish that upgrades decor prints',
    p: 'A quick pass at 220-grit, one thin coat of filler primer, matte paint from a rattle can. That is the whole ritual. It works identically on planters, seasonal figurines and gothic vanity pieces — the texture stops screaming "3D print" and starts reading "object".',
    link: { href: 'decor-planters/', text: 'Decor & Planters' } },
];

const arrowSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>';
const arrowDownSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14"/><path d="M6 13l6 6 6-6"/></svg>';
const chevSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const plusSvg = '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M7.33 16V0h1.34v16H7.33z"/><path d="M0 7.33V8.67h16V7.33H0z"/></svg>';
const xSvg = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M2 2l12 12M14 2L2 14"/></svg>';
const layersSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2l10 6-10 6L2 8l10-6z"/><path d="M2 14l10 6 10-6"/></svg>';
const boxSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><path d="M3.3 8.3L12 13l8.7-4.7"/><path d="M12 22V13"/></svg>';
const linkSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>';

function phSvg(page) {
  const m = META[page];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#F8FAFC"/>
  <rect x="280" y="170" width="240" height="240" fill="none" stroke="#0F172A" stroke-width="2" opacity=".4"/>
  <text x="400" y="400" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="30" font-weight="700" fill="#0F172A" text-anchor="middle">${esc(m.name)}</text>
  <text x="400" y="440" font-family="Fira Code, monospace" font-size="14" letter-spacing="3" fill="#94A3B8" text-anchor="middle">IMAGE LOADING</text>
</svg>`;
}

const headBlock = (aPre, title, desc) => `
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${aPre}assets/style.css">
<script src="${aPre}assets/site.js" defer></script>`;

const brandHtml = (aPre) => `<a class="brand" href="${aPre}"><span class="brand-mark">3D&nbsp;</span><span class="brand-accent">PRINT</span></a>`;

function header(aPre) {
  const ddItems = ORDER.map(p => `
          <a class="dd-item" href="${aPre}${META[p].dir}/">
            <span class="dd-ico">${SHORT[p]}</span>
            <span><b>${esc(META[p].name)}</b><span>${a.pages[p].length} models</span></span>
          </a>`).join('');
  return `  <header class="site-header">
    <div class="wrap header-row">
      ${brandHtml(aPre)}
      <nav class="nav-menu" aria-label="Main">
        <div class="dd">
          <button class="dd-btn" type="button">Themes ${chevSvg}</button>
          <div class="dd-panel">
            <div class="dd-card">${ddItems}
          </div>
        </div>
        </div>
        <div class="dd"><a class="dd-btn" href="${aPre}blog/">Blog</a></div>
        <button class="burger" id="burgerBtn" aria-expanded="false" aria-controls="mobileNav" aria-label="Menu">
          <span class="burger-label">Menu</span>
          <span class="burger-icon">${plusSvg}</span>
        </button>
      </nav>
    </div>
  </header>
  <nav class="mnav" id="mobileNav" aria-hidden="true">
    <div class="mnav-overlay" data-mnav-close></div>
    <div class="mnav-panel">
      <div class="mnav-layer l2"></div>
      <div class="mnav-layer l3"></div>
      <div class="mnav-layer l1"></div>
      <div class="mnav-top">
        ${brandHtml(aPre)}
        <button class="mnav-close" data-mnav-close aria-label="Close menu">${xSvg}</button>
      </div>
      <ul class="mnav-list">
        <li style="--i:0"><a href="${aPre}">Home <span class="cnt">START</span></a></li>
        <li style="--i:1"><a href="${aPre}blog/">Blog <span class="cnt">GUIDES</span></a></li>
        <li class="mnav-sep" aria-hidden="true"></li>
${ORDER.map((p, i) => `        <li style="--i:${i + 2}"><a href="${aPre}${META[p].dir}/">${META[p].name} <span class="cnt">${a.pages[p].length}</span></a></li>`).join('\n')}
      </ul>
    </div>
  </nav>`;
}

function footer(aPre) {
  return `  <footer class="site-footer">
    <div class="wrap">
      <div>
        <div class="f-brand">3D<b>PRINT</b></div>
        <p>A curated index of printable 3D models across the seasons and the home. Pick a theme, find a model, and start printing.</p>
        <div class="f-links">
          <a href="${aPre}">Home</a>
          <a href="${aPre}blog/">Blog</a>
          <a href="${aPre}privacy/">Privacy &amp; Cookies</a>
          <a href="${aPre}terms/">Terms of Use</a>
        </div>
      </div>
    </div>
  </footer>`;
}

function adRail(aPre) {
  return `    <aside class="ad-rail">
      <a class="card3d" href="${AFF}" ${REL} aria-label="Shop 3D printers on AliExpress">
        <span class="c3d-imgwrap"><img class="c3d-img" src="${aPre}assets/printer-ad.webp" alt="3D printers" loading="lazy" onerror="this.onerror=null;this.src='${aPre}assets/printer-ad.svg'"></span>
        <span class="c3d-shade"></span>
        <span class="c3d-content">
          <span class="c3d-head">
            <span>
              <h3>3D Printers</h3>
              <p>Filaments &amp; accessories too</p>
            </span>
            <span class="c3d-tag">AD</span>
          </span>
          <span class="c3d-pill">Shop printers →</span>
          <span class="c3d-dots"><i class="on"></i><i></i><i></i><i></i></span>
        </span>
      </a>
    </aside>`;
}

function jsonLd(page, list, aPre) {
  const d = data(page);
  const itemList = list.map((slug, i) => ({
    '@type': 'ListItem', position: i + 1,
    name: d[slug].t,
    url: pfUrl(a.urlsBySlug[slug]),
    image: `${aPre}assets/img/${imgFile(slug)}`
  }));
  return `<script type="application/ld+json">${JSON.stringify({ '@context':'https://schema.org','@type':'ItemList', itemListElement: itemList })}</script>`;
}

function productCard(slug, page, i, aPre) {
  const d = data(page)[slug];
  const url = pfUrl(a.urlsBySlug[slug]);
  const n = String(i + 1).padStart(2, '0');
  const intro = INTROS[slug] || 'A closer look at this model.';
  const tail = `Part of the ${META[page].name} set, it prints cleanly on a stock bed and works as well topping up a shelf as it does as a finished gift.`;
  const img = `${aPre}assets/img/${imgFile(slug)}`;
  const fallback = `${aPre}assets/ph-${page}.svg`;
  return `      <p class="p-intro"><b>№ ${n}</b> · ${esc(intro)} ${esc(tail)}</p>
      <article class="product">
        <a class="p-media" href="${url}" ${REL} aria-label="${esc(d.t)}">
          <img src="${img}" alt="${esc(d.t)}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${fallback}'">
          <span class="chip chip-num">${n}</span>
          <span class="chip chip-right">3D Model</span>
        </a>
        <div class="p-body">
          <h2 class="p-title"><a href="${url}" ${REL}>${esc(d.t)}</a></h2>
          <p class="p-meta">${esc(META[page].name)} · 3D Model</p>
          <p class="p-desc">${esc(d.d)}</p>
          <div class="p-foot">
            <a class="btn" href="${url}" ${REL}>Download Design${arrowSvg}</a>
          </div>
        </div>
      </article>`;
}

function postCard(p, href) {
  return `        <a class="post-card" href="${href}">
          <span class="post-meta">${p.read}</span>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.desc)}</p>
          <span class="post-more">Read article${arrowSvg}</span>
        </a>`;
}

function postRow(p, href) {
  return `        <a class="post-row" href="${href}">
          <span class="post-row-body"><b>${esc(p.title)}</b><span>${esc(p.desc)}</span></span>
          <span class="post-more">${arrowSvg}</span>
        </a>`;
}

function readNext(aPre, page) {
  const slugs = READING[page] || POSTS.slice(0, 3).map(p => p.slug);
  const picks = slugs.map(s => POSTS.find(p => p.slug === s)).filter(Boolean);
  return `      <section class="read-next">
        <div class="section-head"><h2>Useful reading</h2><p>Short, practical guides from the blog — the stuff worth knowing before your next print.</p></div>
        <div class="post-row-list">
${picks.map(p => postRow(p, `${aPre}blog/${p.slug}/`)).join('\n')}
        </div>
      </section>`;
}

// ---- placeholder SVGs ----
for (const p of ORDER) fs.writeFileSync(path.join(ROOT, 'assets', `ph-${p}.svg`), phSvg(p));

// deterministic per-page shuffle so every theme reads in a distinct visual order
function shuffleSeeded(arr, seed) {
  const a2 = arr.slice();
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  for (let i = a2.length - 1; i > 0; i--) {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
    const j = Math.abs(h) % (i + 1);
    [a2[i], a2[j]] = [a2[j], a2[i]];
  }
  return a2;
}

// ---- category pages ----
for (const page of ORDER) {
  const m = META[page];
  const list = shuffleSeeded(a.pages[page], page);
  const aPre = '../';
  const titleTag = `${m.name} — 3D Print Models | ${BRAND}`;
  const descTag = `${m.blurb} Browse ${list.length} printable 3D models with direct links.`;
  const cards = list.map((s, i) => productCard(s, page, i, aPre)).join('\n');
  const html = `<!DOCTYPE html>
<html lang="en">
<head>${headBlock(aPre, titleTag, descTag)}
</head>
<body>
${header(aPre)}
<main>
  <div class="wrap">
    <section class="hero-cat">
      <span class="overline">${esc(m.name)}</span>
      <h1 class="headline">${esc(m.name)}</h1>
      <p class="lede">${esc(m.intro)}</p>
      <span class="hero-count">${list.length} printable models · direct links · free to browse</span>
    </section>
  </div>
  <div class="layout">
    <div class="main">
${cards}
${readNext(aPre, page)}
    </div>
${adRail(aPre)}
  </div>
</main>
${footer(aPre)}
${jsonLd(page, list, aPre)}
</body>
</html>`;
  const dir = path.join(ROOT, m.dir);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  console.log('built', m.dir, '(' + list.length + ')');
}

// ---- blog pages ----
function articlePage(p, idx) {
  const aPre = '../../';
  const prev = POSTS[(idx + POSTS.length - 1) % POSTS.length];
  const next = POSTS[(idx + 1) % POSTS.length];
  const rel = (p.rel && p.rel.length ? p.rel : ['flexi-toys', 'organizers', 'decor-planters']).slice(0, 3);
  const html = `<!DOCTYPE html>
<html lang="en">
<head>${headBlock(aPre, `${p.title} | ${BRAND}`, p.desc)}
<script type="application/ld+json">${JSON.stringify({ '@context':'https://schema.org','@type':'Article', headline: p.title, description: p.desc, datePublished: DATE, author: { '@type':'Organization', name: BRAND } })}</script>
</head>
<body>
${header(aPre)}
<main>
  <div class="layout">
    <div class="main article">
      <a class="a-back" href="../">← All guides</a>
      <span class="overline">Guide</span>
      <h1 class="headline">${esc(p.title)}</h1>
      <div class="a-meta"><span>${DATE}</span><span>${p.read}</span></div>
      <div class="a-body">
${BODY[p.slug]}
      </div>
      <div class="a-nav">
        <a href="../${prev.slug}/">← ${esc(prev.title)}</a>
        <a href="../${next.slug}/">${esc(next.title)} →</a>
      </div>
      <section class="related-themes">
        <h2>Put it into practice</h2>
        <div class="rt-grid">
${rel.map(x => `          <a class="rt-card" href="${aPre}${META[x].dir}/"><b>${esc(META[x].name)}</b><span>${a.pages[x].length} models</span></a>`).join('\n')}
        </div>
      </section>
    </div>
${adRail(aPre)}
  </div>
</main>
${footer(aPre)}
</body>
</html>`;
  const dir = path.join(ROOT, 'blog', p.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  console.log('built blog/' + p.slug);
}

POSTS.forEach((p, i) => articlePage(p, i));

// ---- blog hub ----
{
  const aPre = '../';
  const html = `<!DOCTYPE html>
<html lang="en">
<head>${headBlock(aPre, `Blog & Guides — 3D Printing Tips | ${BRAND}`, 'Practical 3D printing guides: model preparation, software, first-week plans and finishing tips. Written for people who actually press print.')}
</head>
<body>
${header(aPre)}
<main>
  <div class="wrap">
    <section class="hero-cat">
      <span class="overline">📖 Blog &amp; guides</span>
      <h1 class="headline">Guides for better 3D prints</h1>
      <p class="lede">Short, practical reads — no fluff, no filler. Model preparation, the software stack explained, and a first-week plan that ends with objects you actually keep. Every guide links straight back to the model collections you can practice on.</p>
      <span class="hero-count">${POSTS.length} guides · updated ${DATE}</span>
    </section>
  </div>
  <div class="layout">
    <div class="main">
      <div class="post-grid" style="grid-template-columns:1fr">
${POSTS.map(p => postRow(p, `${p.slug}/`)).join('\n')}
      </div>
      <section class="read-next">
        <div class="section-head"><h2>Practice on real models</h2><p>Each collection pairs naturally with the guides above.</p></div>
        <div class="rt-grid" style="grid-template-columns:1fr 1fr">
          <a class="rt-card" href="${aPre}keychains-accessories/"><b>🔑 Keychains &amp; Craft Tools</b><span>${a.pages['keychains-accessories'].length} models · perfect first prints</span></a>
          <a class="rt-card" href="${aPre}flexi-toys/"><b>🧸 Flexi Toys &amp; Learning</b><span>${a.pages['flexi-toys'].length} models · print-in-place practice</span></a>
          <a class="rt-card" href="${aPre}organizers/"><b>🗂️ Desk &amp; Home Organizers</b><span>${a.pages['organizers'].length} models · tolerances lesson</span></a>
          <a class="rt-card" href="${aPre}lamps-lights/"><b>🕯️ Lamps &amp; Night Lights</b><span>${a.pages['lamps-lights'].length} models · month-two project</span></a>
        </div>
      </section>
    </div>
${adRail(aPre)}
  </div>
</main>
${footer(aPre)}
</body>
</html>`;
  fs.mkdirSync(path.join(ROOT, 'blog'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'blog', 'index.html'), html);
  console.log('built blog/index.html');
}

// short text badges for theme cards (emoji-free)
// ---- homepage ----
{
  const aPre = '';
  // text-badge cards-grid (no images, no emojis)
  const rgridCards = ORDER.map(p => {
    const m = META[p];
    return `          <a class="rcard" href="${m.dir}/">
            <span class="rcard-ico">${SHORT[p]}</span>
            <h3>${esc(m.name)}</h3>
            <p>${esc(m.blurb)}</p>
            <div class="rcard-foot"><span class="rcard-count">${a.pages[p].length} models</span><span class="rcard-arrow">${arrowSvg}</span></div>
          </a>`;
  });
  const rgrid = [
    ...rgridCards.slice(0, 4),
    `          <div class="tip-card">
            <div class="tip-body"><h3>${TIPS[0].h}</h3><p>${TIPS[0].p}</p></div>
            <a class="tip-link" href="${TIPS[0].link.href}">${TIPS[0].link.text}${arrowSvg}</a>
          </div>`,
    ...rgridCards.slice(4, 8),
    `          <div class="tip-card">
            <div class="tip-body"><h3>${TIPS[1].h}</h3><p>${TIPS[1].p}</p></div>
            <a class="tip-link" href="${TIPS[1].link.href}">${TIPS[1].link.text}${arrowSvg}</a>
          </div>`,
    ...rgridCards.slice(8, 12),
    `          <div class="tip-card">
            <div class="tip-body"><h3>${TIPS[2].h}</h3><p>${TIPS[2].p}</p></div>
            <a class="tip-link" href="${TIPS[2].link.href}">${TIPS[2].link.text}${arrowSvg}</a>
          </div>`
  ].join('\n');

  // parallax mountain hero — drop transparent PNGs/WebPs named mtn-1 .. mtn-4 into assets/img/
  // (mtn-4 = farthest range, mtn-1 = closest ridge). Missing layers fall back to inline SVG silhouettes.
  const mtn = (color, points) => `<svg viewBox="0 0 1200 320" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><polygon points="${points}" fill="${color}"/></svg>`;
  const layerImg = (n, fallback) => {
    for (const ext of ['png', 'webp']) {
      if (fs.existsSync(path.join(ROOT, 'assets', 'img', `mtn-${n}.${ext}`))) {
        return `<img src="${aPre}assets/img/mtn-${n}.${ext}" alt="" loading="eager">`;
      }
    }
    return fallback;
  };
  const heroLayers = `
        <div class="parallax-layer parallax-layer-4" data-parallax-layer="4">${layerImg(4, mtn('#1E293B', '0,320 120,200 260,270 420,150 600,240 780,130 960,250 1100,180 1200,260 1200,320'))}</div>
        <div class="parallax-layer parallax-layer-3" data-parallax-layer="3">${layerImg(3, mtn('#334155', '0,320 160,240 340,290 520,190 700,280 900,200 1080,280 1200,230 1200,320'))}</div>
        <div class="parallax-layer parallax-layer-2" data-parallax-layer="2">${layerImg(2, mtn('#475569', '0,320 140,280 320,320 500,250 680,320 860,260 1040,320 1200,290 1200,320'))}</div>
        <div class="parallax-layer parallax-layer-1" data-parallax-layer="1">${layerImg(1, mtn('#0F172A', '0,320 200,300 380,320 560,290 740,320 920,300 1100,320 1200,310 1200,320'))}</div>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>${headBlock(aPre, `${BRAND} — Printable 3D Models for Every Season & Room`, 'A curated index of 198 printable 3D models: Christmas, Halloween, dragons, flexi toys, organizers, planters and more. Guides included — pick a theme and start printing.')}
</head>
<body>
${header(aPre)}
<main>
  <section class="hero-parallax" data-parallax>
    <div class="parallax-visuals">
      <div class="parallax-layers">${heroLayers}</div>
      <div class="parallax-copy">
        <span class="overline">3D PRINT · Print it yourself</span>
        <h1>Real 3D models you can print today.</h1>
        <p class="lede">No accounts, no paywalls, no filler. A calm index of printable 3D models — articulated dragons, festive decor, desk organizers and more — each linked straight to its source file. Pick a theme, hit print, watch it appear.</p>
        <a class="hero-cta" href="#themes">Browse the themes${arrowDownSvg}</a>
      </div>
    </div>
  </section>
  <div class="wrap home-block">
    <section class="home-sec" id="themes">
      <div class="section-head"><h2>Browse by theme</h2><p>Twelve collections, each a self-contained set of printable models with direct links — plus a few honest notes from the workbench between them.</p></div>
      <div class="rgrid">
${rgrid}
      </div>
    </section>
    <section class="home-sec">
      <div class="section-head"><h2>From theme to printed shelf</h2><p>The whole site in three steps — no account, no paywall, no friction.</p></div>
      <div class="steps">
        <div class="step">
          <span class="step-n">01</span>
          <h3>Pick a theme</h3>
          <p>Browse the twelve collections above and find the model that fits your shelf, desk or party.</p>
        </div>
        <div class="step">
          <span class="step-n">02</span>
          <h3>Open the model</h3>
          <p>Every card links straight to the model page — files, license and price live on Creative Fabrica, we never gate them.</p>
        </div>
        <div class="step">
          <span class="step-n">03</span>
          <h3>Slice &amp; print</h3>
          <p>Run the file through our <a href="blog/how-to-prepare-a-3d-model-for-printing/">preparation checklist</a> and press print. First layer is the only one you have to watch.</p>
        </div>
      </div>
    </section>
    <section class="home-sec">
      <div class="section-head"><h2>What you're actually browsing</h2><p>No storefront theater — here is what this index is and how it's built.</p></div>
      <div class="editorial">
        <p>3D Models is an index, not a store. Every card links to the model's own page on Creative Fabrica — files, price, license and the author all live there. Nothing is re-hosted, nothing is gated behind an account here, and no card exists to pad the page count. If a theme says it has seventeen models, there are seventeen links, each one checked by hand.</p>
        <p class="pullquote">If a model is listed here, it prints on a hobby FDM machine without heroics.</p>
        <p>The catalog leans toward prints that survive real life: decor that holds a clean shelf line, organizers with tolerances that actually slide, flexi joints that move the moment they come off the bed. Where a model needs supports, an orientation trick or a specific material, the description on its card says so up front — the short line above each product is a print note, not marketing copy.</p>
        <p>Use it like a catalog card file: scan a theme, read the note, follow the direct link when one looks right. The <a href="blog/">blog guides</a> cover the rest of the loop — slicer settings, bed adhesion, painting — so a first print doesn't end in a slab of spaghetti.</p>
      </div>
    </section>
    <section class="home-sec">
      <div class="section-head"><h2>Good to know</h2><p>The four questions that actually come up, answered straight.</p></div>
      <div class="faq">
        <details open>
          <summary>Are the files free?</summary>
          <div class="faq-a">Prices and licenses are set by each author on the model's Creative Fabrica page — the link on every card takes you straight there. Many single models cost a couple of dollars and bundles usually work out cheaper per file. Browsing this index is always free.</div>
        </details>
        <details>
          <summary>What printer do I need?</summary>
          <div class="faq-a">Almost everything here is designed for hobby FDM printers — a stock 0.4&nbsp;mm nozzle and plain PLA will cover the vast majority of the catalog. Resin pays off only where micro-detail genuinely matters: miniatures, jewelry-adjacent pieces, fine relief work. When in doubt, start with the <a href="blog/fdm-vs-resin-which-printer-first/">FDM vs resin guide</a>.</div>
        </details>
        <details>
          <summary>Can I sell prints I make?</summary>
          <div class="faq-a">That depends on the license attached to each model, which is listed on its product page — some authors allow commercial use outright, others ask for a commercial license. Read it before selling; the answer lives on the file's own page, never here.</div>
        </details>
        <details>
          <summary>Where should a complete beginner start?</summary>
          <div class="faq-a">Flexi Toys &amp; Learning. Print-in-place models need no assembly, forgive an imperfect first layer, and still feel like magic when they come off the bed already moving. After that, the small decor in Decor, Planters &amp; Figurines is the natural next step — and the <a href="blog/your-first-week-of-3d-printing/">first-week plan</a> tells you what to print in what order.</div>
        </details>
      </div>
    </section>
    <section class="home-sec">
      <div class="section-head"><h2>From the blog</h2><p>Practical guides written for people who actually press print — not for search engines.</p></div>
      <div class="post-grid">
${FEATURED.map(s => postCard(POSTS.find(p => p.slug === s), `blog/${s}/`)).join('\n')}
      </div>
    </section>
    <section class="home-sec">
      <div class="home-cta">
        <div>
          <span class="overline" style="color:#fff">Decor, Planters &amp; Figurines</span>
          <h2>The shelf-settlers</h2>
          <p>Planters with personality, quiet statues, and a few internet-famous figurines that round out a home collected rather than decorated. These are the slow, satisfying prints you keep on display.</p>
        </div>
        <a class="btn" href="decor-planters/">Explore Decor &amp; Planters${arrowSvg}</a>
      </div>
    </section>
  </div>
</main>
${footer(aPre)}
</body>
</html>`;
  fs.writeFileSync(path.join(ROOT, 'index.html'), html);
  console.log('built index.html (home)');
}

// ---- privacy & terms ----
function legalPage(dirName, title, desc, bodyHtml) {
  const aPre = '../';
  const html = `<!DOCTYPE html>
<html lang="en">
<head>${headBlock(aPre, `${title} | ${BRAND}`, desc)}
</head>
<body>
${header(aPre)}
<main class="wrap">
  <div class="legal">
    <span class="overline">Legal</span>
    <h1 class="headline">${esc(title)}</h1>
    <span class="updated">Last updated: ${DATE}</span>
${bodyHtml}
  </div>
</main>
${footer(aPre)}
</body>
</html>`;
  fs.mkdirSync(path.join(ROOT, dirName), { recursive: true });
  fs.writeFileSync(path.join(ROOT, dirName, 'index.html'), html);
  console.log('built ' + dirName);
}

legalPage('privacy', 'Privacy & Cookies Policy', 'How Filament Finds handles data and cookies: no accounts, no trackers of our own, affiliate disclosure.',
`
      <h2>The short version</h2>
      <p>This site is a static catalog. It has no accounts, no registration, no comments and no newsletter. We do not collect, store or sell personal data, and we do not run our own advertising or analytics scripts.</p>

      <h2>Cookies</h2>
      <p>Filament Finds itself sets <b>no cookies</b>. However, when you click through to a merchant (for example, Creative Fabrica or AliExpress), <b>their</b> sites may set their own cookies for sessions, carts and affiliate attribution. Those cookies are governed by each merchant's own privacy policy, not by this one.</p>

      <h2>Affiliate disclosure</h2>
      <p>Outbound product links on this site are affiliate links. If you make a purchase after clicking one, we may earn a commission at no additional cost to you. Affiliate tracking is handled by the merchant's platform and typically relies on a short-lived cookie or URL parameter set on <b>their</b> domain after your click.</p>

      <h2>Server logs</h2>
      <p>Like virtually all websites, the hosting provider may keep standard server logs (IP address, user agent, requested URL) for security and troubleshooting. We do not use these logs to profile visitors and we do not enrich them with other data.</p>

      <h2>Third-party content</h2>
      <p>Product images are served from the merchant's CDN and remain the property of their respective authors. Fonts are loaded from Google Fonts, which may receive your IP address as part of the request; if you prefer to avoid that, the site remains fully readable with system fonts when offline.</p>

      <h2>Your choices</h2>
      <ul>
        <li>Browse without clicking outbound links and nothing leaves the site.</li>
        <li>Use your browser's tracking protection — the site works fine with strict settings.</li>
        <li>Questions about this policy? The contact channel of the site owner is the place to ask.</li>
      </ul>`);

legalPage('terms', 'Terms of Use', 'The simple rules for using Filament Finds: what the site is, what it is not, and who owns what.',
`
      <h2>What this site is</h2>
      <p>Filament Finds is an independent, curated index of 3D printing models available on third-party marketplaces. We do not host model files, do not sell anything, and do not process payments. Every product link leads to the merchant's own page, where the actual license, price and terms of sale apply.</p>

      <h2>Model licenses</h2>
      <p>All models are the property of their authors. What you may do with a downloaded file — personal use, gifting, selling prints — is defined exclusively by the license on the merchant's product page. Always read it there; nothing on this site modifies or extends those terms.</p>

      <h2>No warranties</h2>
      <p>The site is provided "as is". We curate in good faith and print what we list, but we do not guarantee that every model works on every printer, slicer or firmware version. Print settings, material choices and results are your responsibility — the guides on this site are advice, not a service contract.</p>

      <h2>Intellectual property</h2>
      <p>The site design, editorial descriptions and guides are ours. Product names, images and trademarks belong to their respective owners and are used for identification purposes only. If you are a rights holder and believe something is misattributed, reach out through the site owner's contact channel and it will be corrected.</p>

      <h2>Liability</h2>
      <p>To the maximum extent permitted by law, the site owner is not liable for any damages arising from the use of this site or from purchases made on third-party platforms via affiliate links. Disputes about orders, licenses or downloads are between you and the merchant.</p>

      <h2>Changes</h2>
      <p>These terms may be updated as the site evolves. The date at the top of this page always reflects the current version.</p>`);

// ---- report ----
let used = 0;
for (const p of ORDER) used += a.pages[p].length;
console.log('--- LINK REPORT ---');
console.log('links in passed_links.txt:', a.order.length);
console.log('used on pages:', used);
console.log('unused:', a.order.length - used);
console.log('DONE');
