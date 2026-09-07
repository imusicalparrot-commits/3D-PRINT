/* probe-reveal.js - why are reveal targets not getting .is-visible? */
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const fileUrl = (p) => 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20');

const harness = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0}iframe{width:1280px;height:900px;border:0}</style></head>
<body><iframe id="f" src="${fileUrl(path.join(ROOT, 'index.html'))}"></iframe>
<script>
function finish(m){if(document.getElementById('__result'))return;var t=document.createElement('title');t.id='__result';t.textContent=m;document.head.appendChild(t);}
document.getElementById('f').addEventListener('load',function(){
  setTimeout(function(){
    var win=document.getElementById('f').contentWindow, doc=win.document;
    var info=[];
    info.push('html.js? '+doc.documentElement.classList.contains('js'));
    var targets=[].slice.call(doc.querySelectorAll('[data-reveal]'));
    info.push('targets='+targets.length);
    info.push('visible@t0='+targets.filter(function(el){return el.classList.contains('is-visible');}).length);
    // check if first target is in view and its CSS
    if(targets[0]){
      var b=targets[0].getBoundingClientRect();
      info.push('t0 top='+Math.round(b.top)+' bottom='+Math.round(b.bottom));
      info.push('vh='+win.innerHeight);
      var cs=win.getComputedStyle(targets[0]);
      info.push('t0 opacity='+cs.opacity+' transform='+cs.transform);
    }
    setTimeout(function(){
      var vis=targets.filter(function(el){return el.classList.contains('is-visible');}).length;
      info.push('visible@t1500='+vis);
      finish(info.join(' ;; '));
    }, 1500);
  }, 600);
});
setTimeout(function(){finish('TIMEOUT');},20000);
</script></body></html>`;

const temp = path.join(ROOT, '__reveal.html');
fs.writeFileSync(temp, harness, 'utf8');
const dom = execFileSync(CHROME, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
  '--allow-file-access-from-files', '--virtual-time-budget=22000',
  '--window-size=1360,1000', '--dump-dom', fileUrl(temp),
], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 40 * 1024 * 1024 });
fs.unlinkSync(temp);
const m = dom.match(/<title id="__result">([\s\S]*?)<\/title>/);
console.log((m ? m[1] : 'no result').split(' ;; ').join('\n'));
