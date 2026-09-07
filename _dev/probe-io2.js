/* probe-io2.js - force IO to fire by scrolling, and test both headless modes */
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const fileUrl = (p) => 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20');

function run(mode, budget) {
  const harness = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0}iframe{width:1280px;height:900px;border:0}</style></head>
<body><iframe id="f" src="${fileUrl(path.join(ROOT, 'index.html'))}"></iframe>
<script>
function finish(m){if(document.getElementById('__result'))return;var t=document.createElement('title');t.id='__result';t.textContent=m;document.head.appendChild(t);}
document.getElementById('f').addEventListener('load',function(){
  setTimeout(function(){
    var win=document.getElementById('f').contentWindow, doc=win.document;
    var info=[];
    var targets=[].slice.call(doc.querySelectorAll('[data-reveal]'));
    // scroll the content inside the iframe through its full height in steps
    var inner=doc.documentElement;
    var fired=0;
    var myObs=new win.IntersectionObserver(function(es){fired+=es.filter(function(e){return e.isIntersecting;}).length;},{threshold:0.12});
    targets.slice(0,6).forEach(function(el){myObs.observe(el);});
    var steps=8, i=0;
    (function step(){
      inner.scrollTop = (inner.scrollHeight-inner.clientHeight)*(i/steps);
      i++;
      if(i<=steps){setTimeout(step,150);}
      else{
        info.push('myObserverFired='+fired);
        var vis=targets.filter(function(el){return el.classList.contains('is-visible');}).length;
        info.push('visible='+vis+'/'+targets.length);
        finish(info.join(' ;; '));
      }
    })();
  }, 500);
});
setTimeout(function(){finish('TIMEOUT');},40000);
</script></body></html>`;
  const temp = path.join(ROOT, '__io2.html');
  fs.writeFileSync(temp, harness, 'utf8');
  const dom = execFileSync(CHROME, [
    mode, '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--allow-file-access-from-files', '--virtual-time-budget=' + budget,
    '--window-size=1360,1000', '--dump-dom', fileUrl(temp),
  ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 40 * 1024 * 1024 });
  fs.unlinkSync(temp);
  const m = dom.match(/<title id="__result">([\s\S]*?)<\/title>/);
  console.log((mode + ' budget=' + budget + ' -> ' + (m ? m[1] : 'no result')).split(' ;; ').join('   '));
}

run('--headless=new', 30000);
