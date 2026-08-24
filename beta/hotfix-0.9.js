(function(){
  function q(s,r){return(r||document).querySelector(s);}
  function read(k,d){try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d));}catch(e){return d;}}
  function write(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
  function append(url,key,value){if(value==null||value==='')return url;return url+(url.indexOf('?')>=0?'&':'?')+encodeURIComponent(key)+'='+encodeURIComponent(value);}
  function cleanAges(value){return(Array.isArray(value)?value:[]).map(function(v){return Number(v);}).filter(function(v){return Number.isInteger(v)&&v>=0&&v<=17;});}
  function dotDate(value){var m=String(value||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?m[3]+'.'+m[2]+'.'+m[1]:'';}
  var routes={
    'Калининград':{yandex:'kaliningrad',ostrovok:'kaliningrad'},
    'Зеленоградск':{yandex:'zelenogradsk',ostrovok:'zelenogradsk'},
    'Светлогорск':{yandex:'svetlogorsk',ostrovok:'svetlogorsk'},
    'Пионерский':{yandex:'pionerskiy',ostrovok:'pionerskiy'},
    'Янтарный':{yandex:'yantarnyi',ostrovok:'yantarny'},
    'Балтийск':{yandex:'baltiisk',ostrovok:'baltiysk'},
    'Гусев':{yandex:'gusev',ostrovok:'gusev'}
  };
  function route(city){return routes[city]||routes['Калининград'];}
  function party(ctx){var ob=read('guideOnboarding',{});return{adults:Math.max(1,Number(ob.adults||ctx.adults)||2),children:Math.max(0,Number(ob.children||ctx.children)||0)};}
  function installCommerceFix(){
    if(!window.guideCommerce)return false;
    window.guideCommerce.buildYandexTravelHotelUrl=function(ctx){
      ctx=ctx||{};var r=route(ctx.city),p=party(ctx),slug=ctx.slug||r.yandex,u='https://travel.yandex.ru/hotels/'+encodeURIComponent(slug)+'/',c=window.guideCommerce.config().yandexTravel||{};
      if(ctx.start)u=append(u,'checkinDate',ctx.start);
      if(ctx.end)u=append(u,'checkoutDate',ctx.end);
      u=append(u,'adults',p.adults);
      var ages=cleanAges(ctx.childrenAges);if(!ages.length)ages=cleanAges(read('guideGuestAges',[]));
      if(p.children&&ages.length>p.children)ages=ages.slice(0,p.children);
      u=append(u,'childrenAges',ages.join(','));
      u=append(u,'roomCount',ctx.roomCount||1);
      if(c.enabled&&c.affiliateClid){u=append(u,'affiliate_clid',c.affiliateClid);if(c.affiliateVid)u=append(u,'affiliate_vid',c.affiliateVid);if(c.erid)u=append(u,'erid',c.erid);u=append(u,'utm_source','distribution');u=append(u,'utm_medium','cpa');}
      return u;
    };
    window.guideCommerce.buildOstrovokUrl=function(ctx){
      ctx=ctx||{};var r=route(ctx.city),p=party(ctx),slug=ctx.ostrovokSlug||r.ostrovok,u='https://ostrovok.ru/hotel/russia/'+encodeURIComponent(slug)+'/';
      var start=dotDate(ctx.start),end=dotDate(ctx.end);if(start&&end)u=append(u,'dates',start+'-'+end);
      var ages=cleanAges(ctx.childrenAges);if(!ages.length)ages=cleanAges(read('guideGuestAges',[]));if(p.children&&ages.length>p.children)ages=ages.slice(0,p.children);
      var guests=String(p.adults);if(ages.length)guests+='and'+ages.join('.');else if(p.children)guests=String(p.adults+p.children);
      u=append(u,'guests',guests);u=append(u,'search','yes');
      return u;
    };
    window.__guideHotelFixVersion='20260824-2';
    return true;
  }
  var commerceTry=0,commerceTimer=setInterval(function(){commerceTry++;if(installCommerceFix()||commerceTry>120)clearInterval(commerceTimer);},50);

  function childCount(){var el=q('#obChildren');return el?Math.max(0,Math.min(8,+el.value||0)):0;}
  function normalize(n){var a=read('guideGuestAges',[]);a=Array.isArray(a)?a.slice(0,n):[];while(a.length<n)a.push(null);return a;}
  function syncParty(){var adults=q('#obAdults'),children=q('#obChildren');if(!adults&&!children)return;var ob=read('guideOnboarding',{});if(adults)ob.adults=Math.max(1,+adults.value||1);if(children)ob.children=Math.max(0,+children.value||0);write('guideOnboarding',ob);}
  function buildAgeHost(host,n,ages){
    host.dataset.count=String(n);
    var options='<option value="">Возраст</option>';for(var i=0;i<=17;i++)options+='<option value="'+i+'">'+i+(i===1?' год':(i>=2&&i<=4?' года':' лет'))+'</option>';
    host.innerHTML='<b>Возраст детей</b><div class="guide-child-age-grid">'+ages.map(function(age,i){return'<label>Ребёнок '+(i+1)+'<select data-child-age="'+i+'">'+options+'</select></label>';}).join('')+'</div><div class="guide-child-age-note">Возраст нужен для корректного состава гостей и цены в сервисе бронирования.</div><div class="guide-child-age-error"></div>';
    Array.prototype.forEach.call(host.querySelectorAll('[data-child-age]'),function(sel){var idx=+sel.dataset.childAge;if(ages[idx]!=null)sel.value=String(ages[idx]);sel.onchange=function(){var a=normalize(childCount());a[idx]=sel.value===''?null:+sel.value;write('guideGuestAges',a);var er=q('.guide-child-age-error',host);if(er)er.textContent='';};});
  }
  function renderAges(){
    var input=q('#obChildren');if(!input)return;syncParty();var n=childCount(),host=q('#guideChildAges');
    if(!n){if(host)host.remove();write('guideGuestAges',[]);return;}
    var ages=normalize(n);
    if(!host){host=document.createElement('div');host.id='guideChildAges';host.className='guide-child-ages';var counters=input.closest('.ob-counters');if(counters)counters.insertAdjacentElement('afterend',host);}
    if(host.dataset.count!==String(n)||host.querySelectorAll('[data-child-age]').length!==n)buildAgeHost(host,n,ages);
  }
  var pending=false;function schedule(){if(pending)return;pending=true;setTimeout(function(){pending=false;renderAges();installCommerceFix();},0);}
  document.addEventListener('input',function(e){if(e.target&&(e.target.id==='obChildren'||e.target.id==='obAdults'))schedule();},true);
  document.addEventListener('change',function(e){if(e.target&&(e.target.id==='obChildren'||e.target.id==='obAdults'))schedule();},true);
  document.addEventListener('click',function(e){var b=e.target&&e.target.closest&&e.target.closest('.ob-next');if(!b||!q('#obChildren'))return;syncParty();renderAges();var n=childCount();if(!n){write('guideGuestAges',[]);return;}var a=normalize(n),ok=a.length===n&&a.every(function(v){return Number.isInteger(v)&&v>=0&&v<=17;});if(!ok){e.preventDefault();e.stopImmediatePropagation();var er=q('#guideChildAges .guide-child-age-error');if(er)er.textContent='Укажите возраст каждого ребёнка.';return;}write('guideGuestAges',a);},true);
  var observer=new MutationObserver(schedule);observer.observe(document.documentElement,{childList:true,subtree:true});
  var st=document.createElement('style');st.id='guide-hotel-fix-style';st.textContent='.guide-child-ages{margin-top:14px;padding:12px;border:1px solid var(--line);border-radius:12px;background:var(--card)}.guide-child-ages>b{font-size:13px}.guide-child-age-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:9px}.guide-child-age-grid label{font-size:10px;color:var(--muted);font-weight:750}.guide-child-age-grid select{display:block;width:100%;margin-top:4px;padding:10px;border:1px solid var(--line);border-radius:10px;background:var(--card);color:var(--text)}.guide-child-age-note{margin-top:7px;color:var(--muted);font-size:10px;line-height:1.35}.guide-child-age-error{margin-top:6px;color:#a34e32;font-size:11px;font-weight:800}.guide-hotel-test-badge{position:fixed;right:10px;top:10px;z-index:100000;background:#183c35;color:#fff;border-radius:999px;padding:5px 9px;font:700 10px/1.2 system-ui,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.18)}';if(!q('#'+st.id))document.head.appendChild(st);
  if(window.__GUIDE_HOTEL_TEST&&!q('.guide-hotel-test-badge')){var badge=document.createElement('div');badge.className='guide-hotel-test-badge';badge.textContent='HOTEL FIX 2';document.body.appendChild(badge);}
  schedule();
})();
