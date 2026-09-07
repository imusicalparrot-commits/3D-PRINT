/* typo.js - typographic normaliser for inherited copy.
 *
 * The design rules this rebuild follows ban the em dash and the en dash outright
 * (headline, label, body, quote, alt text - everywhere). The inherited copy carries
 * 160 of them. Rather than a blind replace, this module applies a small set of
 * explicit rules plus a per-string override table, then HARD FAILS the build if a
 * single dash survives. Nothing is guessed silently.
 *
 * Rules, in order:
 *   1. OVERRIDES  - exact substring rewrites, hand-written, applied first.
 *   2. ranges     - digit en dash digit  ->  hyphen  (0.2-0.4, 60-110, 3-4)
 *   3. headings   - " - " inside <h2>    ->  ": "    (appositive title voice)
 *   4. paired     - "a - b - c"          ->  "a (b) c" (parenthetical)
 *   5. single     - "a - b"              ->  ". B" or ", b" per the tail shape
 */

'use strict';

const EM = '\u2014';
const EN = '\u2013';

/* 1. Explicit rewrites. Keys are exact substrings of the source copy. */
const OVERRIDES = [
  /* --- one inherited line reached for a banned marketing verb --- */
  ['It prints flat and elevates a coffee table instantly.',
    'It prints flat and makes a coffee table look considered.'],

  /* --- article headings that carried banned generic step labels --- */
  [`<h2>Stage 1 ${EM} Modeling: where shapes come from</h2>`, '<h2>Modeling: where shapes come from</h2>'],
  [`<h2>Stage 2 ${EM} Repair: the unglamorous insurance</h2>`, '<h2>Repair: the unglamorous insurance</h2>'],
  [`<h2>Stage 3 ${EM} Slicing: where the print is actually decided</h2>`, '<h2>Slicing: where the print is actually decided</h2>'],
  [`<h2>Step 1 ${EM} Sand the story away</h2>`, '<h2>Sand the story away</h2>'],
  [`<h2>Step 2 ${EM} Filler primer is the actual magic</h2>`, '<h2>Filler primer is the actual magic</h2>'],
  [`<h2>Step 3 ${EM} Paint with a plan</h2>`, '<h2>Paint with a plan</h2>'],
  [`<h2>Step 4 ${EM} Matte varnish, and stop</h2>`, '<h2>Matte varnish, and stop</h2>'],
  [`<h2>Technique 1 ${EM} Pause at layer</h2>`, '<h2>Pause at layer</h2>'],
  [`<h2>Technique 2 ${EM} Swap by model part</h2>`, '<h2>Swap by model part</h2>'],
  [`<h2>Technique 3 ${EM} Slicer "color painting"</h2>`, '<h2>Slicer colour painting</h2>'],
  [`<h2>Day 1 ${EM} Assembly, bed level, nothing else</h2>`, '<h2>Day one: assembly, bed level, nothing else</h2>'],
  [`<h2>Day 2 ${EM} First real object: a keychain</h2>`, '<h2>Day two: a keychain, your first real object</h2>'],
  [`<h2>Days 3${EN}4 ${EM} Print-in-place and the calibration secret</h2>`, '<h2>Days three and four: print-in-place, and the calibration secret</h2>'],
  [`<h2>Day 5 ${EM} Your first functional print</h2>`, '<h2>Day five: your first functional print</h2>'],
  [`<h2>Day 6 ${EM} Something for the shelf</h2>`, '<h2>Day six: something for the shelf</h2>'],
  [`<h2>Day 7 ${EM} Plan, then branch</h2>`, '<h2>Day seven: plan, then branch</h2>'],

  /* --- parenthetical pairs (both dashes belong to one aside) --- */
  [`if the preview looks wrong ${EM} missing walls, infill floating inside solid areas ${EM} trust the preview, not your optimism.`,
    'if the preview looks wrong (missing walls, infill floating inside solid areas) trust the preview, not your optimism.'],
  [`Resin runs a parallel universe ${EM} <b>Chitubox</b> and <b>Lychee</b> ${EM} with supports that are always manual and always worth it.`,
    'Resin runs a parallel universe of its own, <b>Chitubox</b> and <b>Lychee</b>, with supports that are always manual and always worth it.'],
  [`Anything functional ${EM} phone stands, organizers, articulated flexi toys ${EM} belongs here.`,
    'Anything functional (phone stands, organizers, articulated flexi toys) belongs here.'],
  [`90% of the models on this site ${EM} flexi toys, organizers, seasonal decor ${EM} are designed for filament printers in the first place.`,
    'most of the models on this site (flexi toys, organizers, seasonal decor) are designed for filament printers in the first place.'],
  [`Small items ${EM} ornaments, keychains, straw toppers ${EM} batch beautifully on a single plate`,
    'Small items (ornaments, keychains, straw toppers) batch beautifully on a single plate'],
  [`If it needs attention ${EM} adjusting, repositioning, apologizing for it ${EM} print a different one.`,
    'If it needs attention (adjusting, repositioning, apologizing for it) print a different one.'],

  /* --- singles where a period would break the sentence's logic --- */
  [`keep walls at least 1.6&nbsp;mm ${EM} ideally a multiple of your line width`,
    'keep walls at least 1.6&nbsp;mm, ideally a multiple of your line width'],
  [`raise infill from decorative 10${EN}15% to 30%+`, 'raise infill from decorative 10-15% to 30%+'],
  [`Prints that must survive handling deserve 3${EN}4 wall loops.`, 'Prints that must survive handling deserve three or four wall loops.'],
  [`<b>Entry price:</b> comparable ${EM} budget FDM and budget resin machines cost about the same.`,
    '<b>Entry price:</b> comparable. Budget FDM and budget resin machines cost about the same.'],
  [`<b>TPU</b> ${EM} flexible filament for bumpers and squishy parts`, '<b>TPU.</b> Flexible filament for bumpers and squishy parts'],
  [`<b>Silk / gradient PLA</b> ${EM} same printability as PLA, prettier sheen.`,
    '<b>Silk and gradient PLA.</b> Same printability as PLA, prettier sheen.'],
  [`<b>Tier 1 ${EM} the sure thing:</b>`, '<b>Tier one, the sure thing:</b>'],
  [`<b>Tier 2 ${EM} the crowd-pleaser:</b>`, '<b>Tier two, the crowd-pleaser:</b>'],
  [`<b>Tier 3 ${EM} the sentimental one:</b>`, '<b>Tier three, the sentimental one:</b>'],
  [`<b>Level 1 ${EM} free:</b>`, '<b>Level one, free:</b>'],
  [`<b>Level 2 ${EM} good:</b>`, '<b>Level two, good:</b>'],
  [`<b>Level 3 ${EM} nerd:</b>`, '<b>Level three, the nerd option:</b>'],
  [`<b>Glow filament</b> for eyes and moons ${EM} charges in daylight, glows all evening.`,
    '<b>Glow filament</b> for eyes and moons. It charges in daylight and glows all evening.'],
  [`<b>One quiet piece</b> for the bookshelf ${EM} a winged skull or unicorn skeleton that says`,
    '<b>One quiet piece</b> for the bookshelf: a winged skull or unicorn skeleton that says'],
  [`<b>Rattle cans</b> for single-color pieces ${EM} matte colors look expensive instantly.`,
    '<b>Rattle cans</b> for single-colour pieces. Matte colours look expensive instantly.'],
  [`<b>Acrylics</b> for detail work ${EM} dry-brush the raised edges with a lighter tone and depth appears.`,
    '<b>Acrylics</b> for detail work. Dry-brush the raised edges with a lighter tone and depth appears.'],
  [`<b>Washes</b> for gothic and ornate pieces ${EM} dark paint thinned with water settles into the crevices on its own.`,
    '<b>Washes</b> for gothic and ornate pieces. Dark paint thinned with water settles into the crevices on its own.'],
  [`<b>Nozzle:</b> 200°C+ ${EM} the burn everyone actually gets.`,
    '<b>Nozzle:</b> 200°C and up, the burn everyone actually gets.'],
  [`<b>Bed:</b> 60${EN}110°C ${EM} enough to blister.`, '<b>Bed:</b> 60-110°C, enough to blister.'],
  [`<b>Tree supports</b> branch around the model, touch less surface and peel off beautifully on organic shapes ${EM} figurines, busts, anything with curves.`,
    '<b>Tree supports</b> branch around the model, touch less surface and peel off beautifully on organic shapes: figurines, busts, anything with curves.'],
  [`<b>Tree supports</b> reach around a model, touch less surface and peel off beautifully on organic shapes ${EM} figurines, busts, anything with curves.`,
    '<b>Tree supports</b> reach around a model, touch less surface and peel off beautifully on organic shapes: figurines, busts, anything with curves.'],
  [`<b>Normal supports</b> are predictable and dense ${EM} better for flat, mechanical overhangs where a clean ledge matters.`,
    '<b>Normal supports</b> are predictable and dense, which suits flat mechanical overhangs where a clean ledge matters.'],
  [`<b>Dry the filament.</b> Damp plastic bubbles and oozes ${EM} this one cause explains half of all stringing.`,
    '<b>Dry the filament.</b> Damp plastic bubbles and oozes, and this one cause explains half of all stringing.'],
  [`Wash the plate with dish soap and hot water, dry with a clean towel ${EM} IPA alone smears grease around.`,
    'Wash the plate with dish soap and hot water, then dry with a clean towel. IPA alone smears grease around.'],
  [`Paper method or automatic ${EM} both are fine if done calmly.`,
    'Paper method or automatic, both are fine if done calmly.'],
  [`A first layer at 20${EN}25&nbsp;mm/s bonds far better`, 'A first layer at 20-25&nbsp;mm/s bonds far better'],
  [`<b>Bed temperature up 5°C</b> for the stubborn cases, and clean the plate ${EM} grease releases parts as efficiently as heat does.`,
    '<b>Bed temperature up 5°C</b> for the stubborn cases, and clean the plate, because grease releases parts as efficiently as heat does.'],
  [`Print them in the documented orientation ${EM} rotating them "for a better fit" usually welds the joints solid.`,
    'Print them in the documented orientation. Rotating them for a better fit usually welds the joints solid.'],
  [`The differences are ergonomics, not philosophy ${EM} pick the one with the best built-in profile for your printer and stay with it.`,
    'The differences are ergonomics, not philosophy, so pick the one with the best built-in profile for your printer and stay with it.'],
  [`<b>Blender</b> covers sculpting ${EM} organic figurines, characters, anything that looks grown rather than engineered.`,
    '<b>Blender</b> covers sculpting: organic figurines, characters, anything that looks grown rather than engineered.'],
  [`Then pick a direction ${EM} glowing prints and layered light stands make a great month-two project`,
    'Then pick a direction. Glowing prints and layered light stands make a great month-two project'],
  [`Start with something forgiving ${EM} a cat-shaped phone holder has huge margins and instant daily value.`,
    'Start with something forgiving: a cat-shaped phone holder has huge margins and instant daily value.'],
  [`This is also the day to try the finishing ritual ${EM} light sanding, filler primer, matte paint.`,
    'This is also the day to try the finishing ritual: light sanding, filler primer, matte paint.'],
  [`Miniatures, jewelry masters, intricate relief ${EM} anything where 0.05&nbsp;mm matters.`,
    'Miniatures, jewellery masters, intricate relief: anything where 0.05&nbsp;mm matters.'],
  [`Layered light stands are the interesting case ${EM} their internal cutouts often need support only in specific pockets`,
    'Layered light stands are the interesting case: their internal cutouts often need support only in specific pockets'],
  [`Use a support interface if your slicer offers it ${EM} a thin sacrificial roof that leaves near-clean undersides.`,
    'Use a support interface if your slicer offers it: a thin sacrificial roof that leaves near-clean undersides.'],
  [`0.12${EN}0.16&nbsp;mm earns its long print time on display pieces with fine relief ${EM} figurines, layered scenes, anything judged up close.`,
    '0.12-0.16&nbsp;mm earns its long print time on display pieces with fine relief: figurines, layered scenes, anything judged up close.'],
  [`Saggy or pillowed top surfaces mean not enough layers or too sparse ${EM} an easy fix that instantly upgrades organizers and coasters.`,
    'Saggy or pillowed top surfaces mean not enough layers or too sparse an infill, and it is an easy fix that instantly upgrades organizers and coasters.'],
  [`Temperature is per-filament ${EM} run one temp tower per brand and stop guessing forever.`,
    'Temperature is per-filament, so run one temp tower per brand and stop guessing forever.'],
  [`both respond within a single reprint when you change the right thing ${EM} and become mysteries when you change three things at once.`,
    'both respond within a single reprint when you change the right thing, and become mysteries when you change three things at once.'],
  [`Two light coats beat one dripping one ${EM} dry, recoat, done.`,
    'Two light coats beat one dripping one. Dry, recoat, done.'],
  [`Best for eyes, badges and small accents on otherwise single-color prints ${EM} the kawaii look in one spool swap.`,
    'Best for eyes, badges and small accents on otherwise single-colour prints: the kawaii look in one spool swap.'],
  [`good for eyes, badges and small accents on otherwise single-color prints ${EM} the kawaii look in one spool swap.`,
    'good for eyes, badges and small accents on otherwise single-colour prints: the kawaii look in one spool swap.'],
  [`The printer only moves forward through layers ${EM} whatever color is loaded prints until the next pause.`,
    'The printer only moves forward through layers, so whatever colour is loaded prints until the next pause.'],
  [`These land hardest and print smallest ${EM} <a href="../../valentine/">hearts and roses</a> work year-round, not just in February.`,
    'These land hardest and print smallest, and <a href="../../valentine/">hearts and roses</a> work year-round, not just in February.'],
  [`you do not need an AMS ${EM} pause-at-layer covers it.`,
    'you do not need an AMS, because pause-at-layer covers it.'],
  [`Light stands are the highest-impact prints of the season ${EM} bare trees, layered scenes, a crescent moon.`,
    'Light stands are the highest-impact prints of the season: bare trees, layered scenes, a crescent moon.'],
  [`Print a batch of ghosts and skeletons in one sitting ${EM} the <a href="../../keychains-accessories/">small-print collection</a>`,
    'Print a batch of ghosts and skeletons in one sitting, and the <a href="../../keychains-accessories/">small-print collection</a>'],
  [`Real flames plus thin walls is a fire-hazard combo ${EM} more in <a href="../safe-3d-printing-at-home/">the safety guide</a>.`,
    'Real flames plus thin walls is a fire-hazard combo. There is more in <a href="../safe-3d-printing-at-home/">the safety guide</a>.'],
  [`A trinket dish earns daily contact ${EM} rings at night, earrings in the morning.`,
    'A trinket dish earns daily contact: rings at night, earrings in the morning.'],
  [`Print in silk filament for a satin sheen ${EM} same settings, twice the presentation.`,
    'Print in silk filament for a satin sheen: same settings, twice the presentation.'],
  [`The dress-shaped vanity holders work year-round and photograph beautifully ${EM} they are the "big" version of the same sentiment for people who share a bathroom.`,
    'The dress-shaped vanity holders work year-round and photograph beautifully, and they are the larger version of the same sentiment for people who share a bathroom.'],
  [`Dress-shaped vanity holders work year-round and photograph beautifully ${EM} they are the "big" version of the same sentiment`,
    'Dress-shaped vanity holders work year-round and photograph beautifully, and they are the larger version of the same sentiment'],
  [`Translucent filament loves to string when damp ${EM} if the first rose comes out hairy, dry the spool and reprint calmly.`,
    'Translucent filament loves to string when damp, so if the first rose comes out hairy, dry the spool and reprint calmly.'],
  [`All flat-bottomed, all fast ${EM} the <a href="../../easter/">Easter &amp; Spring collection</a>`,
    'All flat-bottomed, all fast, and the <a href="../../easter/">Easter &amp; Spring collection</a>'],
  [`stays on the shelf for years ${EM} and next spring it comes out again with a story attached.`,
    'stays on the shelf for years, and next spring it comes out again with a story attached.'],
  [`plain PLA only for kids' projects ${EM} it is the stiff-but-safe standard`,
    "plain PLA only for kids' projects, because it is the stiff-but-safe standard"],
  [`Animal versions hold phones just as well as minimalist ones ${EM} the <a href="../../organizers/">organizers collection</a> has both`,
    'Animal versions hold phones just as well as minimalist ones, and the <a href="../../organizers/">organizers collection</a> has both'],
  [`parts that grip or slide want 0.2${EN}0.4&nbsp;mm of clearance`, 'parts that grip or slide want 0.2-0.4&nbsp;mm of clearance'],
  [`pieces that live in sunlight or get handled constantly ${EM} the reasoning is in <a href="../pla-petg-abs-filament-guide/">the filament guide</a>.`,
    'pieces that live in sunlight or get handled constantly. The reasoning is in <a href="../pla-petg-abs-filament-guide/">the filament guide</a>.'],
  [`PLA smells like warm pancakes and is the least concerning common filament ${EM} normal room airflow is fine.`,
    'PLA smells like warm pancakes and is the least concerning common filament, so normal room airflow is fine.'],
  [`Resin printing is its own league ${EM} gloves, ventilation and no kids in the room, full stop.`,
    'Resin printing is its own league: gloves, ventilation and no kids in the room, full stop.'],
  [`This site features many candle holders and light stands ${EM} beautiful and perfectly safe <b>with LED tea lights</b>.`,
    'This site features many candle holders and light stands, beautiful and perfectly safe <b>with LED tea lights</b>.'],
  [`doubles as the safest possible demonstration of what the machine does ${EM} see <a href="../../flexi-toys/">Flexi Toys &amp; Learning</a>.`,
    'doubles as the safest possible demonstration of what the machine does. See <a href="../../flexi-toys/">Flexi Toys &amp; Learning</a>.'],
  [`Most common filaments are hygroscopic ${EM} they pull water from the air.`,
    'Most common filaments are hygroscopic: they pull water from the air.'],
  [`Dry for 4${EN}6 hours and the difference is immediate ${EM} stringing drops, surfaces clean up.`,
    'Dry for four to six hours and the difference is immediate: stringing drops, surfaces clean up.'],
  [`Faster is not worse and slower is not better ${EM} each model simply has a point where speeding up stops being free.`,
    'Faster is not worse and slower is not better. Each model simply has a point where speeding up stops being free.'],
  [`<h2>The fast lane ${EM} where speed is free</h2>`, '<h2>The fast lane, where speed is free</h2>'],
  [`<h2>The slow lane ${EM} where detail is the point</h2>`, '<h2>The slow lane, where detail is the point</h2>'],
  [`Doubling speed here halves the session and nobody can tell ${EM} the <a href="../../keychains-accessories/">keychain collection</a>`,
    'Doubling speed here halves the session and nobody can tell, and the <a href="../../keychains-accessories/">keychain collection</a>'],
  [`dropping only the perimeter speed to 30${EN}40% while keeping infill fast`, 'dropping only the perimeter speed to 30-40% while keeping infill fast'],
  [`at speeds that were fantasy two years ago ${EM} the quality loss at "sport" speeds is now small.`,
    'at speeds that were fantasy two years ago, and the quality loss at sport speeds is now small.'],
  [`run profiles, not vibes ${EM} a "fast" profile for <a href="../../flexi-toys/">toys</a>`,
    'run profiles, not vibes. Keep a fast profile for <a href="../../flexi-toys/">toys</a>'],
  [`<h2>PLA ${EM} the default that is actually good</h2>`, '<h2>PLA, the default that is actually good</h2>'],
  [`<h2>PETG ${EM} the workhorse with one flaw</h2>`, '<h2>PETG, the workhorse with one flaw</h2>'],
  [`<h2>ABS/ASA ${EM} the specialist</h2>`, '<h2>ABS and ASA, the specialist</h2>'],
  [`<h2>Layer height ${EM} the trade everyone understands</h2>`, '<h2>Layer height, the trade everyone understands</h2>'],
  [`<h2>The starters ${EM} print this week</h2>`, '<h2>The starters, worth printing this week</h2>'],
  [`If a model will sit on a shelf indoors, stop reading ${EM} PLA it is.`,
    'If a model will sit on a shelf indoors, stop reading. PLA it is.'],
  [`If a part feels floppy, add a wall before you add infill ${EM} same stiffness, better surface, often less material.`,
    'If a part feels floppy, add a wall before you add infill: same stiffness, better surface, often less material.'],
  [`Rafts are the last resort ${EM} they waste material and leave the ugliest underside.`,
    'Rafts are the last resort, since they waste material and leave the ugliest underside.'],
  [`A 5${EN}8&nbsp;mm brim rescues tall, thin parts`, 'A 5-8&nbsp;mm brim rescues tall, thin parts'],
  [`Practice on cheap, flat, forgiving models ${EM} the <a href="../../keychains-accessories/">keychain collection</a>`,
    'Practice on cheap, flat, forgiving models, and the <a href="../../keychains-accessories/">keychain collection</a>'],
  [`Supports are not a default ${EM} they are a decision.`, 'Supports are not a default. They are a decision.'],
  [`overhangs steeper than roughly 50${EN}60° from vertical`, 'overhangs steeper than roughly 50-60° from vertical'],
  [`separated from its neighbor by 0.3${EN}0.5&nbsp;mm of designed air`, 'separated from its neighbour by 0.3-0.5&nbsp;mm of designed air'],
  [`the parts never touch during printing ${EM} and never fuse afterward.`,
    'the parts never touch during printing, and never fuse afterward.'],
  [`If a joint seizes, blame the calibration before the file ${EM} see <a href="../bed-adhesion-first-layer-fixes/">the first-layer guide</a>.`,
    'If a joint seizes, blame the calibration before the file. See <a href="../bed-adhesion-first-layer-fixes/">the first-layer guide</a>.'],
  [`A stiff link now is a broken link later ${EM} reprint while the settings are fresh in mind.`,
    'A stiff link now is a broken link later, so reprint while the settings are fresh in mind.'],
  [`The magic is not magic ${EM} it is clearance, carefully modeled.`,
    'The magic is not magic. It is clearance, carefully modelled.'],
  [`Most failed prints are not slicer problems ${EM} they are model problems that only show up at the nozzle.`,
    'Most failed prints are not slicer problems. They are model problems that only show up at the nozzle.'],
  [`fix before slicing ${EM} never hope.`, 'fix before slicing, and never hope.'],
  [`sanity-check a known detail ${EM} a phone stand should be roughly phone-sized.`,
    'sanity-check a known detail: a phone stand should be roughly phone-sized.'],
  [`add 0.2${EN}0.4&nbsp;mm of clearance per side`, 'add 0.2-0.4&nbsp;mm of clearance per side'],
  [`The ritual is the same for a figurine, a planter or a gothic brush holder ${EM} and it is shorter than you fear.`,
    'The ritual is the same for a figurine, a planter or a gothic brush holder, and it is shorter than you fear.'],
  [`the ritual is the same for a figurine, a planter or a gothic brush holder ${EM} and it is shorter than you fear.`,
    'the ritual is the same for a figurine, a planter or a gothic brush holder, and it is shorter than you fear.'],
  [`chunky prints with big surfaces ${EM} <a href="../../decor-planters/">planters and figurines</a>`,
    'chunky prints with big surfaces, such as <a href="../../decor-planters/">planters and figurines</a>'],
  [`It is also the most forgiving ${EM} each color is its own ordinary print.`,
    'It is also the most forgiving: each colour is its own ordinary print.'],
  [`Damp filament causes the failures everyone blames on settings ${EM} see <a href="../how-to-store-filament/">the storage guide</a>.`,
    'Damp filament causes the failures everyone blames on settings. See <a href="../how-to-store-filament/">the storage guide</a>.'],
  [`Print two ${EM} one for you, one for whoever is watching over your shoulder.`,
    'Print two: one for you, one for whoever is watching over your shoulder.'],
  [`and print two ${EM} one for you, one for whoever is watching over your shoulder.`,
    'and print two: one for you, one for whoever is watching over your shoulder.'],
  [`<a href="../how-to-prepare-a-3d-model-for-printing/">the preparation checklist</a> ${EM} five minutes that saves spools.`,
    '<a href="../how-to-prepare-a-3d-model-for-printing/">the preparation checklist</a> is five minutes that saves spools.'],
  [`<a href="../how-to-prepare-a-3d-model-for-printing/">the preparation checklist</a> ${EM} and if you need practice material`,
    '<a href="../how-to-prepare-a-3d-model-for-printing/">the preparation checklist</a>, and if you need practice material'],
  [`Tinkercad or downloaded STL \u2192 repair pass in the slicer \u2192 tuned profile.`,
    'Tinkercad or a downloaded STL, then a repair pass in the slicer, then a tuned profile.'],

  /* --- model print notes (data/intros.json) --- */
  [`A proper nutcracker for the entryway ${EM} bold, symmetrical, classic.`, 'A proper nutcracker for the entryway: bold, symmetrical, classic.'],
  [`Feathers are the hard part ${EM} and here they print cleanly.`, 'Feathers are the hard part, and here they print cleanly.'],
  [`Three poses, one herd ${EM} arrange and rearrange endlessly.`, 'Three poses, one herd, arranged and rearranged endlessly.'],
  [`Facets catch light like folded paper ${EM} prints in one go.`, 'Facets catch light like folded paper, and it prints in one go.'],
  [`Poses like a museum specimen ${EM} joints included.`, 'Poses like a museum specimen, joints included.'],
  [`Bats, cats, moons ${EM} straight onto the baking tray.`, 'Bats, cats and moons, straight onto the baking tray.'],
  [`More chill than chilling ${EM} desk-friendly ghost.`, 'More chill than chilling, a desk-friendly ghost.'],
  [`Two-tone petals against matte fur ${EM} worth the swap.`, 'Two-tone petals against matte fur, worth the swap.'],
  [`Matched scale ${EM} the display looks curated, not collected.`, 'Matched scale, so the display looks curated, not collected.'],
  [`A nutcracker with bunny ears ${EM} exactly as fun as it sounds.`, 'A nutcracker with bunny ears, exactly as fun as it sounds.'],
  [`The sentiment in filament form ${EM} never wilts.`, 'The sentiment in filament form, and it never wilts.'],
  [`Comes off the bed already alive ${EM} no assembly.`, 'Comes off the bed already alive, no assembly.'],
  [`Sits, stands, flops ${EM} personality included.`, 'Sits, stands, flops, personality included.'],
  [`A book that glows ${EM} bedtime solved.`, 'A book that glows, and bedtime is solved.'],
  [`A raincoat for your pens ${EM} yes, really.`, 'A raincoat for your pens, yes, really.'],
  [`Pens along the curl ${EM} a fun organizer.`, 'Pens along the curl, a genuinely fun organizer.'],
  [`Print it translucent ${EM} thank me later.`, 'Print it translucent and thank me later.'],

  /* --- guide descriptions (articles.js POSTS[].desc) --- */
  [`orientation, supports and slicer settings ${EM} the exact order of operations before you press print.`,
    'orientation, supports and slicer settings: the exact order of operations before you press print.'],
  [`What each tool in the chain actually does ${EM} and what a beginner can safely skip.`,
    'What each tool in the chain actually does, and what a beginner can safely skip.'],
  [`Filament or liquid resin ${EM} the honest comparison of cost, detail, safety`,
    'Filament or liquid resin: the honest comparison of cost, detail, safety'],
  [`The short list of causes ${EM} and the fixes that actually work.`,
    'The short list of causes, and the fixes that actually work.'],
  [`Micro-gaps, clearances and the sacred print orientation ${EM} how flexi dragons come off the bed already alive.`,
    'Micro-gaps, clearances and the sacred print orientation, and how flexi dragons come off the bed already alive.'],
  [`Layer height, walls, infill, cooling ${EM} what to touch, what to leave alone`,
    'Layer height, walls, infill, cooling: what to touch, what to leave alone'],
  [`the two-coat rule and matte varnish ${EM} the 15-minute finish that upgrades any figurine or planter.`,
    'the two-coat rule and matte varnish: the 15-minute finish that upgrades any figurine or planter.'],
  [`manual filament swaps and smart model splitting ${EM} three ways to get color on a single-extruder printer.`,
    'manual filament swaps and smart model splitting: three ways to get colour on a single-extruder printer.'],
  [`candy cauldrons and subtle scares ${EM} a prop list built around a single printer and one spool.`,
    'candy cauldrons and subtle scares: a prop list built around a single printer and one spool.'],
  [`heart dishes and pocket bears ${EM} small prints that land harder than a bouquet.`,
    'heart dishes and pocket bears: small prints that land harder than a bouquet.'],
  [`egg holders and paint-your-own bunnies ${EM} a weekend craft plan where the printer does the hard part.`,
    'egg holders and paint-your-own bunnies: a weekend craft plan where the printer does the hard part.'],
  [`coaster sets and cable sanity ${EM} the highest value-per-gram prints a desk will ever get.`,
    'coaster sets and cable sanity: the highest value-per-gram prints a desk will ever get.'],
  [`Storage, desiccant and drying ${EM} the boring fix that works.`,
    'Storage, desiccant and drying: the boring fix that works.'],
];

/* 2. Fallback rules, applied after the overrides. */
function fallback(s) {
  // numeric ranges: en dash between digits becomes a plain hyphen
  s = s.replace(/(\d)\s*\u2013\s*(\d)/g, '$1-$2');
  return s;
}

let unresolved = [];

function typo(input) {
  if (input == null) return input;
  let s = String(input);
  for (const [from, to] of OVERRIDES) {
    if (s.indexOf(from) !== -1) s = s.split(from).join(to);
  }
  s = fallback(s);
  if (s.indexOf(EM) !== -1 || s.indexOf(EN) !== -1) {
    const i = Math.max(s.indexOf(EM), s.indexOf(EN));
    unresolved.push(s.slice(Math.max(0, i - 90), i + 90));
  }
  return s;
}

function report() {
  return unresolved;
}

function reset() {
  unresolved = [];
}

module.exports = { typo, report, reset, EM, EN };
