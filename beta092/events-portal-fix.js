(function(){
  if(window.__guideEventPortalFixInstalled)return;
  window.__guideEventPortalFixInstalled='EV2';
  function q(s,r){return (r||document).querySelector(s);}
  function ensure(){
    var section=q('#events');if(!section)return false;
    var panel=q('.event-panel',section)||q('.panel',section)||section;if(!panel)return false;
    if(q('#guideEventPortals',panel))return true;
    var box=document.createElement('div');box.id='guideEventPortals';box.className='guide-event-portals';
    box.innerHTML='<div class="guide-event-portal-copy"><b>Больше событий и билетов</b><span>Проверяйте полную афишу на ваши даты и бронируйте экскурсии отдельно.</span></div><div class="guide-event-portal-actions"><a data-event-portal="afisha" href="https://afisha.yandex.ru/kaliningrad" target="_blank" rel="noopener">Афиша и билеты</a><a data-event-portal="tripster" href="https://experience.tripster.ru/experience/Kaliningrad/" target="_blank" rel="noopener">Экскурсии и впечатления</a></div>';
    var helper=q('.helper',panel),heading=q('h2',panel);if(helper&&helper.nextSibling)panel.insertBefore(box,helper.nextSibling);else if(heading&&heading.nextSibling)panel.insertBefore(box,heading.nextSibling);else panel.insertBefore(box,panel.firstChild);
    return true;
  }
  document.addEventListener('click',function(e){var t=e.target;if(t&&t.dataset&&t.dataset.tab==='events')setTimeout(ensure,120);},true);
  var st=document.createElement('style');st.id='guide-event-portals-style';st.textContent='.guide-event-portals{margin:12px 0 14px;padding:12px;border:1px solid var(--line,#ddd);border-radius:14px;background:#f7faf9}.guide-event-portal-copy b{display:block;font-size:14px}.guide-event-portal-copy span{display:block;margin-top:3px;font-size:11px;line-height:1.4;color:var(--muted,#777)}.guide-event-portal-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.guide-event-portal-actions a{display:block;padding:11px 10px;border-radius:11px;text-align:center;text-decoration:none;font-weight:850;background:var(--accent,#2f7d78);color:#fff}.guide-event-portal-actions a+a{background:#fff;color:var(--accent,#2f7d78);border:1px solid var(--accent,#2f7d78)}@media(max-width:520px){.guide-event-portal-actions{grid-template-columns:1fr}}';if(!q('#'+st.id))document.head.appendChild(st);
  if(document.body)new MutationObserver(function(){setTimeout(ensure,60);}).observe(document.body,{childList:true,subtree:true});
  var tries=0;(function boot(){ensure();if(++tries<40)setTimeout(boot,250);})();window.guideEnsureEventPortals=ensure;
})();