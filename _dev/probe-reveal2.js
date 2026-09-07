/* probe-reveal2.js - does the reveal mechanism work when we scroll? */
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
    var targets=[].slice.call(doc.querySelectorAll('[data-reveal]'));
    info.push('targets='+targets.length);

    // Find the first target above the fold (there must be one)
    var firstAbove = targets.filter(function(el){
      var b=el.getBoundingClientRect();
      return b.top < win.innerHeight && b.bottom > 0;
    });
    info.push('aboveFold='+firstAbove.length);
    if(firstAbove[0]){
      info.push('firstAboveClass='+(firstAbove[0].classList.contains('is-visible')?'visible':'hidden'));
      info.push('firstAboveTop='+Math.round(firstAbove[0].getBoundingClientRect().top));
    }

    // Now scroll down step by step and count how many become visible
    var inner=doc.documentElement;
    var totalH=inner.scrollHeight, vh=inner.clientHeight;
    var revealedByScroll=0;
    var steps=10, i=0;
    function countVis(){return targets.filter(function(el){return el.classList.contains('is-visible');}).length;}
    info.push('vis@start='+countVis());

    (function step(){
      inner.scrollTop = Math.min(totalH-vh, (totalH-vh)*(i/steps));
      i++;
      if(i<=steps){
        setTimeout(step, 200);
      } else {
        // give the scroll handler one more tick
        setTimeout(function(){
          info.push('vis@end='+countVis());
          info.push('scrollH='+Math.round(totalH)+' clientH='+Math.round(vh));
          finish(info.join(' ;; '));
        }, 400);
      }
    })();
  }, 500);
});
setTimeout(function(){finish('TIMEOUT');},40000);
</script></body></html>`;

const temp = path.join(ROOT, '__reveal2.html');
fs.writeFileSync(temp, harness, 'utf8');
const dom = execFileSync(CHROME, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
  '--allow-file-access-from-files', '--virtual-time-budget=40000',
  '--window-size=1360,1000', '--dump-dom', fileUrl(temp),
], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 40 * 1024 * 1024 });
fs.unlinkSync(temp);
const m = dom.match(/<title id="__result">([\s\S]*?)<\/title>/);
console.log((m ? m[1] : 'no result').split(' ;; ').join('\n'));
