(function(){
  if(window.__guideGuestAgesInstalled)return;
  window.__guideGuestAgesInstalled=true;
  function q(s,r){return(r||document).querySelector(s);}
  function read(){try{var v=JSON.parse(localStorage.getItem('guideGuestAges')||'[]');return Array.isArray(v)?v:[];}catch(e){return[];}}
  function write(v){try{localStorage.setItem('guideGuestAges',JSON.stringify(v));}catch(e){}}
  function count(){var el=q('#obChildren');return el?Math.max(0,Math.min(8,+el.value||0)):0;}
  function normalize(n){var a=read().slice(0,n);while(a.length<n)a.push(null);return a;}
  function syncParty(){
    var adults=q('#obAdults'),children=q('#obChildren');if(!adults&&!children)return;
    try{var ob=JSON.parse(localStorage.getItem('guideOnboarding')||'{}');if(adults)ob.adults=Math.max(1,+adults.value||1);if(children)ob.children=Math.max(0,+children.value||0);localStorage.setItem('guideOnboarding',JSON.stringify(ob));}catch(e){}
  }
  function build(host,n,ages){
    host.dataset.count=String(n);
    var options='<option value="">Возраст</option>';for(var i=0;i<=17;i++)options+='<option value="'+i+'">'+i+(i===1?' год':(i>=2&&i<=4?' года':' лет'))+'</option>';
    host.innerHTML='<b>Возраст детей</b><div class="guide-child-age-grid">'+ages.map(function(age,i){return'<label>Ребёнок '+(i+1)+'<select data-child-age="'+i+'">'+options+'</select></label>';}).join('')+'</div><div class="guide-child-age-note">Возраст нужен сервисам бронирования для корректного состава гостей и цены.</div><div class="guide-child-age-error"></div>';
    Array.prototype.forEach.call(host.querySelectorAll('[data-child-age]'),function(sel){var idx=+sel.dataset.childAge;if(ages[idx]!=null)sel.value=String(ages[idx]);sel.onchange=function(){var a=normalize(count()),v=sel.value;a[idx]=v===''?null:+v;write(a);var er=q('.guide-child-age-error',host);if(er)er.textContent='';};});
  }
  function render(){
    var input=q('#obChildren');if(!input)return;
    syncParty();
    var n=count(),host=q('#guideChildAges');
    if(!n){if(host)host.remove();write([]);return;}
    var ages=normalize(n);
    if(!host){host=document.createElement('div');host.id='guideChildAges';host.className='guide-child-ages';var counters=input.closest('.ob-counters');if(counters)counters.insertAdjacentElement('afterend',host);}
    if(host.dataset.count!==String(n)||host.querySelectorAll('[data-child-age]').length!==n)build(host,n,ages);
  }
  function schedule(){setTimeout(render,0);}
  document.addEventListener('input',function(e){if(e.target&&(e.target.id==='obChildren'||e.target.id==='obAdults'))schedule();},true);
  document.addEventListener('change',function(e){if(e.target&&(e.target.id==='obChildren'||e.target.id==='obAdults'))schedule();},true);
  document.addEventListener('click',function(e){var b=e.target&&e.target.closest&&e.target.closest('.ob-next');if(!b||!q('#obChildren'))return;syncParty();render();var n=count();if(!n){write([]);return;}var a=normalize(n),ok=a.length===n&&a.every(function(v){return Number.isInteger(v)&&v>=0&&v<=17;});if(!ok){e.preventDefault();e.stopImmediatePropagation();var er=q('#guideChildAges .guide-child-age-error');if(er)er.textContent='Укажите возраст каждого ребёнка.';return;}write(a);},true);
  document.addEventListener('click',function(e){if(e.target&&e.target.closest&&e.target.closest('#betaOnboarding'))schedule();},false);
  var st=document.createElement('style');st.id='guide-child-ages-style';st.textContent='.guide-child-ages{margin-top:14px;padding:12px;border:1px solid var(--line);border-radius:12px;background:var(--card)}.guide-child-ages>b{font-size:13px}.guide-child-age-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:9px}.guide-child-age-grid label{font-size:10px;color:var(--muted);font-weight:750}.guide-child-age-grid select{display:block;width:100%;margin-top:4px;padding:10px;border:1px solid var(--line);border-radius:10px;background:var(--card);color:var(--text)}.guide-child-age-note{margin-top:7px;color:var(--muted);font-size:10px;line-height:1.35}.guide-child-age-error{margin-top:6px;color:#a34e32;font-size:11px;font-weight:800}@media(max-width:560px){.guide-child-age-grid{grid-template-columns:1fr 1fr}}';if(!q('#'+st.id))document.head.appendChild(st);
  setTimeout(render,250);
  setInterval(render,500);
})();
