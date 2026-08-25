(function(){
  'use strict';
  if(window.__guideDayToolsInstalled)return;
  window.__guideDayToolsInstalled='DT2';
  function q(s,r){return(r||document).querySelector(s);}
  function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
  function state(){return (typeof st!=='undefined'&&st)||{};}
  function tripStart(){return(q('#a')&&q('#a').value)||state().start||'';}
  function tripEnd(){return(q('#b')&&q('#b').value)||state().end||'';}
  function dateForIndex(i){var a=tripStart();if(!a)return String(i);var d=new Date(a+'T12:00:00');d.setDate(d.getDate()+i);return d.toISOString().slice(0,10);}
  function noteKey(i){return'guideDayNote:v1:'+tripStart()+':'+tripEnd()+':'+dateForIndex(i);}
  function bookedKey(i){return'guideDayBooked:v1:'+tripStart()+':'+tripEnd()+':'+dateForIndex(i);}

  var KAL={title:'Экскурсии по Калининграду',meta:'обзорные, форты, Амалиенау и тематические маршруты · выберите вариант со свободной датой',url:'https://experience.tripster.ru/experience/Kaliningrad/'};
  var ZEL={title:'Экскурсии по Зеленоградску',meta:'пешие, семейные и мини-группы · выберите вариант со свободной датой',url:'https://experience.tripster.ru/experience/Zelenogradsk/'};
  var CUR={title:'Экскурсии на Куршскую косу',meta:'несколько гидов и форматов · выберите вариант со свободной датой',url:'https://experience.tripster.ru/experience/Kaliningrad/4729-kurshskaya-kosa/'};
  var SVET={title:'Экскурсии по Светлогорску',meta:'городские прогулки и выезды по побережью · выберите свободную дату',url:'https://experience.tripster.ru/experience/Svetlogorsk/'};
  var WEST={title:'Экскурсии по западному побережью',meta:'Балтийск, Янтарный и Светлогорск · выберите доступный вариант',url:'https://experience.tripster.ru/experience/Kaliningrad/74582-v-baltijsk-yantarnyj-svetlogorsk/'};
  var REGION={title:'Экскурсии по Калининградской области',meta:'замки, восток области и тематические выезды · выберите вариант со свободной датой',url:'https://experience.tripster.ru/experience/Kaliningrad/'};

  var byId={
    'kal-classic':KAL,'amalienau':KAL,'forts':KAL,'food':KAL,
    'zelenogradsk':ZEL,'slow':ZEL,
    'curonian':CUR,'rybachy-bike':CUR,
    'svetlogorsk':SVET,
    'yantarny':WEST,'coast':WEST,'baltiysk':WEST,
    'south':REGION,'east':REGION,'castles':REGION
  };
  var byBase={'Калининград':KAL,'Зеленоградск':ZEL,'Светлогорск':SVET,'Пионерский':SVET,'Янтарный':WEST,'Балтийск':WEST,'Гусев':REGION};

  function actualScenario(i){var plan=window.currentPlan||[];return plan[i]||null;}
  function baseFor(i){var bases=window.planBases||[];return bases[i]||'';}
  function textPick(card){
    var head=q('.day-head',card);var text=(head?head.innerText:card.innerText)||'';
    if(/Курш|Высот[аы] Эфа|Танцующ|Рыбач/i.test(text))return CUR;
    if(/Балтийск|Янтарн|Филинск|Западное побережье/i.test(text))return WEST;
    if(/Светлогорск|Раушен/i.test(text))return SVET;
    if(/Зеленоградск/i.test(text))return ZEL;
    if(/форт|Д[её]нхофф|Штайн|Амалиенау|Канта|К[её]нигсберг|Рыбн|Калининград/i.test(text))return KAL;
    return null;
  }
  function pick(card,i){var s=actualScenario(i);if(s&&s.id&&byId[s.id])return byId[s.id];var r=textPick(card);if(r)return r;return byBase[baseFor(i)]||REGION;}
  function booked(i){return localStorage.getItem(bookedKey(i))==='1';}
  function excursionHtml(r,isBooked){var status=isBooked?'<div class="guide-booked-status">✓ Экскурсия отмечена как забронированная</div>':'';var linkText=isBooked?'Открыть подборку / детали':'Подобрать доступную экскурсию';var buttonText=isBooked?'Снять отметку':'Я забронировал экскурсию';return '<div class="guide-day-excursion-kicker">Экскурсия по теме дня</div><b>'+r.title+'</b><span>'+r.meta+'</span>'+status+'<a href="'+r.url+'" target="_blank" rel="noopener" data-tripster-catalog>'+linkText+'</a><button type="button" class="guide-booked-toggle">'+buttonText+'</button>';}
  function addExcursions(){qa('#planList .day').forEach(function(card,i){var r=pick(card,i),old=q('.guide-day-excursion',card),isBooked=booked(i);if(!old){old=document.createElement('div');old.className='guide-day-excursion';var head=q('.day-head',card);if(head&&head.nextSibling)card.insertBefore(old,head.nextSibling);else card.insertBefore(old,card.firstChild);}var sig=r.url+'|'+(isBooked?'1':'0');if(old.dataset.sig===sig)return;old.dataset.sig=sig;old.dataset.url=r.url;old.classList.toggle('is-booked',isBooked);old.innerHTML=excursionHtml(r,isBooked);var btn=q('.guide-booked-toggle',old);if(btn)btn.addEventListener('click',function(){localStorage.setItem(bookedKey(i),isBooked?'0':'1');old.dataset.sig='';addExcursions();});});}
  function addNotes(){qa('#planList .day').forEach(function(card,i){var box=q('.guide-day-notes',card);if(!box){box=document.createElement('details');box.className='guide-day-notes';box.innerHTML='<summary>Моя заметка к этому дню</summary><textarea rows="3" placeholder="Например: экскурсия на 10:00, место встречи, номер брони, ресторан…"></textarea>';card.appendChild(box);var ta=q('textarea',box);ta.value=localStorage.getItem(noteKey(i))||'';ta.addEventListener('input',function(){localStorage.setItem(noteKey(i),ta.value);});}else{var ta=q('textarea',box),saved=localStorage.getItem(noteKey(i))||'';if(document.activeElement!==ta&&ta.value!==saved)ta.value=saved;}});}
  function ticketUrl(card){var t=card.innerText||'';if(/Янтарь-холл|Кадышев|Банкет/i.test(t))return'https://yantarkassa.ru/events';if(/Светлогорск|Индия звучащая|фитнес-танцы/i.test(t))return'https://www.svetlogorsk-tourism.ru/calendar/';return'https://visit-kaliningrad.ru/events/';}
  function addEventLinks(){qa('.event-card').forEach(function(card){if(q('.guide-event-ticket-link',card))return;var a=document.createElement('a');a.className='guide-event-ticket-link';a.href=ticketUrl(card);a.target='_blank';a.rel='noopener';a.textContent='Билеты / подробнее';var actions=q('.event-actions',card);if(actions)actions.insertBefore(a,actions.firstChild);else card.appendChild(a);});}
  function cleanLegacy(){qa('.day .event-recommendation').forEach(function(x){x.style.display='none';});}
  var scheduled=false;function refresh(){scheduled=false;try{cleanLegacy();addExcursions();addNotes();addEventLinks();}catch(e){console.error('DT2 refresh',e);}}
  function schedule(){if(scheduled)return;scheduled=true;setTimeout(refresh,120);}
  function attachObserver(){var root=q('#planList');if(!root||root.__guideDayToolsObserved)return false;root.__guideDayToolsObserved=true;new MutationObserver(function(){schedule();}).observe(root,{childList:true,subtree:true});return true;}
  var stl=document.createElement('style');stl.id='guide-day-tools-style';stl.textContent='.guide-day-excursion{margin:0 16px 12px;padding:13px;border:1px solid var(--line,#ddd);border-radius:14px;background:#f7faf9}.guide-day-excursion.is-booked{background:#eef7f1;border-color:#a7c9b1}.guide-day-excursion-kicker{font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:var(--accent,#2f7d78);font-weight:850;margin-bottom:4px}.guide-day-excursion>b{display:block;font-size:15px;line-height:1.3}.guide-day-excursion>span{display:block;margin-top:4px;color:var(--muted,#777);font-size:11px}.guide-day-excursion>a,.guide-event-ticket-link{display:block;margin-top:10px;padding:10px 11px;border-radius:11px;background:var(--accent,#2f7d78);color:#fff!important;text-align:center;text-decoration:none!important;font-weight:850}.guide-booked-toggle{width:100%;margin-top:8px;padding:9px 10px;border:1px solid var(--accent,#2f7d78);border-radius:10px;background:#fff;color:var(--accent,#2f7d78);font:800 12px/1.2 system-ui}.guide-booked-status{margin-top:9px;padding:8px 9px;border-radius:9px;background:#dff1e5;color:#245b38;font-size:11px;font-weight:800}.guide-day-notes{margin:12px 16px 16px;padding:10px 12px;border:1px solid var(--line,#ddd);border-radius:12px;background:#fff}.guide-day-notes summary{cursor:pointer;font-weight:800;font-size:12px;color:var(--accent,#2f7d78)}.guide-day-notes textarea{width:100%;margin-top:9px;padding:10px;border:1px solid var(--line,#ddd);border-radius:9px;resize:vertical;font:13px/1.4 system-ui;color:inherit;background:#fff}.event-actions .guide-event-ticket-link{margin-top:0}.day .event-recommendation{display:none!important}@media(max-width:520px){.event-actions{grid-template-columns:1fr!important}}';if(!q('#'+stl.id))document.head.appendChild(stl);
  document.addEventListener('click',function(e){var t=e.target;if(t&&(t.id==='next'||(t.dataset&&['days','events'].indexOf(t.dataset.tab)>=0)))schedule();},true);
  var tries=0;(function boot(){attachObserver();schedule();if(++tries<12)setTimeout(boot,500);})();window.guideRefreshDayTools=refresh;
})();