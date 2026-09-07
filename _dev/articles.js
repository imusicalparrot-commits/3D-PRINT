/* articles.js — 20 blog guides: meta + bodies (original English texts) */
const POSTS = [
  { slug: 'how-to-prepare-a-3d-model-for-printing', emoji: '🧾', read: '6 min read', rel: ['keychains-accessories', 'flexi-toys', 'organizers'],
    title: 'How to Prepare a 3D Model for Printing: A Step-by-Step Checklist',
    desc: 'Manifold checks, wall thickness, orientation, supports and slicer settings — the exact order of operations before you press print.' },
  { slug: '3d-printing-software-explained', emoji: '🧰', read: '7 min read', rel: ['keychains-accessories', 'flexi-toys', 'organizers'],
    title: '3D Printing Software, Explained: Modeling, Repair and Slicing',
    desc: 'Tinkercad or Fusion? Cura or PrusaSlicer? What each tool in the chain actually does — and what a beginner can safely skip.' },
  { slug: 'your-first-week-of-3d-printing', emoji: '🗓️', read: '5 min read', rel: ['keychains-accessories', 'flexi-toys', 'decor-planters'],
    title: 'Your First Week of 3D Printing: A Practical Plan',
    desc: 'Seven days, four prints, zero frustration. What to print first, in what order, and the mistakes to skip entirely.' },
  { slug: 'fdm-vs-resin-which-printer-first', emoji: '🖨️', read: '6 min read', rel: ['flexi-toys', 'keychains-accessories', 'lamps-lights'],
    title: 'FDM vs Resin: Which Printer Should Come First?',
    desc: 'Filament or liquid resin — the honest comparison of cost, detail, safety and what each technology is genuinely best at.' },
  { slug: 'pla-petg-abs-filament-guide', emoji: '🧵', read: '6 min read', rel: ['decor-planters', 'organizers', 'flexi-toys'],
    title: 'PLA, PETG or ABS: A No-Drama Filament Guide',
    desc: 'Which spool for which job, what each material secretly hates, and the one purchase that improves every filament you own.' },
  { slug: 'bed-adhesion-first-layer-fixes', emoji: '🧲', read: '5 min read', rel: ['keychains-accessories', 'flexi-toys', 'christmas'],
    title: 'Bed Adhesion: Fixing the First Layer for Good',
    desc: 'Ninety percent of failed prints die in the first ten minutes. The short list of causes — and the fixes that actually work.' },
  { slug: 'supports-when-and-how', emoji: '🛠️', read: '5 min read', rel: ['dragons-fantasy', 'lamps-lights', 'decor-planters'],
    title: 'Supports: When You Need Them and How to Make Them Disappear',
    desc: 'Overhang angles, tree vs normal supports, contact settings and the orientation tricks that leave almost nothing to clean up.' },
  { slug: 'print-in-place-how-it-works', emoji: '🐾', read: '5 min read', rel: ['flexi-toys', 'dragons-fantasy', 'halloween'],
    title: 'Print-in-Place, Explained: Why Articulated Toys Need No Assembly',
    desc: 'Micro-gaps, clearances and the sacred print orientation — how flexi dragons come off the bed already alive.' },
  { slug: 'slicer-settings-that-matter', emoji: '🎚️', read: '6 min read', rel: ['organizers', 'decor-planters', 'flexi-toys'],
    title: 'The Only Slicer Settings That Really Matter',
    desc: 'Layer height, walls, infill, cooling — what to touch, what to leave alone, and how to stop tweaking forever.' },
  { slug: 'stringing-warping-troubleshooting', emoji: '🕸️', read: '6 min read', rel: ['organizers', 'christmas', 'gothic-dark'],
    title: 'Stringing and Warping: A Practical Troubleshooting Guide',
    desc: 'Hairy prints and curled corners both have short culprit lists. Match the symptom to the fix and stop guessing.' },
  { slug: 'how-to-paint-3d-prints', emoji: '🎨', read: '6 min read', rel: ['decor-planters', 'gothic-dark', 'kawaii-cute'],
    title: 'How to Paint 3D Prints So They Stop Looking Printed',
    desc: 'Sanding, filler primer, the two-coat rule and matte varnish — the 15-minute finish that upgrades any figurine or planter.' },
  { slug: 'multicolor-printing-without-ams', emoji: '🌈', read: '5 min read', rel: ['christmas', 'kawaii-cute', 'easter'],
    title: 'Multicolor Printing Without an AMS',
    desc: 'Pause-at-layer, manual filament swaps and smart model splitting — three ways to get color on a single-extruder printer.' },
  { slug: '3d-print-christmas-gifts-ideas', emoji: '🎁', read: '5 min read', rel: ['christmas', 'keychains-accessories', 'valentine'],
    title: '3D Printed Christmas Gifts People Actually Keep',
    desc: 'A gift-strategy guide: what prints overnight, what survives wrapping paper, and what to start printing in November.' },
  { slug: 'halloween-props-you-can-print', emoji: '🦇', read: '5 min read', rel: ['halloween', 'gothic-dark', 'keychains-accessories'],
    title: 'Halloween Props You Can Print This Weekend',
    desc: 'Light stands, straw toppers, candy cauldrons and subtle scares — a prop list built around a single printer and one spool.' },
  { slug: 'valentines-3d-print-gifts', emoji: '💘', read: '4 min read', rel: ['valentine', 'kawaii-cute', 'keychains-accessories'],
    title: "Valentine's Gifts Worth Printing",
    desc: 'Roses that never wilt, heart dishes and pocket bears — small prints that land harder than a bouquet.' },
  { slug: 'easter-crafts-to-print-with-kids', emoji: '🐣', read: '4 min read', rel: ['easter', 'kawaii-cute', 'flexi-toys'],
    title: 'Easter Crafts to Print With Kids',
    desc: 'Farm animals, egg holders and paint-your-own bunnies — a weekend craft plan where the printer does the hard part.' },
  { slug: 'desk-setup-upgrades-you-can-print', emoji: '🖥️', read: '5 min read', rel: ['organizers', 'dragons-fantasy', 'decor-planters'],
    title: 'Desk Setup Upgrades You Can Print This Week',
    desc: 'Phone stands, pen cradles, coaster sets and cable sanity — the highest value-per-gram prints a desk will ever get.' },
  { slug: 'safe-3d-printing-at-home', emoji: '🧯', read: '5 min read', rel: ['lamps-lights', 'flexi-toys', 'kawaii-cute'],
    title: 'Safe 3D Printing at Home: Ventilation, Hotends and LEDs',
    desc: 'Which materials need airflow, why the nozzle is the real hazard, and the safe way to light printed lamp holders.' },
  { slug: 'how-to-store-filament', emoji: '📦', read: '4 min read', rel: ['organizers', 'decor-planters', 'flexi-toys'],
    title: 'How to Store Filament So It Never Ruins a Print',
    desc: 'Damp spools cause the failures everyone blames on settings. Storage, desiccant and drying — the boring fix that works.' },
  { slug: 'print-speed-vs-quality', emoji: '⚖️', read: '5 min read', rel: ['flexi-toys', 'lamps-lights', 'keychains-accessories'],
    title: 'Print Speed vs Quality: When Fast Is Actually Fine',
    desc: 'What speed changes on real models, which settings buy back the quality, and when going slow is simply wasted hours.' },
];

const BODY = {};

BODY['how-to-prepare-a-3d-model-for-printing'] = `
      <p>Most failed prints are not slicer problems — they are model problems that only show up at the nozzle. Run any file through this checklist, in this order, and the success rate jumps immediately.</p>
      <h2>1. Start from a sound mesh</h2>
      <p>A printable model has to be watertight: every edge shared by exactly two faces, no holes, no flipped normals. Marketplaces usually curate this, but free downloads and self-made scans often are not. Quick checks: run the file through the analysis pass in your slicer, or open it in Meshmixer and hit repair. If the slicer reports "non-manifold" or "holes detected", fix before slicing — never hope.</p>
      <div class="a-callout"><b>Rule of thumb:</b> if the preview looks wrong — missing walls, infill floating inside solid areas — trust the preview, not your optimism.</div>
      <h2>2. Confirm scale and units</h2>
      <p>STL files carry no units, and some models arrive in inches that look like millimeters. Drop a 20&nbsp;mm calibration cube next to the import, or sanity-check a known detail — a phone stand should be roughly phone-sized. For anything with moving or mating parts, add 0.2–0.4&nbsp;mm of clearance per side.</p>
      <h2>3. Respect wall thickness</h2>
      <p>With a standard 0.4&nbsp;mm nozzle, keep walls at least 1.6&nbsp;mm — ideally a multiple of your line width. Thin sculptural fins, like feathers on angels or petals on vases, are fine as long as they carry no load.</p>
      <h2>4. Choose orientation deliberately</h2>
      <ul>
        <li><b>Strength:</b> layers are the weak plane. Load-bearing parts want forces running parallel to layers, not across them.</li>
        <li><b>Supports:</b> orient overhangs so supports touch faces you will hide or sand later.</li>
        <li><b>Print-in-place:</b> articulated models have baked-in clearances. Print them in the documented orientation — rotating them "for a better fit" usually welds the joints solid.</li>
      </ul>
      <h2>5. Slice with intent, not defaults</h2>
      <p>0.2&nbsp;mm layers are the honest default. Drop to 0.12&nbsp;mm for display pieces with fine relief; raise infill from decorative 10–15% to 30%+ for anything that holds weight. Tall, thin parts want a brim. Prints that must survive handling deserve 3–4 wall loops.</p>
      <h2>6. Supervise the first layer, then walk away</h2>
      <p>Ninety percent of prints die in the first ten minutes. Level the bed, set the Z-offset, watch two layers go down, only then leave. Ready to test the checklist? Pick something small from <a href="../../keychains-accessories/">Keychains &amp; Craft Tools</a>, or go straight for the crowd-pleasers in <a href="../../flexi-toys/">Flexi Toys &amp; Learning</a>.</p>`;

BODY['3d-printing-software-explained'] = `
      <p>The software side of 3D printing looks like a wall of acronyms, but it collapses into three stages: make the shape, fix the shape, cut the shape. Learn one tool per stage and you are set for years.</p>
      <h2>Stage 1 — Modeling: where shapes come from</h2>
      <p><b>Tinkercad</b> is the honest starting point: browser-based, free, and perfectly capable of brackets, trays and nameplates. <b>Fusion 360</b> is the next rung for parametric, functional parts. <b>Blender</b> covers sculpting — organic figurines, characters, anything that looks grown rather than engineered. There is also a fourth path: skip modeling entirely and download ready files, which is exactly what the collections on this site are for.</p>
      <h2>Stage 2 — Repair: the unglamorous insurance</h2>
      <p>Meshes arrive with holes and non-manifold edges the same way used cars arrive with squeaks. <b>Windows 3D Builder</b> auto-repairs quietly, <b>Meshmixer</b> gives manual control, and most modern slicers include a basic health check. Import, read the report, run repair once, done. Thirty seconds that prevent the classic "hollow shell" print.</p>
      <h2>Stage 3 — Slicing: where the print is actually decided</h2>
      <p><b>Cura</b>, <b>PrusaSlicer</b> and <b>Bambu Studio</b> do the same core job: convert a mesh into layer-by-layer toolpaths. The differences are ergonomics, not philosophy — pick the one with the best built-in profile for your printer and stay with it. Two settings carry most of the weight: layer height (0.2&nbsp;mm daily, 0.12&nbsp;mm for fine relief) and walls-plus-infill (3 walls and 12% covers most decor). Resin runs a parallel universe — <b>Chitubox</b> and <b>Lychee</b> — with supports that are always manual and always worth it.</p>
      <div class="a-callout"><b>What to skip as a beginner:</b> paid "magic" repair suites, cloud slicers, and CAD mastery. A free slicer plus downloaded models covers the first hundred prints without a single subscription.</div>
      <h2>The stack that just works</h2>
      <p>Tinkercad or downloaded STL → repair pass in the slicer → tuned profile. When you feel its limits, upgrade the specific stage that annoys you. Before the next print, run new files through <a href="../how-to-prepare-a-3d-model-for-printing/">the preparation checklist</a> — and if you need practice material, the <a href="../../keychains-accessories/">cutters and keychains collection</a> prints fast enough for a whole evening of experiments.</p>`;

BODY['your-first-week-of-3d-printing'] = `
      <p>The first week decides whether a printer becomes a hobby or a coat rack. This plan trades random printing for a deliberate ladder: each day builds one skill, and every print is useful enough to keep.</p>
      <h2>Day 1 — Assembly, bed level, nothing else</h2>
      <p>Build the printer, load filament, level the bed properly, and print nothing but the included test file. The goal today is a machine you trust, not an object.</p>
      <h2>Day 2 — First real object: a keychain</h2>
      <p>Keychains are the perfect first print: small, flat, fast, and failure costs ten minutes. They teach first-layer adhesion and how slicer profiles feel in practice. The <a href="../../keychains-accessories/">Keychains &amp; Craft Tools</a> collection is full of prints that finish before your coffee cools.</p>
      <h2>Days 3–4 — Print-in-place and the calibration secret</h2>
      <p>Articulated flexi toys look like magic and print like normal files: the joints arrive free because the model carries tiny built-in gaps. This is the day to learn that layer one is everything. If the axolotl's tail welds solid, the problem is squish, not the model. Grab a candidate from <a href="../../flexi-toys/">Flexi Toys &amp; Learning</a> and print two — one for you, one for whoever is watching over your shoulder.</p>
      <h2>Day 5 — Your first functional print</h2>
      <p>Phone stands and pen holders introduce tolerance: parts that hold a real device need slightly loose fits and sturdier walls. Start with something forgiving — a cat-shaped phone holder has huge margins and instant daily value. The <a href="../../organizers/">Desk &amp; Home Organizers</a> page is essentially a syllabus for this lesson.</p>
      <h2>Day 6 — Something for the shelf</h2>
      <p>Spend it on decor: a planter, a balloon dog, a tiny bookshelf. This is also the day to try the finishing ritual — light sanding, filler primer, matte paint. <a href="../../decor-planters/">Decor, Planters &amp; Figurines</a> has the candidates.</p>
      <h2>Day 7 — Plan, then branch</h2>
      <p>Review the week: which prints failed, and why? Then pick a direction — glowing prints and layered light stands make a great month-two project: <a href="../../lamps-lights/">Lamps &amp; Night Lights</a>. Before anything ambitious, skim <a href="../how-to-prepare-a-3d-model-for-printing/">the preparation checklist</a> — five minutes that saves spools.</p>
      <div class="a-callout"><b>The one rule:</b> print something you will actually keep every single day. Motivation does not come from calibration cubes.</div>`;

BODY['fdm-vs-resin-which-printer-first'] = `
      <p>Two technologies, one decision. FDM melts plastic filament; resin cures liquid with UV light. They overlap less than marketing suggests, and the right first choice depends entirely on what you want to make.</p>
      <h2>Where FDM wins</h2>
      <p>Filament printers are the honest default: cheap material (a spool costs less than a liter of resin), parts that are tough by nature, and build volumes that reach into the tens of centimeters. Anything functional — phone stands, organizers, articulated flexi toys — belongs here. Layer lines are visible, but that is exactly what sanding and primer fix.</p>
      <h2>Where resin wins</h2>
      <p>Resin slaughters FDM on detail. Miniatures, jewelry masters, intricate relief — anything where 0.05&nbsp;mm matters. The trade-offs are real: post-washing and curing are mandatory steps, uncured resin is unpleasant stuff, and prints are more brittle. It is a workshop-with-ventilation technology, not a desk-next-to-the-sofa one.</p>
      <h2>The cost picture</h2>
      <ul>
        <li><b>Entry price:</b> comparable — budget FDM and budget resin machines cost about the same.</li>
        <li><b>Consumables:</b> filament is roughly half the price per finished gram, and failed prints are reusable territory.</li>
        <li><b>Hidden extras:</b> resin adds gloves, alcohol, filters and cure station; FDM adds spare nozzles and a scraper.</li>
      </ul>
      <div class="a-callout"><b>If unsure, start with FDM.</b> It is safer around kids and pets, cheaper to fail with, and 90% of the models on this site — flexi toys, organizers, seasonal decor — are designed for filament printers in the first place.</div>
      <p>Practice candidates: <a href="../../flexi-toys/">articulated toys</a> and <a href="../../keychains-accessories/">keychains</a> print beautifully on the cheapest FDM machine you can find.</p>`;

BODY['pla-petg-abs-filament-guide'] = `
      <p>Three spools dominate every filament shelf, and choosing wrong costs more in failed prints than the price difference ever saves. Here is the honest version.</p>
      <h2>PLA — the default that is actually good</h2>
      <p>Stiff, dimensionally stable, matte-looking, printable on the cheapest machine with zero drama. It softens in a hot car and can be brittle, but for shelf decor, toys and seasonal pieces it is simply the right answer. If a model will sit on a shelf indoors, stop reading — PLA it is.</p>
      <h2>PETG — the workhorse with one flaw</h2>
      <p>Tougher, slightly flexible, and far happier in sunlight or a warm kitchen. It is the choice for holders that grip things daily, outdoor-ish decor and anything that must not snap. The flaw: PETG strings. Expect a little hairiness and tune retraction rather than fighting it.</p>
      <h2>ABS/ASA — the specialist</h2>
      <p>Heat-resistant and smoothable with acetone, but it shrinks as it cools, curls without an enclosure, and smells while printing. Choose it for car interiors and mechanical parts, not for figurines. ASA is the friendlier sibling.</p>
      <h2>Bonus round</h2>
      <ul>
        <li><b>TPU</b> — flexible filament for bumpers and squishy parts; print slow, dry it well.</li>
        <li><b>Silk / gradient PLA</b> — same printability as PLA, prettier sheen. Ideal for <a href="../../decor-planters/">vases and figurines</a>.</li>
      </ul>
      <div class="a-callout"><b>The one purchase that improves every spool:</b> a dry storage box. Damp filament causes the failures everyone blames on settings — see <a href="../how-to-store-filament/">the storage guide</a>.</div>
      <p>Match material to model: PLA for the <a href="../../flexi-toys/">toy shelf</a>, PETG for the <a href="../../organizers/">daily-use stuff</a>.</p>`;

BODY['bed-adhesion-first-layer-fixes'] = `
      <p>When a print fails at minute three, the diagnosis is almost always the same: the first layer did not bond. The culprit list is short, and so are the fixes.</p>
      <h2>The four causes, in order of likelihood</h2>
      <ul>
        <li><b>Dirty plate.</b> Fingerprints are invisible release agents. Wash the plate with dish soap and hot water, dry with a clean towel — IPA alone smears grease around.</li>
        <li><b>Wrong Z-offset.</b> Too high and the line sits on the bed like spaghetti; too low and the nozzle plows furrows. Aim for lines that touch each other and look slightly squashed.</li>
        <li><b>Unlevel bed.</b> Re-level after any bump, blade scrape or nozzle change. Paper method or automatic — both are fine if done calmly.</li>
        <li><b>Cold material.</b> A first layer at 20–25&nbsp;mm/s bonds far better than the same line at speed. Many profiles ship too fast.</li>
      </ul>
      <h2>Mechanical help when the basics are covered</h2>
      <p>A 5–8&nbsp;mm brim rescues tall, thin parts like tree silhouettes and light stands. Rafts are the last resort — they waste material and leave the ugliest underside. Textured PEI plates barely need help at all; smooth plates like a whiff of glue stick for stubborn filaments.</p>
      <div class="a-callout"><b>The two-minute ritual:</b> soap-wash weekly, re-level after collisions, watch the first two layers before walking away. This alone eliminates most "my printer is broken" posts ever written.</div>
      <p>Practice on cheap, flat, forgiving models — the <a href="../../keychains-accessories/">keychain collection</a> is ideal. Once the first layer is boring, <a href="../../flexi-toys/">articulated toys</a> become routine too, because print-in-place lives and dies by that same layer.</p>`;

BODY['supports-when-and-how'] = `
      <p>Supports are not a default — they are a decision. Print them when the geometry demands it, skip them when it does not, and both your filament bill and your cleanup time drop.</p>
      <h2>When you actually need them</h2>
      <p>The rule: overhangs steeper than roughly 50–60° from vertical, and any horizontal bridge longer than about 10&nbsp;mm without help. A 45° chamfer prints itself; a dragon's outstretched wing does not. Layered light stands are the interesting case — their internal cutouts often need support only in specific pockets, which is why slicers that support painting are worth learning.</p>
      <h2>Tree vs normal</h2>
      <ul>
        <li><b>Tree supports</b> branch around the model, touch less surface and peel off beautifully on organic shapes — figurines, busts, anything with curves.</li>
        <li><b>Normal supports</b> are predictable and dense — better for flat, mechanical overhangs where a clean ledge matters.</li>
      </ul>
      <h2>The settings that decide cleanup time</h2>
      <p>Top distance is the big one: 0.2&nbsp;mm for FDM gives support that snaps off without fighting. Use a support interface if your slicer offers it — a thin sacrificial roof that leaves near-clean undersides. And orient before you generate: rotating a model ten degrees can halve the support volume.</p>
      <div class="a-callout"><b>Hidden-face trick:</b> route supports toward surfaces that face down or sit against a wall anyway. Nobody sands what nobody sees.</div>
      <p>Where supports matter most in practice: winged <a href="../../dragons-fantasy/">fantasy figures</a>, internal cutouts of <a href="../../lamps-lights/">light stands</a>, and the undercuts on ornate <a href="../../decor-planters/">decor pieces</a>.</p>`;

BODY['print-in-place-how-it-works'] = `
      <p>Print-in-place is the party trick of 3D printing: a jointed dragon comes off the bed already flexing, no glue, no hinges, no assembly. The magic is not magic — it is clearance, carefully modeled.</p>
      <h2>The mechanism: modeled air gaps</h2>
      <p>Every articulated link is separated from its neighbor by 0.3–0.5&nbsp;mm of designed air. The printer lays down link A, bridges the gap with a thin curved roof, then lays down link B. Done well, the parts never touch during printing — and never fuse afterward. Done carelessly, they weld into a souvenir.</p>
      <h2>Why the first layer decides everything</h2>
      <p>Squished first layers swell outward in every direction, and 0.1&nbsp;mm of extra squish is enough to close a 0.3&nbsp;mm joint. This is why a perfectly calibrated first layer matters more for flexi models than for any brick. If a joint seizes, blame the calibration before the file — see <a href="../bed-adhesion-first-layer-fixes/">the first-layer guide</a>.</p>
      <h2>The three commandments</h2>
      <ul>
        <li><b>Orientation is sacred.</b> The designer placed joints for a reason; rotating the model "to fit the plate better" is how hinges die.</li>
        <li><b>No supports near joints.</b> Support material inside a 0.4&nbsp;mm gap is removal surgery.</li>
        <li><b>Slow outer walls help.</b> Joint zones print cleaner at moderate speed with cooling on.</li>
      </ul>
      <div class="a-callout"><b>Free movement test:</b> flex every joint right after the bed cools. A stiff link now is a broken link later — reprint while the settings are fresh in mind.</div>
      <p>Where to see it in action: the whole <a href="../../flexi-toys/">Flexi Toys &amp; Learning</a> collection, dragons and skeletons in <a href="../../dragons-fantasy/">Dragons &amp; Fantasy</a>, and even <a href="../../halloween/">spooky season</a> has its own jointed skeletons.</p>`;

BODY['slicer-settings-that-matter'] = `
      <p>Slicers expose two hundred settings so that you can safely ignore one hundred ninety of them. These are the ones that change prints; everything else is decoration until you have a specific reason.</p>
      <h2>Layer height — the trade everyone understands</h2>
      <p>0.2&nbsp;mm is the daily driver: decent speed, decent look. 0.12–0.16&nbsp;mm earns its long print time on display pieces with fine relief — figurines, layered scenes, anything judged up close. Going below 0.1&nbsp;mm on a 0.4&nbsp;mm nozzle mostly buys frustration.</p>
      <h2>Walls beat infill, always</h2>
      <p>Strength comes from perimeter loops, not from honeycomb. Three walls and 12% infill handles decor; holders and trays that get gripped daily want four to five walls. If a part feels floppy, add a wall before you add infill — same stiffness, better surface, often less material.</p>
      <h2>Top and bottom layers</h2>
      <p>Four to five solid top layers hide infill completely on flat tops. Saggy or pillowed top surfaces mean not enough layers or too sparse — an easy fix that instantly upgrades organizers and coasters.</p>
      <h2>Cooling and temperature, briefly</h2>
      <p>Fan at 100% for PLA overhangs; dialed back for tall, thin parts that get brittle. Temperature is per-filament — run one temp tower per brand and stop guessing forever.</p>
      <div class="a-callout"><b>The anti-tweaking rule:</b> change one setting per print. If you cannot say what changed, you cannot say what worked.</div>
      <p>Where each choice shows up: crisp geometry on <a href="../../organizers/">desk organizers</a>, smooth relief on <a href="../../decor-planters/">figurines and planters</a>, durable hinges on <a href="../../flexi-toys/">flexi toys</a>.</p>`;

BODY['stringing-warping-troubleshooting'] = `
      <p>Two failure modes cause most ugly prints, and each has a surprisingly short culprit list. Match the symptom, apply one fix, reprint. No ritual sacrifices required.</p>
      <h2>Stringing: the hairy print</h2>
      <p>Fine plastic threads between separate parts of the model mean the nozzle is leaking while traveling. Fixes, in order:</p>
      <ul>
        <li><b>Dry the filament.</b> Damp plastic bubbles and oozes — this one cause explains half of all stringing. See <a href="../how-to-store-filament/">the storage guide</a>.</li>
        <li><b>Retraction distance and speed.</b> Increase distance in 0.1&nbsp;mm steps (direct drive) or 0.5&nbsp;mm steps (bowden) until the hairs thin out.</li>
        <li><b>Temperature down 5°C.</b> Cooler melt oozes less. Stop when corners start rounding.</li>
      </ul>
      <h2>Warping: the curling corner</h2>
      <p>Corners lifting off the bed mean the part is shrinking faster than it is sticking. Fixes:</p>
      <ul>
        <li><b>Kill the draft.</b> A window two meters away is enough. Enclosures solve this completely for ABS/ASA.</li>
        <li><b>Brim, not raft.</b> A 5&nbsp;mm brim anchors edges; a raft hides the problem and adds cleanup.</li>
        <li><b>Bed temperature up 5°C</b> for the stubborn cases, and clean the plate — grease releases parts as efficiently as heat does.</li>
      </ul>
      <div class="a-callout"><b>One change per print.</b> Stringing and warping both respond within a single reprint when you change the right thing — and become mysteries when you change three things at once.</div>
      <p>Where these bites are common: tall <a href="../../christmas/">tree and light-stand silhouettes</a> (warping), and detail-heavy <a href="../../gothic-dark/">gothic pieces</a> (stringing shows up first on fine ornaments).</p>`;

BODY['how-to-paint-3d-prints'] = `
      <p>Fifteen minutes of finishing separates "3D printed object" from "thing I bought". The ritual is the same for a figurine, a planter or a gothic brush holder — and it is shorter than you fear.</p>
      <h2>Step 1 — Sand the story away</h2>
      <p>220-grit over the visible layer lines. Ten seconds per surface, not a restoration project. Corners and curves matter more than flat faces; your hands will find the rough spots before your eyes do. For resin prints, remove support nubs with a fresh blade first.</p>
      <h2>Step 2 — Filler primer is the actual magic</h2>
      <p>One thin coat of filler (sanding) primer fills the micro-valleys between layers and gives paint something to grip. This single can upgrades prints more than any expensive paint ever will. Two light coats beat one dripping one — dry, recoat, done.</p>
      <h2>Step 3 — Paint with a plan</h2>
      <ul>
        <li><b>Rattle cans</b> for single-color pieces — matte colors look expensive instantly.</li>
        <li><b>Acrylics</b> for detail work — dry-brush the raised edges with a lighter tone and depth appears.</li>
        <li><b>Washes</b> for gothic and ornate pieces — dark paint thinned with water settles into the crevices on its own.</li>
      </ul>
      <h2>Step 4 — Matte varnish, and stop</h2>
      <p>A final matte clear coat evens out sheen and protects the paint. Gloss reveals every flaw; matte forgives them.</p>
      <div class="a-callout"><b>Where to practice:</b> chunky prints with big surfaces — <a href="../../decor-planters/">planters and figurines</a>, moody <a href="../../gothic-dark/">gothic vanity pieces</a>, or round-faced <a href="../../kawaii-cute/">kawaii characters</a> that only need two colors.</div>`;

BODY['multicolor-printing-without-ams'] = `
      <p>Multi-material units are lovely and optional. A single-extruder printer can produce genuinely colorful prints with three techniques that cost nothing but planning.</p>
      <h2>Technique 1 — Pause at layer</h2>
      <p>The classic. The slicer stops at a chosen height, beeps, and you swap filament in the open time window. Works beautifully when colors stack vertically: a white snowman body under a red hat, a pastel bunny under colored ears. Set the pause slightly above the color boundary and purge one full extruder-load before continuing.</p>
      <h2>Technique 2 — Swap by model part</h2>
      <p>Print the base in one color, then a second file (or a second plate run) in another and combine physically. Vases love this: printed body, printed flower, zero fancy hardware. It is also the most forgiving — each color is its own ordinary print.</p>
      <h2>Technique 3 — Slicer "color painting"</h2>
      <p>Modern slicers let you paint faces onto a model and auto-generate the pauses. Best for eyes, badges and small accents on otherwise single-color prints — the kawaii look in one spool swap.</p>
      <div class="a-callout"><b>Plan colors bottom-up.</b> The printer only moves forward through layers — whatever color is loaded prints until the next pause. Design (or choose) models with that logic and swaps become trivial.</div>
      <p>Ideas to try the technique on: <a href="../../christmas/">two-tone Christmas decor</a>, <a href="../../kawaii-cute/">big-eyed characters</a>, and <a href="../../easter/">spring bunnies with painted ears</a>.</p>`;

BODY['3d-print-christmas-gifts-ideas'] = `
      <p>The best printed gifts share three properties: they finish in one evening, they survive wrapping paper, and they look intentional rather than "printed". Here is the strategy, not just a list.</p>
      <h2>Start in November, not December</h2>
      <p>Print quantity is the hidden variable: one gift is a print, ten gifts is a production plan. Small items — ornaments, keychains, straw toppers — batch beautifully on a single plate, and failures cost minutes instead of evenings.</p>
      <h2>The safe gift tiers</h2>
      <ul>
        <li><b>Tier 1 — the sure thing:</b> ornaments and cookie cutters. Universal, flat, unbreakable in transit. The <a href="../../keychains-accessories/">cutters and keychains collection</a> alone covers half a gift list.</li>
        <li><b>Tier 2 — the crowd-pleaser:</b> a glowing piece. Layered light stands and night lights feel like boutique items, and the LED does the finishing work for you. See <a href="../../lamps-lights/">Lamps &amp; Night Lights</a>.</li>
        <li><b>Tier 3 — the sentimental one:</b> personalized letters, a tiny "home" sign, a rose that never wilts. These land hardest and print smallest — <a href="../../valentine/">hearts and roses</a> work year-round, not just in February.</li>
      </ul>
      <h2>The two-color upgrade</h2>
      <p>Red-and-white or green-and-white printing reads "holiday" instantly, and you do not need an AMS — pause-at-layer covers it. Details in <a href="../multicolor-printing-without-ams/">the multicolor guide</a>.</p>
      <div class="a-callout"><b>Rule of the season:</b> every gift gets a quick sand and a coat of matte varnish. Fifteen minutes per item turns a print run into presents.</div>
      <p>Model starting points: the whole <a href="../../christmas/">Christmas &amp; Winter collection</a>, naturally.</p>`;

BODY['halloween-props-you-can-print'] = `
      <p>Great Halloween printing is about restraint: one or two well-made pieces beat a table of plastic-looking clutter. This weekend plan uses one printer, one near-black spool, and one glowing accent.</p>
      <h2>Saturday: the atmosphere pieces</h2>
      <p>Light stands are the highest-impact prints of the season — bare trees, layered scenes, a crescent moon. They print flat, assemble into depth, and a single tea light turns a shelf into a scene. Pick two from <a href="../../lamps-lights/">the light collection</a> or go straight to the themed ones in <a href="../../halloween/">Halloween &amp; Spooky</a>.</p>
      <h2>Saturday evening: the party details</h2>
      <p>Straw toppers are the sleeper hit: tiny, fast, and they make every cup look styled. Print a batch of ghosts and skeletons in one sitting — the <a href="../../keychains-accessories/">small-print collection</a> has toppers that work year-round, the themed ones are on the Halloween page. The witch's cauldron doubles as the candy bowl, which is the kind of multi-tasking every party needs.</p>
      <h2>Sunday: the finishing touches</h2>
      <ul>
        <li><b>Glow filament</b> for eyes and moons — charges in daylight, glows all evening.</li>
        <li><b>Matte black everything else.</b> Gloss reads toy; matte reads prop.</li>
        <li><b>One quiet piece</b> for the bookshelf — a winged skull or unicorn skeleton that says "we celebrate properly" without saying it loudly. The <a href="../../gothic-dark/">gothic collection</a> handles the tasteful end of spooky.</li>
      </ul>
      <div class="a-callout"><b>Safety note:</b> LED tea lights only inside printed holders. Real flames plus thin walls is a fire-hazard combo — more in <a href="../safe-3d-printing-at-home/">the safety guide</a>.</div>`;

BODY['valentines-3d-print-gifts'] = `
      <p>Printed gifts win on one axis that stores cannot touch: specificity. A rose printed in her favorite color beats a generic bouquet, and it costs one print session instead of a florist markup.</p>
      <h2>The three that never miss</h2>
      <ul>
        <li><b>The rose.</b> Print it in translucent red or blush PLA and it reads as jewelry, not plastic. Layered petals print clean on any machine. Both versions in <a href="../../valentine/">Valentine's &amp; Wedding</a>.</li>
        <li><b>The heart dish.</b> A trinket dish earns daily contact — rings at night, earrings in the morning. The gift that quietly advertises itself every day.</li>
        <li><b>The pocket bear.</b> A chubby keychain bear clutching a heart is the low-stakes winner: ten minutes of print time, easy to give, impossible to get wrong. More small winners in <a href="../../keychains-accessories/">Keychains &amp; Craft Tools</a>.</li>
      </ul>
      <h2>The upgrade moves</h2>
      <p>Print in silk filament for a satin sheen — same settings, twice the presentation. If the piece is a desk object, a quick sand plus matte varnish makes it look boutique. And translucent filament only looks translucent if you print it single-wall: one perimeter, zero infill, vase mode if available.</p>
      <h2>Scale it up for the anniversary crowd</h2>
      <p>The dress-shaped vanity holders work year-round and photograph beautifully — they are the "big" version of the same sentiment for people who share a bathroom. The <a href="../../kawaii-cute/">kawaii collection</a> covers the giftable-cute end for friends and kids, so nobody at the table goes empty-handed.</p>
      <div class="a-callout"><b>Timing rule:</b> print three days early. Translucent filament loves to string when damp — if the first rose comes out hairy, dry the spool and reprint calmly. See <a href="../how-to-store-filament/">the storage guide</a>.</div>`;

BODY['easter-crafts-to-print-with-kids'] = `
      <p>Easter is the easiest holiday to turn into a printing craft session, because everything about it is small, chunky and forgiving. The printer does the hard part; the kids do the fun part.</p>
      <h2>The session plan</h2>
      <ul>
        <li><b>Print (adults, evening before):</b> a batch of farm animals, a bunny or two, an egg holder. All flat-bottomed, all fast — the <a href="../../easter/">Easter &amp; Spring collection</a> is built for this.</li>
        <li><b>Paint (kids, Saturday morning):</b> acrylics, one brush each, no rules. Chunky figurines are the ideal first painting surface: no tiny details to frustrate, and mistakes look like decoration.</li>
        <li><b>Assemble (everyone):</b> chocolate egg into the bunny holder, animals arranged on the windowsill, photo taken before the cat intervenes.</li>
      </ul>
      <h2>Why this beats coloring books</h2>
      <p>The object is real. A printed bunny that the kid painted themselves stays on the shelf for years — and next spring it comes out again with a story attached. That feedback loop is the whole hook of making things.</p>
      <h2>Escalation for the hooked</h2>
      <p>Once the paint dries, the articulated animals are the reveal: a flexi bunny that actually moves feels like a toy, not a craft. The <a href="../../flexi-toys/">Flexi Toys &amp; Learning</a> collection has the safe, rounded candidates. For the pastel aesthetic, the <a href="../../kawaii-cute/">Kawaii collection</a> paints up beautifully in two colors.</p>
      <div class="a-callout"><b>Material note:</b> plain PLA only for kids' projects — it is the stiff-but-safe standard, needs no ventilation drama, and survives being dropped on the floor more times than anyone will admit.</div>`;

BODY['desk-setup-upgrades-you-can-print'] = `
      <p>A desk is a grid of small problems: the phone lying flat, the pens migrating, the cup leaving rings, the cables breeding behind the monitor. Every one of those problems is a three-hour print away from solved.</p>
      <h2>The starters — print this week</h2>
      <ul>
        <li><b>Phone stand.</b> The single highest-usage print most people own. Animal versions hold phones just as well as minimalist ones — the <a href="../../organizers/">organizers collection</a> has both temperaments.</li>
        <li><b>Pen cradle.</b> One model, forty grams, instant tidiness. The snail and chameleon versions are desk jokes that work.</li>
        <li><b>Coaster set.</b> Flat, fast, and the mandala ones look store-bought after a coat of matte paint.</li>
      </ul>
      <h2>The second wave</h2>
      <p>Once the basics land, the desk develops a personality: a dragon glasses holder for the nightstand, a gamer decor bundle for the battle station, a key bowl by the door so tomorrow-morning-you has one less search. All of that lives in <a href="../../organizers/">Desk &amp; Home Organizers</a> and <a href="../../decor-planters/">Decor, Planters &amp; Figurines</a>.</p>
      <h2>Design notes for functional prints</h2>
      <p>Functional means tolerances: parts that grip or slide want 0.2–0.4&nbsp;mm of clearance, and more walls beats more infill every time. PETG is the better material for pieces that live in sunlight or get handled constantly — the reasoning is in <a href="../pla-petg-abs-filament-guide/">the filament guide</a>.</p>
      <div class="a-callout"><b>The test that matters:</b> a desk upgrade earns its spot if you stop noticing it. If it needs attention — adjusting, repositioning, apologizing for it — print a different one.</div>
      <p>Fantasy-leaning desks should not skip the <a href="../../dragons-fantasy/">dragon office holders</a>. Legendary meetings start with legendary stationery.</p>`;

BODY['safe-3d-printing-at-home'] = `
      <p>Consumer 3D printing is a home-safe hobby with three honest hazards: fumes, heat, and fires-that-start-with-candles. All three have boring, effective fixes.</p>
      <h2>Ventilation, by material</h2>
      <p>PLA smells like warm pancakes and is the least concerning common filament — normal room airflow is fine. PETG is similar with a slightly sweeter smell. ABS and ASA are the real ones: they release styrene, and they belong in an enclosure with actual ventilation or near a window with extraction. Resin printing is its own league — gloves, ventilation and no kids in the room, full stop.</p>
      <h2>Heat: respect the four zones</h2>
      <ul>
        <li><b>Nozzle:</b> 200°C+ — the burn everyone actually gets. Fingers stay behind the tool, always.</li>
        <li><b>Bed:</b> 60–110°C — enough to blister. It stays hot long after a print ends.</li>
        <li><b>Hotend assembly:</b> wait for it to cool before any "quick" nozzle change.</li>
        <li><b>The printer itself:</b> a stable, non-flammable surface and a foot of clearance around it.</li>
      </ul>
      <h2>The candle rule for printed holders</h2>
      <p>This site features many candle holders and light stands — beautiful and perfectly safe <b>with LED tea lights</b>. Real flames inside thin printed walls are a genuine fire risk: the material is exactly as flammable as it looks. The <a href="../../lamps-lights/">Lamps &amp; Night Lights</a> collection is designed around LEDs and looks identical when lit.</p>
      <div class="a-callout"><b>With kids in the house:</b> printers live up high or in a cabinet, filament choice defaults to PLA, and the flexi-toy shelf doubles as the safest possible demonstration of what the machine does — see <a href="../../flexi-toys/">Flexi Toys &amp; Learning</a>.</div>`;

BODY['how-to-store-filament'] = `
      <p>Damp filament is the ghost in the machine: it causes stringy prints, popping noises and weak walls that everyone first blames on settings. The fix costs less than one spool and takes ten minutes.</p>
      <h2>Why moisture ruins prints</h2>
      <p>Most common filaments are hygroscopic — they pull water from the air. Inside the hot nozzle that water flashes to steam: the steam makes bubbles, bubbles make stringing, popping sounds and layer gaps. PETG and nylon are the worst offenders; PLA is slower but not immune, especially in humid climates.</p>
      <h2>The three-level storage system</h2>
      <ul>
        <li><b>Level 1 — free:</b> zip bags with silica gel, squeezed shut. Better than an open shelf, fine for a month or two.</li>
        <li><b>Level 2 — good:</b> airtight boxes with a desiccant pack per spool. This is the sweet spot for most households.</li>
        <li><b>Level 3 — nerd:</b> dedicated dry boxes that feed the printer directly from storage. The endgame for a five-plus spool collection.</li>
      </ul>
      <h2>Drying a spool that already went soft</h2>
      <p>A dedicated dryer is the clean solution; a food dehydrator at PLA-safe temperatures works; even a print-bed at low heat under a box has saved many spools. Dry for 4–6 hours and the difference is immediate — stringing drops, surfaces clean up.</p>
      <div class="a-callout"><b>Where the boxes live:</b> the printer area grows its own storage problems. The <a href="../../organizers/">organizers collection</a> is where the shelf containers come from, and the leftover space is what <a href="../../decor-planters/">decor prints</a> are for.</div>
      <p>One last habit: label the bags with the date you opened the spool. Future-you will make better decisions with that one fact.</p>`;

BODY['print-speed-vs-quality'] = `
      <p>Speed is the most misunderstood dial in 3D printing. Faster is not worse and slower is not better — each model simply has a point where speeding up stops being free.</p>
      <h2>What speed actually changes</h2>
      <p>Push speed and three things degrade, in order: outer-wall surface (vibrations show as texture), overhang quality (fast cooling loops sag), and layer adhesion on short segments. What does <i>not</i> degrade: infill, hidden faces, and chunky geometric parts with few details. That asymmetry is the whole strategy.</p>
      <h2>The fast lane — where speed is free</h2>
      <p>Flat, chunky, hidden-layer prints: keychains, cookie cutters, boxes, organizers without visible tops. Doubling speed here halves the session and nobody can tell — the <a href="../../keychains-accessories/">keychain collection</a> is practically a speed-profile playground.</p>
      <h2>The slow lane — where detail is the point</h2>
      <p>Figurines with fine relief, layered light scenes, anything judged up close. Here the win is not just slower speed but slower <b>outer walls specifically</b>: dropping only the perimeter speed to 30–40% while keeping infill fast is the best quality-per-minute trade in the hobby. More on the settings that matter in <a href="../slicer-settings-that-matter/">the slicer guide</a>.</p>
      <h2>Modern accelerations</h2>
      <p>Newer printers with input shaping and high accelerations genuinely print display pieces at speeds that were fantasy two years ago — the quality loss at "sport" speeds is now small. The old rule still applies at the margins: the last 20% of speed costs the first 80% of surface quality.</p>
      <div class="a-callout"><b>Practical default:</b> run profiles, not vibes — a "fast" profile for <a href="../../flexi-toys/">toys</a> and a "fine" profile for <a href="../../lamps-lights/">glowing pieces</a>, and never the twain shall meet.</div>`;

module.exports = { POSTS, BODY };
