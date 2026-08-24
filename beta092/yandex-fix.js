(function(){
  'use strict';
  try{
    if(typeof st==='undefined' || typeof lodgingSetup==='undefined') return;

    var slugs={
      'Калининград':'kaliningrad','Зеленоградск':'zelenogradsk','Светлогорск':'svetlogorsk',
      'Пионерский':'pionerskiy','Янтарный':'yantarny','Балтийск':'baltiysk','Гусев':'gusev'
    };
    var aliases={
      'kaliningrad':'Калининград','zelenogradsk':'Зеленоградск','svetlogorsk':'Светлогорск',
      'pionerskiy':'Пионерский','yantarny':'Янтарный','yantarnyi':'Янтарный',
      'baltiysk':'Балтийск','baltiisk':'Балтийск','gusev':'Гусев'
    };

    function readAges(){try{var a=JSON.parse(localStorage.getItem('guideGuestAges')||'[]');return Array.isArray(a)?a:[];}catch(e){return[];}}
    function writeAges(a){try{localStorage.setItem('guideGuestAges',JSON.stringify(a));}catch(e){}}
    function childCount(){var el=document.getElementById('ch');return el?Math.max(0,Math.min(8,parseInt(el.value||0,10)||0)):Math.max(0,parseInt(st.children||0,10)||0);}
    function normalizeAges(n){var a=readAges().slice(0,n);while(a.length<n)a.push(null);return a;}
    function ageOptions(){var s='<option value="">Выберите возраст</option>';for(var i=0;i<=17;i++)s+='<option value="'+i+'">'+i+(i===1?' год':(i>=2&&i<=4?' года':' лет'))+'</option>';return s;}

    function renderAges(force){
      var ch=document.getElementById('ch'),host=document.getElementById('guideLegacyChildAges');
      if(!ch){if(host)host.remove();return;}
      var n=childCount();st.children=n;
      if(!n){if(host)host.remove();writeAges([]);return;}
      var grid=ch.closest('.grid');if(!grid)return;
      var ages=normalizeAges(n);
      if(!host){host=document.createElement('div');host.id='guideLegacyChildAges';host.className='guide-child-ages';grid.insertAdjacentElement('afterend',host);force=true;}
      if(force||host.dataset.count!==String(n)||host.querySelectorAll('[data-child-age]').length!==n){
        host.dataset.count=String(n);var opts=ageOptions();
        host.innerHTML='<b>Возраст детей</b><div class="guide-child-age-grid">'+ages.map(function(age,i){return'<label>Ребёнок '+(i+1)+'<select data-child-age="'+i+'">'+opts+'</select></label>';}).join('')+'</div><div class="guide-child-age-note">Возраст нужен сервису бронирования для корректного подбора вариантов.</div><div class="guide-child-age-error" aria-live="polite"></div>';
        Array.prototype.forEach.call(host.querySelectorAll('[data-child-age]'),function(sel){var idx=+sel.dataset.childAge;if(ages[idx]!=null)sel.value=String(ages[idx]);sel.addEventListener('change',function(){var a=normalizeAges(childCount()),v=sel.value;a[idx]=v===''?null:+v;writeAges(a);var er=host.querySelector('.guide-child-age-error');if(er)er.textContent='';});});
      }
    }

    function validAges(){var n=Math.max(0,parseInt(st.children||childCount()||0,10)||0);if(!n)return true;var a=normalizeAges(n);return a.length===n&&a.every(function(v){return Number.isInteger(v)&&v>=0&&v<=17;});}
    function enc(v){return encodeURIComponent(String(v));}
    window.guideBuildYandexTravelUrl=function(city){
      var slug=slugs[city];if(!slug)return '';
      var stay=lodgingSetup[city]||{},start=stay.start||st.start||'',end=stay.end||st.end||'';
      var adults=Math.max(1,parseInt(st.adults||2,10)||2),n=Math.max(0,parseInt(st.children||0,10)||0),ages=normalizeAges(n);
      if(!start||!end)return '';
      var u='https://travel.yandex.ru/hotels/'+slug+'/?adults='+adults+'&checkinDate='+enc(start)+'&checkoutDate='+enc(end);
      if(n&&ages.length===n&&ages.every(function(v){return Number.isInteger(v);})){u+='&childrenAges='+enc(ages.join(','));}else{u+='&childrenAges=';}
      u+='&roomCount=1&affiliate_clid=15309307&affiliate_vid=housingapp&erid=5jtCeReNx12oajzh1DMXueG&utm_source=distribution&utm_medium=cpa';
      return u;
    };
    window.guideRewriteYandexTravelUrl=function(raw){
      var original=String(raw||'');if(original.indexOf('travel.yandex.ru/hotels/')<0)return original;
      var decoded=original;try{decoded=decodeURIComponent(original);}catch(e){}
      var m=decoded.match(/\/hotels\/([^\/?#]+)\//i),key=m?String(m[1]||'').toLowerCase():'',city=aliases[key];
      return city?window.guideBuildYandexTravelUrl(city):original;
    };

    var previousOpen=window.open.bind(window);
    window.open=function(url,target,features){return previousOpen(window.guideRewriteYandexTravelUrl(url),target,features);};

    document.addEventListener('input',function(e){if(e.target&&e.target.id==='ch'){st.children=childCount();setTimeout(function(){renderAges(true);},0);}if(e.target&&e.target.id==='ad'){st.adults=Math.max(1,parseInt(e.target.value||1,10)||1);}},true);
    document.addEventListener('change',function(e){if(e.target&&e.target.id==='ch'){st.children=childCount();setTimeout(function(){renderAges(true);},0);}},true);
    document.addEventListener('click',function(e){
      var next=e.target&&e.target.closest&&e.target.closest('#next');if(!next||!document.getElementById('ch'))return;
      st.children=childCount();renderAges(false);
      if(!validAges()){
        e.preventDefault();e.stopImmediatePropagation();var er=document.querySelector('#guideLegacyChildAges .guide-child-age-error');if(er)er.textContent='Укажите возраст каждого ребёнка.';
      }
    },true);
    if(document.body)new MutationObserver(function(){renderAges(false);}).observe(document.body,{childList:true,subtree:true});

    var style=document.createElement('style');style.id='guide-yandex-child-style';style.textContent='.guide-child-ages{margin-top:14px;padding:14px;border:1px solid #d8d4ca;border-radius:14px;background:#fffdf8}.guide-child-ages>b{font-size:14px}.guide-child-age-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:10px}.guide-child-age-grid label{font-size:11px;color:#6d736e;font-weight:750}.guide-child-age-grid select{display:block;width:100%;margin-top:5px;padding:12px;border:1px solid #d8d4ca;border-radius:11px;background:#fff;color:#1f2a2b;font-size:15px}.guide-child-age-note{margin-top:8px;color:#6d736e;font-size:11px;line-height:1.4}.guide-child-age-error{margin-top:7px;color:#a34e32;font-size:12px;font-weight:800}@media(max-width:560px){.guide-child-age-grid{grid-template-columns:1fr}}';document.head.appendChild(style);
    renderAges(false);

    var badge=document.getElementById('beta092Date2Badge');if(badge)badge.textContent='BETA 0.9.2 YT1';
  }catch(err){
    console.error('YT1',err);var badge=document.getElementById('beta092Date2Badge');if(badge){badge.textContent='YT1 ERROR';badge.style.background='#8b1e1e';}
  }
})();
