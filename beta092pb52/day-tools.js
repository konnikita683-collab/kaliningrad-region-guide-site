(function(){
  'use strict';
  if(window.__guideDayToolsInstalled)return;
  window.__guideDayToolsInstalled='DT6';
  function q(s,r){return(r||document).querySelector(s);}
  function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
  function state(){return(typeof st!=='undefined'&&st)||{};}
  function tripStart(){return(q('#a')&&q('#a').value)||state().start||'';}
  function tripEnd(){return(q('#b')&&q('#b').value)||state().end||'';}
  function dayIndex(card,fallback){var n=parseInt(card&&card.dataset&&card.dataset.i,10);return isNaN(n)?fallback:n;}
  function dateForIndex(i){var a=tripStart();if(!a)return String(i);var d=new Date(a+'T12:00:00');d.setDate(d.getDate()+i);return d.toISOString().slice(0,10);}
  function noteKey(i){return'guideDayNote:v1:'+tripStart()+':'+tripEnd()+':'+dateForIndex(i);}
  function bookedKey(i){return'guideDayBooked:v1:'+tripStart()+':'+tripEnd()+':'+dateForIndex(i);}

  var REC={
    kal:{place:'Калининград',title:'Экскурсии по Калининграду',items:['Амалиенау и исторические кварталы с гидом','Обзорная прогулка, форты или тематическая экскурсия'],url:'https://experience.tripster.ru/experience/Kaliningrad/'},
    zel:{place:'Зеленоградск',title:'Экскурсии по Зеленоградску',items:['Прогулка по старому курорту и променаду','Семейная или мини-групповая экскурсия по городу'],url:'https://experience.tripster.ru/experience/Zelenogradsk/'},
    cur:{place:'Куршская коса',title:'Экскурсии на Куршскую косу',items:['Дюны, Рыбачий и Высота Эфа с гидом','Мини-группа или индивидуальный выезд по косе'],url:'https://experience.tripster.ru/experience/Kaliningrad/4729-kurshskaya-kosa/'},
    svet:{place:'Светлогорск',title:'Экскурсии по Светлогорску',items:['История Раушена и архитектура курорта','Пешеходная прогулка с местным гидом'],url:'https://experience.tripster.ru/experience/Svetlogorsk/'},
    yant:{place:'Янтарный',title:'Экскурсии в Янтарный и по западному побережью',items:['Янтарный: история промысла, парк Беккера и побережье','Комбинированный выезд Янтарный + Светлогорск или Балтийск'],url:'https://experience.tripster.ru/experience/Kaliningrad/74582-v-baltijsk-yantarnyj-svetlogorsk/'},
    west:{place:'Западное побережье',title:'Экскурсии по западному побережью',items:['Янтарный, Светлогорск и морские точки','Балтийск и запад области с гидом'],url:'https://experience.tripster.ru/experience/Kaliningrad/74582-v-baltijsk-yantarnyj-svetlogorsk/'},
    region:{place:'Калининградская область',title:'Экскурсии по Калининградской области',items:['Замки и малые города области','Тематический выезд по маршруту этого дня'],url:'https://experience.tripster.ru/experience/Kaliningrad/'}
  };
  function scenarioTitle(card){var h=q('.day-head h3',card)||q('.day-head h2',card)||q('h3,h2',card);return(h&&h.textContent||'').trim();}
  function isArrival(card,i){var t=(scenarioTitle(card)+' '+((q('.glance',card)||{}).innerText||'')).toLowerCase();return /приезд|заселен|аэропорт|первый вечер|дорога и засел/.test(t)||(i===0&&/заселен|приезд|первый день/.test(t));}
  function keyForTitle(t){
    if(/Курш|Высот[аы] Эфа|Танцующ|Рыбач/i.test(t))return'cur';
    if(/Янтарн/i.test(t))return'yant';
    if(/Филинск|Западное побережье|Балтийск/i.test(t))return'west';
    if(/Светлогорск|Раушен/i.test(t))return'svet';
    if(/Зеленоградск/i.test(t))return'zel';
    if(/Амалиенау|проспект Мира|зоопарк|форт|Д[её]нхофф|Штайн|Кант|К[её]нигсберг|Рыбн|Музей Мирового океана|Калининград/i.test(t))return'kal';
    return'region';
  }
  function recFor(card){return REC[keyForTitle(scenarioTitle(card))]||REC.region;}
  function booked(i){return localStorage.getItem(bookedKey(i))==='1';}
  function excursionHtml(r,isBooked){
    var items=r.items.map(function(x){return'<li>'+x+'</li>';}).join('');
    var status=isBooked?'<div class="guide-booked-status">✓ Экскурсия отмечена как забронированная</div>':'';
    return '<div class="guide-day-excursion-kicker">Если хотите заменить часть программы экскурсией</div><b>'+r.title+'</b><ul>'+items+'</ul>'+status+'<a href="'+r.url+'" target="_blank" rel="noopener" data-tripster-catalog>Посмотреть варианты и свободное время</a><button type="button" class="guide-booked-toggle">'+(isBooked?'Снять отметку':'Я забронировал экскурсию')+'</button>';
  }
  function fixDayLabel(card){
    var title=scenarioTitle(card),r=recFor(card),n=q('.daynum',card);if(!n||!title||isArrival(card,dayIndex(card,0)))return;
    var m=(n.textContent||'').match(/^(День\s+\d+)/i);if(m){var next=m[1]+' · '+r.place;if(n.textContent!==next)n.textContent=next;}
  }
  function localized(text,place){
    var s=(text||'').trim();if(!s||s.indexOf(place+' · ')===0)return s;
    if(place==='Калининград'){
      if(/^Амалиенау:/i.test(s))return'Калининград · '+s;
      if(/^Проспект Мира:/i.test(s))return'Калининград · '+s;
      if(/^Кофе и ранний обед$/i.test(s))return s+' в Калининграде';
      if(/^Ужин$/i.test(s))return'Ужин в Калининграде';
    }
    if(place==='Янтарный'){
      if(/^Обед$/i.test(s))return'Обед в Янтарном';
      if(/^Ужин$/i.test(s))return'Ужин в Янтарном';
    }
    if(place==='Светлогорск'&&/^(Обед|Ужин)$/i.test(s))return s+' в Светлогорске';
    if(place==='Зеленоградск'&&/^(Обед|Ужин)$/i.test(s))return s+' в Зеленоградске';
    return s;
  }
  function fixTimelineLocations(card){
    var place=recFor(card).place;
    qa('.timeline .row > div:last-child,.glance-row > b',card).forEach(function(el){var next=localized(el.textContent,place);if(next!==el.textContent)el.textContent=next;});
  }
  function addExcursions(){
    qa('.day').forEach(function(card,fallback){
      var i=dayIndex(card,fallback),old=q('.guide-day-excursion',card);
      if(isArrival(card,i)){if(old)old.remove();return;}
      var r=recFor(card),isBooked=booked(i),details=q('.details',card);
      if(!old){old=document.createElement('div');old.className='guide-day-excursion';}
      if(details&&old.parentNode!==details){var timeline=q('.timeline',details);details.insertBefore(old,timeline||details.firstChild);}
      else if(!details&&old.parentNode!==card){card.appendChild(old);}
      var sig=r.url+'|'+r.place+'|'+(isBooked?'1':'0');if(old.dataset.sig!==sig){old.dataset.sig=sig;old.classList.toggle('is-booked',isBooked);old.innerHTML=excursionHtml(r,isBooked);var btn=q('.guide-booked-toggle',old);if(btn)btn.addEventListener('click',function(){localStorage.setItem(bookedKey(i),isBooked?'0':'1');old.dataset.sig='';schedule(0);});}
    });
  }
  function addNotes(){qa('.day').forEach(function(card,fallback){var i=dayIndex(card,fallback),box=q('.guide-day-notes',card),details=q('.details',card)||card;if(!box){box=document.createElement('details');box.className='guide-day-notes';box.innerHTML='<summary>Моя заметка к этому дню</summary><textarea rows="3" placeholder="Например: экскурсия на 10:00, место встречи, номер брони, ресторан…"></textarea>';details.appendChild(box);var ta=q('textarea',box);ta.value=localStorage.getItem(noteKey(i))||'';ta.addEventListener('input',function(){localStorage.setItem(noteKey(i),ta.value);});}});}
  function restoreOriginalRecommendations(){qa('.event-recommendation').forEach(function(x){x.style.removeProperty('display');x.hidden=false;});}
  function ticketUrl(card){var t=card.innerText||'';if(/Янтарь-холл|Кадышев|Банкет/i.test(t))return'https://yantarkassa.ru/events';if(/Светлогорск|Индия звучащая|фитнес-танцы/i.test(t))return'https://www.svetlogorsk-tourism.ru/calendar/';return'https://visit-kaliningrad.ru/events/';}
  function addEventLinks(){qa('.event-card').forEach(function(card){if(q('.guide-event-ticket-link',card))return;var a=document.createElement('a');a.className='guide-event-ticket-link';a.href=ticketUrl(card);a.target='_blank';a.rel='noopener';a.textContent='Билеты / подробнее';var actions=q('.event-actions',card);if(actions)actions.insertBefore(a,actions.firstChild);else card.appendChild(a);});}
  var timer=0;function refresh(){timer=0;try{restoreOriginalRecommendations();qa('.day').forEach(function(c){fixDayLabel(c);fixTimelineLocations(c);});addExcursions();addNotes();addEventLinks();}catch(e){console.error('DT6 refresh',e);}}
  function schedule(delay){clearTimeout(timer);timer=setTimeout(refresh,typeof delay==='number'?delay:100);}
  function reopenAfterReplace(card){var idx=card&&card.dataset&&card.dataset.i;if(idx==null)return;[120,350,800].forEach(function(ms){setTimeout(function(){var c=q('.day[data-i="'+idx+'"]');if(!c)return;var b=q('.day-toggle',c);if(b&&/Открыть/i.test(b.textContent||''))b.click();schedule(20);},ms);});}
  function attachObserver(){var root=q('#planList')||q('[data-tab-panel="days"]')||q('.plan-list');if(!root||root.__guideDayToolsObserved)return false;root.__guideDayToolsObserved=true;new MutationObserver(function(){schedule(80);}).observe(root,{childList:true,subtree:true,characterData:true});return true;}
  var css='.guide-day-excursion{margin:0 0 14px;padding:14px;border:1px solid var(--line,#ddd);border-radius:14px;background:#f7faf9}.guide-day-excursion.is-booked{background:#eef7f1;border-color:#a7c9b1}.guide-day-excursion-kicker{font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:var(--accent,#2f7d78);font-weight:850;margin-bottom:5px}.guide-day-excursion>b{display:block;font-size:15px;line-height:1.3}.guide-day-excursion ul{margin:8px 0 0;padding-left:18px;font-size:12px;line-height:1.45}.guide-day-excursion>a,.guide-event-ticket-link{display:block;margin-top:10px;padding:10px 11px;border-radius:11px;background:var(--accent,#2f7d78);color:#fff!important;text-align:center;text-decoration:none!important;font-weight:850}.guide-booked-toggle{width:100%;margin-top:8px;padding:9px 10px;border:1px solid var(--accent,#2f7d78);border-radius:10px;background:#fff;color:var(--accent,#2f7d78);font:800 12px/1.2 system-ui}.guide-booked-status{margin-top:9px;padding:8px 9px;border-radius:9px;background:#dff1e5;color:#245b38;font-size:11px;font-weight:800}.guide-day-notes{margin:14px 0 0;padding:10px 12px;border:1px solid var(--line,#ddd);border-radius:12px;background:#fff}.guide-day-notes summary{cursor:pointer;font-weight:800;font-size:12px;color:var(--accent,#2f7d78)}.guide-day-notes textarea{width:100%;margin-top:9px;padding:10px;border:1px solid var(--line,#ddd);border-radius:9px;resize:vertical;font:13px/1.4 system-ui;color:inherit;background:#fff}.event-actions .guide-event-ticket-link{margin-top:0}@media(max-width:520px){.event-actions{grid-template-columns:1fr!important}}';var stl=document.createElement('style');stl.id='guide-day-tools-style';stl.textContent=css;if(!q('#'+stl.id))document.head.appendChild(stl);
  document.addEventListener('click',function(e){var t=e.target,card=t&&t.closest&&t.closest('.day');if(card&&t.tagName==='BUTTON'&&/Заменить/i.test(t.textContent||'')){reopenAfterReplace(card);return;}if(t&&(t.id==='next'||(t.dataset&&['days','events'].indexOf(t.dataset.tab)>=0)))schedule(120);},true);
  document.addEventListener('change',function(e){var t=e.target;if(t&&t.closest&&t.closest('.day'))schedule(100);},true);
  var tries=0;(function boot(){attachObserver();schedule(30);if(++tries<18)setTimeout(boot,400);})();window.guideRefreshDayTools=refresh;
})();