(function(){
  'use strict';
  var slugs={'Калининград':'kaliningrad','Зеленоградск':'zelenogradsk','Светлогорск':'svetlogorsk','Пионерский':'pionerskiy','Янтарный':'yantarnyi','Балтийск':'baltiisk','Гусев':'gusev'};
  function q(s,r){return (r||document).querySelector(s);}
  function readJson(k,d){try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d));}catch(e){return d;}}
  function append(u,k,v){if(v===undefined||v===null||v==='')return u;return u+(u.indexOf('?')>=0?'&':'?')+encodeURIComponent(k)+'='+encodeURIComponent(v);}

  /* Public Beta hotfix: current Yandex Travel web parameters + correct Ostrovok slugs. */
  function patchCommerce(){
    if(!window.guideCommerce){setTimeout(patchCommerce,60);return;}
    window.guideCommerce.buildYandexTravelHotelUrl=function(ctx){
      ctx=ctx||{};
      var city=ctx.city||'',slug=ctx.slug||slugs[city]||'kaliningrad';
      var u='https://travel.yandex.ru/hotels/'+slug+'/';
      if(ctx.adults)u=append(u,'adults',ctx.adults);
      if(ctx.start)u=append(u,'checkinDate',ctx.start);
      if(ctx.end)u=append(u,'checkoutDate',ctx.end);
      var ages=ctx.childrenAges;
      if(!Array.isArray(ages)||!ages.length)ages=readJson('guideGuestAges',[]);
      if(Array.isArray(ages)&&ages.length)u=append(u,'childrenAges',ages.join(','));
      u=append(u,'roomCount',ctx.roomCount||1);
      var cfg=window.guideCommerce.config&&window.guideCommerce.config().yandexTravel||{};
      if(cfg.enabled&&cfg.affiliateClid){
        u=append(u,'affiliate_clid',cfg.affiliateClid);
        if(cfg.affiliateVid)u=append(u,'affiliate_vid',cfg.affiliateVid);
        if(cfg.erid)u=append(u,'erid',cfg.erid);
        u=append(u,'utm_source','distribution');
        u=append(u,'utm_medium','cpa');
      }
      return u;
    };
    window.guideCommerce.buildOstrovokUrl=function(ctx){
      ctx=ctx||{};var slug=ctx.slug||slugs[ctx.city]||String(ctx.city||'kaliningrad').toLowerCase();
      return 'https://ostrovok.ru/hotel/russia/'+slug+'/';
    };
  }

  /* Ask ages only when children are present. Yandex uses ages to calculate the guest composition and price. */
  function agesRead(){var v=readJson('guideGuestAges',[]);return Array.isArray(v)?v:[];}
  function agesWrite(v){try{localStorage.setItem('guideGuestAges',JSON.stringify(v));}catch(e){}}
  function childCount(){var el=q('#obChildren');return el?Math.max(0,Math.min(4,+el.value||0)):0;}
  function normalized(n){var a=agesRead().slice(0,n);while(a.length<n)a.push(null);return a;}
  function ageOptions(){var h='<option value="">Возраст</option>';for(var i=0;i<=17;i++)h+='<option value="'+i+'">'+i+(i===1?' год':(i>=2&&i<=4?' года':' лет'))+'</option>';return h;}
  function renderAges(){
    var input=q('#obChildren');if(!input)return;
    var n=childCount(),host=q('#guideChildAges');
    if(!n){if(host)host.remove();agesWrite([]);return;}
    var ages=normalized(n);
    if(!host){host=document.createElement('div');host.id='guideChildAges';host.className='guide-child-ages';var counters=input.closest('.ob-counters');if(counters)counters.insertAdjacentElement('afterend',host);}
    host.innerHTML='<b>Возраст детей</b><div class="guide-child-age-grid">'+ages.map(function(age,i){return '<label>Ребёнок '+(i+1)+'<select data-child-age="'+i+'">'+ageOptions()+'</select></label>';}).join('')+'</div><div class="guide-child-age-note">Нужен для корректного состава гостей и цены при подборе жилья.</div><div class="guide-child-age-error"></div>';
    Array.prototype.forEach.call(host.querySelectorAll('[data-child-age]'),function(sel){var idx=+sel.dataset.childAge;if(ages[idx]!=null)sel.value=String(ages[idx]);sel.onchange=function(){var a=normalized(childCount());a[idx]=sel.value===''?null:+sel.value;agesWrite(a);var er=q('.guide-child-age-error',host);if(er)er.textContent='';};});
  }
  document.addEventListener('input',function(e){if(e.target&&e.target.id==='obChildren')setTimeout(renderAges,0);},true);
  document.addEventListener('click',function(e){
    var next=e.target&&e.target.closest&&e.target.closest('.ob-next');
    if(next&&q('#obChildren')){
      var n=childCount(),a=normalized(n),ok=!n||(a.length===n&&a.every(function(v){return Number.isInteger(v)&&v>=0&&v<=17;}));
      if(!ok){e.preventDefault();e.stopImmediatePropagation();renderAges();var er=q('#guideChildAges .guide-child-age-error');if(er)er.textContent='Укажите возраст каждого ребёнка.';return;}
      agesWrite(a);
    }
    if(e.target&&e.target.closest&&e.target.closest('#betaOnboarding'))setTimeout(renderAges,0);
  },true);
  var st=document.createElement('style');st.textContent='.guide-child-ages{margin-top:14px;padding:12px;border:1px solid var(--line);border-radius:12px;background:var(--card)}.guide-child-ages>b{font-size:13px}.guide-child-age-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:9px}.guide-child-age-grid label{font-size:10px;color:var(--muted);font-weight:750}.guide-child-age-grid select{display:block;width:100%;margin-top:4px;padding:10px;border:1px solid var(--line);border-radius:10px;background:var(--card);color:var(--text)}.guide-child-age-note{margin-top:7px;color:var(--muted);font-size:10px;line-height:1.35}.guide-child-age-error{margin-top:6px;color:#a34e32;font-size:11px;font-weight:800}';document.head.appendChild(st);
  patchCommerce();setTimeout(renderAges,300);setTimeout(renderAges,900);
})();
