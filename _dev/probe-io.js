/* probe-io.js - does the IntersectionObserver fire under virtual time? */
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
    info.push('IO supported: '+('IntersectionObserver' in win));
    var targets=[].slice.call(doc.querySelectorAll('[data-reveal]'));
    info.push('targets='+targets.length);
    var vis0=targets.filter(function(el){return el.classList.contains('is-visible');}).length;
    info.push('visible@t0='+vis0);
    // install our own observer to see if it fires
    var fired=0;
    var myObs=new win.IntersectionObserver(function(es){fired+=es.length;},{threshold:0.12});
    targets.forEach(function(el){myObs.observe(el);});
    setTimeout(function(){
      info.push('myObserverFired='+fired);
      var vis1=targets.filter(function(el){return el.classList.contains('is-visible');}).length;
      info.push('visible@t2000='+vis1);
      finish(info.join(' ;; '));
    }, 2000);
  }, 600);
});
setTimeout(function(){finish('TIMEOUT');},20000);
</script></body></html>`;

const temp = path.join(ROOT, '__io.html');
fs.writeFileSync(temp, harness, 'utf8');
const dom = execFileSync(CHROME, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
  '--allow-file-access-from-files', '--virtual-time-budget=22000',
  '--window-size=1360,1000', '--dump-dom', fileUrl(temp),
], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 40 * 1024 * 1024 });
fs.unlinkSync(temp);
const m = dom.match(/<title id="__result">([\s\S]*?)<\/title>/);
console.log((m ? m[1] : 'no result').split(' ;; ').join('\n'));
