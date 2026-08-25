(function(){
  if(window.__guideExcursionDayFixInstalled)return;
  window.__guideExcursionDayFixInstalled='EX1';
  function q(s,r){return (r||document).querySelector(s);}
  function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
  var recs=[
    {rx:/Курш|Высот[аы] Эфа|Танцующ/i,city:/Зеленоградск/i,title:'Куршская коса, орнитологическая станция и Танцующий лес',meta:'из Зеленоградска · групповая · около 7 ч',url:'https://experience.tripster.ru/experience/60689/'},
    {rx:/Курш|Высот[аы] Эфа|Танцующ/i,title:'Куршская коса, Зеленоградск и замки',meta:'из Калининграда · насыщенный день',url:'https://experience.tripster.ru/experience/38413/'},
    {rx:/Амалиенау/i,title:'Вдохновляющий Амалиенау',meta:'пешеходная экскурсия · около 2 ч',url:'https://experience.tripster.ru/experience/27217/'},
    {rx:/форт|Д[её]нхофф|Штайн/i,title:'По фортам Калининграда',meta:'групповая автобусная · около 4 ч',url:'https://experience.tripster.ru/experience/87291/'},
    {rx:/Гусев|Черняховск/i,title:'Гусев и Черняховск: время войн и мирных свершений',meta:'из Калининграда · экскурсионный день',url:'https://experience.tripster.ru/experience/78902/'},
    {rx:/Балтийск|Янтарн|Филинск|Западное побережье|Светлогорск/i,title:'От порта до курорта: Балтийск, Янтарный и Светлогорск',meta:'групповая экскурсия по побережью',url:'https://experience.tripster.ru/experience/42825/'},
    {rx:/Зеленоградск/i,title:'Зеленоградск: путешествие в прошлое',meta:'пешеходная · около 2 ч · можно с детьми',url:'https://experience.tripster.ru/experience/11686/'},
    {rx:/Калининград|Канта|К[её]нигсберг|Рыбн/i,title:'Полюбить Калининград за 3 часа',meta:'групповая пешеходная · 3 ч',url:'https://experience.tripster.ru/experience/16577/'}
  ];
  function pick(card){
    var text=card.innerText||'';
    if(/День приезда|День вылета|День отъезда/i.test(text))return null;
    for(var i=0;i<recs.length;i++){var r=recs[i];if(r.rx.test(text)&&(!r.city||r.city.test(text)))return r;}
    return null;
  }
  function addDayCards(){
    qa('.day').forEach(function(card){
      var old=q('.guide-day-excursion',card),r=pick(card);
      if(!r){if(old)old.remove();return;}
      if(old&&old.dataset.url===r.url)return;
      if(old)old.remove();
      var box=document.createElement('div');box.className='guide-day-excursion';box.dataset.url=r.url;
      box.innerHTML='<div class="guide-day-excursion-kicker">Экскурсия по теме дня</div><b>'+r.title+'</b><span>'+r.meta+'</span><a href="'+r.url+'" target="_blank" rel="noopener" data-tripster-day>Посмотреть и забронировать</a>';
      var head=q('.day-head',card);if(head&&head.nextSibling)card.insertBefore(box,head.nextSibling);else if(head)card.appendChild(box);else card.insertBefore(box,card.firstChild);
    });
  }
  function ticketUrl(card){
    var t=card.innerText||'';
    if(/Янтарь-холл|Кадышев|Банкет/i.test(t))return'https://yantarkassa.ru/events';
    if(/Светлогорск|Индия звучащая|фитнес-танцы/i.test(t))return'https://www.svetlogorsk-tourism.ru/calendar/';
    return'https://visit-kaliningrad.ru/events/';
  }
  function addEventLinks(){
    qa('.event-card').forEach(function(card){
      if(q('.guide-event-ticket-link',card))return;
      var actions=q('.event-actions',card);var a=document.createElement('a');a.className='guide-event-ticket-link';a.href=ticketUrl(card);a.target='_blank';a.rel='noopener';a.textContent='Билеты / подробнее';
      if(actions)actions.insertBefore(a,actions.firstChild);else card.appendChild(a);
    });
  }
  function cleanLegacyDayEventPromos(){qa('.day .event-recommendation').forEach(function(x){x.style.display='none';});}
  function refresh(){cleanLegacyDayEventPromos();addDayCards();addEventLinks();}
  var st=document.createElement('style');st.id='guide-excursion-day-style';st.textContent='.guide-day-excursion{margin:0 16px 12px;padding:13px;border:1px solid var(--line,#ddd);border-radius:14px;background:#f7faf9}.guide-day-excursion-kicker{font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:var(--accent,#2f7d78);font-weight:850;margin-bottom:4px}.guide-day-excursion>b{display:block;font-size:15px;line-height:1.3}.guide-day-excursion>span{display:block;margin-top:4px;color:var(--muted,#777);font-size:11px}.guide-day-excursion>a,.guide-event-ticket-link{display:block;margin-top:10px;padding:10px 11px;border-radius:11px;background:var(--accent,#2f7d78);color:#fff!important;text-align:center;text-decoration:none!important;font-weight:850}.event-actions .guide-event-ticket-link{margin-top:0}.event-actions{grid-template-columns:1fr 1fr!important}.day .event-recommendation{display:none!important}@media(max-width:520px){.event-actions{grid-template-columns:1fr!important}}';if(!q('#'+st.id))document.head.appendChild(st);
  document.addEventListener('click',function(e){var t=e.target;if(t&&(t.dataset&&['days','events'].indexOf(t.dataset.tab)>=0||t.id==='next'))setTimeout(refresh,180);},true);
  if(document.body)new MutationObserver(function(){setTimeout(refresh,80);}).observe(document.body,{childList:true,subtree:true});
  setTimeout(refresh,700);window.guideRefreshExcursions=refresh;
})();