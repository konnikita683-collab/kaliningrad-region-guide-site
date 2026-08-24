(function(){
  if(window.__guideHousingCommerceInstalled)return;
  window.__guideHousingCommerceInstalled=true;
  function q(s,r){return (r||document).querySelector(s);}
  function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
  function read(k,d){try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d));}catch(e){return d;}}
  function fmt(s){return s?new Date(s+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'short'}):'—';}
  var routes={
    'Калининград':{yandex:'kaliningrad',ostrovok:'kaliningrad'},
    'Зеленоградск':{yandex:'zelenogradsk',ostrovok:'zelenogradsk'},
    'Светлогорск':{yandex:'svetlogorsk',ostrovok:'svetlogorsk'},
    'Пионерский':{yandex:'pionerskiy',ostrovok:'pionerskiy'},
    'Янтарный':{yandex:'yantarnyi',ostrovok:'yantarny'},
    'Балтийск':{yandex:'baltiisk',ostrovok:'baltiysk'},
    'Гусев':{yandex:'gusev',ostrovok:'gusev'}
  };
  function context(city){
    var lodging=read('guideLodgingOnboarding',{cities:{}}),ob=read('guideOnboarding',{}),rawAges=read('guideGuestAges',[]),stay=lodging.cities&&lodging.cities[city]||{},r=routes[city]||routes['Калининград'];
    var children=Math.max(0,Number(ob.children)||0),ages=(Array.isArray(rawAges)?rawAges:[]).map(function(v){return Number(v);}).filter(function(v){return Number.isInteger(v)&&v>=0&&v<=17;});
    if(children&&ages.length>children)ages=ages.slice(0,children);
    if(!children&&ages.length)children=ages.length;
    return{city:city,slug:r.yandex,ostrovokSlug:r.ostrovok,start:stay.start||'',end:stay.end||'',adults:Math.max(1,Number(ob.adults)||2),children:children,childrenAges:ages};
  }
  function cfg(){return window.guideCommerce&&window.guideCommerce.config?window.guideCommerce.config().yandexTravel:null;}
  function url(provider,ctx){if(window.guideCommerce){if(provider==='yandex')return window.guideCommerce.buildYandexTravelHotelUrl(ctx);if(provider==='ostrovok')return window.guideCommerce.buildOstrovokUrl(ctx);}return provider==='yandex'?'https://travel.yandex.ru/hotels/'+ctx.slug+'/':'https://ostrovok.ru/hotel/russia/'+encodeURIComponent(ctx.ostrovokSlug||'kaliningrad')+'/';}
  function markAds(){var c=cfg();qa('.ob-lodging-providers').forEach(function(row){var y=q('[data-provider="yandex"]',row);if(!y)return;var old=q('.guide-ad-mark',row);if(!(c&&c.enabled&&(c.affiliateClid||c.partnerUrl))){if(old)old.remove();return;}if(!old){old=document.createElement('div');old.className='guide-ad-mark';row.appendChild(old);}old.textContent='Реклама · Яндекс Путешествия'+(c.erid?' · erid: '+c.erid:'');});}
  function guestText(ctx){return ctx.adults+' взр.'+(ctx.childrenAges.length?' + дети '+ctx.childrenAges.join(', ')+' лет':(ctx.children?' + детей '+ctx.children:''));}
  function preview(provider,ctx,u){var old=q('#housingPreview');if(old)old.remove();var partner=window.guideCommerce&&window.guideCommerce.status().yandexTravel&&provider==='yandex',name=provider==='yandex'?'Яндекс Путешествия':'Ostrovok',box=document.createElement('div');box.id='housingPreview';box.className='housing-preview';box.innerHTML='<b>'+name+' · '+ctx.city+'</b><span>'+u+'</span><small>Период '+fmt(ctx.start)+' — '+fmt(ctx.end)+' · '+guestText(ctx)+'. '+(partner?'Партнёрская разметка активна.':'Обычная ссылка без партнёрской разметки.')+' В APK ссылка откроется во внешнем браузере.</small>';document.body.appendChild(box);setTimeout(function(){if(box.parentNode)box.remove();},6000);}
  document.addEventListener('click',function(e){var b=e.target&&e.target.closest&&e.target.closest('[data-provider][data-city]');if(!b){if(e.target&&e.target.closest&&e.target.closest('#betaOnboarding'))setTimeout(markAds,0);return;}var provider=b.dataset.provider,ctx=context(b.dataset.city),u=url(provider,ctx);e.preventDefault();e.stopImmediatePropagation();var evt={channel:'housing',provider:provider,city:ctx.city,start:ctx.start,end:ctx.end,adults:ctx.adults,children:ctx.children,childrenAges:ctx.childrenAges,partner:!!(provider==='yandex'&&window.guideCommerce&&window.guideCommerce.status().yandexTravel)};if(window.guideCommerce&&window.guideCommerce.open(u,evt))return;if(window.guideCommerce)window.guideCommerce.track(evt);preview(provider,ctx,u);},true);
  var style=document.createElement('style');style.id='housing-commerce-style';style.textContent='.guide-ad-mark{grid-column:1/-1;margin-top:1px;color:var(--muted);font-size:9px;line-height:1.3;text-align:left}';if(!q('#'+style.id))document.head.appendChild(style);
  setTimeout(markAds,650);setTimeout(markAds,1200);
})();
