/* probe-scroll.js - does scrolling the iframe content trigger the reveal? */
'use strict';
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const ROOT=path.join(__dirname,'..');
const CHROME='C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const fu=p=>'file:///'+p.replace(/\\/g,'/').replace(/ /g,'%20');
const h=`<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0}iframe{width:1280px;height:900px;border:0}</style></head>
<body><iframe id="f" src="${fu(path.join(ROOT,'index.html'))}"></iframe>
<script>
function finish(m){if(document.getElementById('__result'))return;var t=document.createElement('title');t.id='__result';t.textContent=m;document.head.appendChild(t);}
document.getElementById('f').addEventListener('load',function(){
  setTimeout(function(){
    var win=document.getElementById('f').contentWindow, doc=win.document;
    var info=[];
    var targets=[].slice.call(doc.querySelectorAll('[data-reveal]'));
    info.push('targets='+targets.length);
    info.push('vis@start='+targets.filter(el=>el.classList.contains('is-visible')).length);
    // scroll using window.scrollTo inside the iframe
    win.scrollTo(0, 3000);
    setTimeout(function(){
      info.push('vis@afterScroll='+targets.filter(el=>el.classList.contains('is-visible')).length);
      // also try dispatching scroll on window
      win.dispatchEvent(new win.Event('scroll'));
      setTimeout(function(){
        info.push('vis@afterEvent='+targets.filter(el=>el.classList.contains('is-visible')).length);
        info.push('scrollTop='+doc.documentElement.scrollTop);
        finish(info.join(' ;; '));
      }, 500);
    }, 500);
  }, 600);
});
setTimeout(function(){finish('TIMEOUT');},30000);
</script></body></html>`;
const t=path.join(ROOT,'__scroll.html');fs.writeFileSync(t,h,'utf8');
try{
  const d=execFileSync(CHROME,['--headless=old','--disable-gpu','--no-sandbox','--hide-scrollbars','--allow-file-access-from-files','--window-size=1360,1000','--dump-dom',fu(t)],{encoding:'utf8',stdio:['ignore','pipe','ignore'],maxBuffer:40*1024*1024,timeout:30000});
  const m=d.match(/<title id="__result">([\s\S]*?)<\/title>/);
  console.log((m?m[1]:'no result').split(' ;; ').join('\n'));
}catch(e){console.log('ERR',e.message);}
fs.unlinkSync(t);
