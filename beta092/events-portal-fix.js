(function(){
  if(window.__guideEventPortalFixInstalled)return;
  window.__guideEventPortalFixInstalled='EV3';
  function q(s,r){return (r||document).querySelector(s);}
  function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
  function findPanel(){
    var section=q('#events');
    if(section){var p=q('.event-panel',section)||q('.panel',section);if(p)return p;}
    var heading=qa('h1,h2,h3').find(function(h){return /События на ваши даты/i.test(h.textContent||'');});
    if(heading)return heading.closest('.event-panel,.panel,.view,section')||heading.parentElement;
    var active=q('.view.active');if(active&&(active.innerText||'').indexOf('События на ваши даты')>=0)return q('.panel',active)||active;
    return null;
  }
  function ensure(){
    var panel=findPanel();if(!panel)return false;
    if(q('#guideEventPortals',panel))return true;
    var box=document.createElement('div');box.id='guideEventPortals';box.className='guide-event-portals';
    box.innerHTML='<div class="guide-event-portal-copy"><b>Больше событий и билетов</b><span>Полная афиша — для концертов, театра и мероприятий. Экскурсии и впечатления — отдельным каталогом.</span></div><div class="guide-event-portal-actions"><a data-event-portal="afisha" href="https://afisha.yandex.ru/kaliningrad" target="_blank" rel="noopener">Открыть афишу</a><a data-event-portal="tripster" href="https://experience.tripster.ru/experience/Kaliningrad/" target="_blank" rel="noopener">Билеты и экскурсии</a></div>';
    var helper=q('.helper',panel),heading=q('h2',panel)||q('h1',panel);if(helper&&helper.nextSibling)panel.insertBefore(box,helper.nextSibling);else if(heading&&heading.nextSibling)panel.insertBefore(box,heading.nextSibling);else panel.insertBefore(box,panel.firstChild);
    return true;
  }
  document.addEventListener('click',function(e){var t=e.target;if(t&&t.dataset&&t.dataset.tab==='events')setTimeout(ensure,160);},true);
  var st=document.createElement('style');st.id='guide-event-portals-style';st.textContent='.guide-event-portals{margin:12px 0 14px;padding:12px;border:1px solid var(--line,#ddd);border-radius:14px;background:#f7faf9}.guide-event-portal-copy b{display:block;font-size:14px}.guide-event-portal-copy span{display:block;margin-top:3px;font-size:11px;line-height:1.4;color:var(--muted,#777)}.guide-event-portal-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.guide-event-portal-actions a{display:block;padding:11px 10px;border-radius:11px;text-align:center;text-decoration:none;font-weight:850;background:var(--accent,#2f7d78);color:#fff}.guide-event-portal-actions a+a{background:#fff;color:var(--accent,#2f7d78);border:1px solid var(--accent,#2f7d78)}@media(max-width:520px){.guide-event-portal-actions{grid-template-columns:1fr}}';if(!q('#'+st.id))document.head.appendChild(st);
  if(document.body)new MutationObserver(function(){setTimeout(ensure,80);}).observe(document.body,{childList:true,subtree:true});
  var tries=0;(function boot(){ensure();if(++tries<80)setTimeout(boot,250);})();window.guideEnsureEventPortals=ensure;
})();