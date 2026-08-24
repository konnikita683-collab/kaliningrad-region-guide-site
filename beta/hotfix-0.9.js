(function(){
  function q(s,r){return(r||document).querySelector(s);}
  function read(k,d){try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d));}catch(e){return d;}}
  function write(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
  function append(url,key,value){if(value==null||value==='')return url;return url+(url.indexOf('?')>=0?'&':'?')+encodeURIComponent(key)+'='+encodeURIComponent(value);}
  var slugs={'Калининград':'kaliningrad','Зеленоградск':'zelenogradsk','Светлогорск':'svetlogorsk','Пионерский':'pionerskiy','Янтарный':'yantarnyi','Балтийск':'baltiisk','Гусев':'gusev'};
  function installCommerceFix(){
    if(!window.guideCommerce)return false;
    window.guideCommerce.buildOstrovokUrl=function(ctx){ctx=ctx||{};return'https://ostrovok.ru/hotel/russia/'+encodeURIComponent(ctx.slug||slugs[ctx.city]||'kaliningrad')+'/';};
    window.guideCommerce.buildYandexTravelHotelUrl=function(ctx){
      ctx=ctx||{};var u='https://travel.yandex.ru/hotels/'+(ctx.slug||slugs[ctx.city]||'kaliningrad')+'/',ages=read('guideGuestAges',[]),c=window.guideCommerce.config().yandexTravel||{};
      if(ctx.start)u=append(u,'checkinDate',ctx.start);if(ctx.end)u=append(u,'checkoutDate',ctx.end);if(ctx.adults)u=append(u,'adults',ctx.adults);
      var n=+ctx.children||0;if(n&&Array.isArray(ages)&&ages.length>=n)u=append(u,'childrenAges',ages.slice(0,n).join(','));
      u=append(u,'roomCount',1);
      if(c.enabled&&c.affiliateClid){u=append(u,'affiliate_clid',c.affiliateClid);if(c.affiliateVid)u=append(u,'affiliate_vid',c.affiliateVid);if(c.erid)u=append(u,'erid',c.erid);u=append(u,'utm_source','distribution');u=append(u,'utm_medium','cpa');}
      return u;
    };
    return true;
  }
  var commerceTry=0,commerceTimer=setInterval(function(){commerceTry++;if(installCommerceFix()||commerceTry>40)clearInterval(commerceTimer);},50);

  function guestAges(){try{var v=JSON.parse(localStorage.getItem('guideGuestAges')||'[]');return Array.isArray(v)?v:[];}catch(e){return[];}}
  function childCount(){var el=q('#obChildren');return el?Math.max(0,Math.min(4,+el.value||0)):0;}
  function normalize(n){var a=guestAges().slice(0,n);while(a.length<n)a.push(null);return a;}
  function renderAges(){
    var input=q('#obChildren');if(!input)return;var n=childCount(),host=q('#guideChildAges');if(!n){if(host)host.remove();write('guideGuestAges',[]);return;}var ages=normalize(n);
    if(!host){host=document.createElement('div');host.id='guideChildAges';host.className='guide-child-ages';var counters=input.closest('.ob-counters');if(counters)counters.insertAdjacentElement('afterend',host);}
    var options='<option value="">Возраст</option>';for(var i=0;i<=17;i++)options+='<option value="'+i+'">'+i+(i===1?' год':(i>=2&&i<=4?' года':' лет'))+'</option>';
    host.innerHTML='<b>Возраст детей</b><div class="guide-child-age-grid">'+ages.map(function(age,i){return'<label>Ребёнок '+(i+1)+'<select data-child-age="'+i+'">'+options+'</select></label>';}).join('')+'</div><div class="guide-child-age-note">Возраст нужен для корректного состава гостей и цены в сервисе бронирования.</div><div class="guide-child-age-error"></div>';
    Array.prototype.forEach.call(host.querySelectorAll('[data-child-age]'),function(sel){var idx=+sel.dataset.childAge;if(ages[idx]!=null)sel.value=String(ages[idx]);sel.onchange=function(){var a=normalize(childCount());a[idx]=sel.value===''?null:+sel.value;write('guideGuestAges',a);var er=q('.guide-child-age-error',host);if(er)er.textContent='';};});
  }
  document.addEventListener('input',function(e){if(e.target&&e.target.id==='obChildren')setTimeout(renderAges,0);},true);
  document.addEventListener('click',function(e){var b=e.target&&e.target.closest&&e.target.closest('.ob-next');if(!b||!q('#obChildren'))return;var n=childCount();if(!n){write('guideGuestAges',[]);return;}var a=normalize(n),ok=a.every(function(v){return Number.isInteger(v)&&v>=0&&v<=17;});if(!ok){e.preventDefault();e.stopImmediatePropagation();renderAges();var er=q('#guideChildAges .guide-child-age-error');if(er)er.textContent='Укажите возраст каждого ребёнка.';return;}write('guideGuestAges',a);},true);
  document.addEventListener('click',function(e){if(e.target&&e.target.closest&&e.target.closest('#betaOnboarding'))setTimeout(renderAges,0);},false);
  var st=document.createElement('style');st.textContent='.guide-child-ages{margin-top:14px;padding:12px;border:1px solid var(--line);border-radius:12px;background:var(--card)}.guide-child-ages>b{font-size:13px}.guide-child-age-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:9px}.guide-child-age-grid label{font-size:10px;color:var(--muted);font-weight:750}.guide-child-age-grid select{display:block;width:100%;margin-top:4px;padding:10px;border:1px solid var(--line);border-radius:10px;background:var(--card);color:var(--text)}.guide-child-age-note{margin-top:7px;color:var(--muted);font-size:10px;line-height:1.35}.guide-child-age-error{margin-top:6px;color:#a34e32;font-size:11px;font-weight:800}';document.head.appendChild(st);setTimeout(renderAges,300);
})();
