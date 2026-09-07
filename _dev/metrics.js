/* metrics.js - report the rendered composition so the layout can be judged
   without looking at a screenshot: column counts, section rhythm, image sizes */
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const fileUrl = (p) => 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20');

const SCRIPT = `
  var out = [];
  function cols(sel) {
    var el = doc.querySelector(sel);
    if (!el) return sel + ' absent';
    var n = win.getComputedStyle(el).gridTemplateColumns.split(' ').length;
    return sel + ' -> ' + n + ' cols (' + win.getComputedStyle(el).gridTemplateColumns + ')';
  }
  out.push('viewport ' + doc.documentElement.clientWidth);
  ['.masthead-grid', '.colophon', '.catalogue-grid', '.mosaic', '.steps-grid', '.mega-inner', '.cat-head-grid', '.index-row'].forEach(function (s) {
    if (doc.querySelector(s)) out.push('  ' + cols(s));
  });

  /* section rhythm: the vertical gap between consecutive section tops */
  var secs = [].slice.call(doc.querySelectorAll('main section'));
  var rhythm = secs.map(function (s) {
    var cs = win.getComputedStyle(s);
    return (s.className.split(' ')[0] || 'section') + '=' + Math.round(parseFloat(cs.paddingTop)) + '/' + Math.round(parseFloat(cs.paddingBottom));
  });
  out.push('  section padding top/bottom: ' + rhythm.join(' '));

  /* measure: the reading column width in characters */
  var p = doc.querySelector('.editorial p, .prose p, .legal p');
  if (p) {
    var w = p.getBoundingClientRect().width;
    var fsz = parseFloat(win.getComputedStyle(p).fontSize);
    out.push('  reading measure ~' + Math.round(w / (fsz * 0.5)) + 'ch at ' + Math.round(fsz) + 'px');
  }

  /* image render sizes, to confirm nothing is upscaled past its source */
  var over = 0, imgs = doc.querySelectorAll('img');
  for (var i = 0; i < imgs.length; i++) {
    var b = imgs[i].getBoundingClientRect();
    if (b.width > imgs[i].naturalWidth + 1 && imgs[i].naturalWidth > 0) over++;
  }
  out.push('  images ' + imgs.length + ', upscaled past source: ' + over);

  /* type scale actually in use */
  var sizes = {};
  ['h1', 'h2', 'h3', '.lede', 'p', '.index-name', '.cat-item-note', '.mono-tag'].forEach(function (s) {
    var e = doc.querySelector(s);
    if (e) sizes[s] = Math.round(parseFloat(win.getComputedStyle(e).fontSize)) + 'px';
  });
  out.push('  type: ' + Object.keys(sizes).map(function (k) { return k + ' ' + sizes[k]; }).join(', '));

  finish(out.join(' ;; '));
`;

function harness(target, width) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0}iframe{display:block;width:${width}px;height:1000px;border:0}</style></head>
<body><iframe id="f" src="${target}"></iframe>
<script>
function finish(m){if(document.getElementById('__result'))return;var t=document.createElement('title');t.id='__result';t.textContent=m;document.head.appendChild(t);}
document.getElementById('f').addEventListener('load',function(){setTimeout(function(){
var win=document.getElementById('f').contentWindow,doc=win.document;
try{${SCRIPT}}catch(e){finish('ERROR '+e.message);}
},600);});
setTimeout(function(){finish('TIMEOUT');},15000);
</script></body></html>`;
}

const target = process.argv[2] || 'index.html';
const widths = process.argv[3] ? [Number(process.argv[3])] : [375, 768, 1440];
const file = path.join(ROOT, target.split('/').join(path.sep));

for (const w of widths) {
  const temp = path.join(ROOT, '__metrics.html');
  fs.writeFileSync(temp, harness(fileUrl(file), w), 'utf8');
  const dom = execFileSync(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--allow-file-access-from-files', '--virtual-time-budget=16000',
    '--window-size=' + Math.max(w + 40, 560) + ',1100', '--dump-dom', fileUrl(temp),
  ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 40 * 1024 * 1024 });
  fs.unlinkSync(temp);
  const m = dom.match(/<title id="__result">([\s\S]*?)<\/title>/);
  console.log((m ? m[1] : 'no result').split(' ;; ').join('\n'));
  console.log('');
}
