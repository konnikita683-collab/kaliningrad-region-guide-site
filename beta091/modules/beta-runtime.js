(function(){
  window.__guideBetaRuntimeInstalled='0.9.2';
  window.__guideBeta=true;
  window.__guideBetaVersion='0.9.2-beta';
  try{
    var stateSchema='0.9.2-lodging-reset-1';
    if(localStorage.getItem('guideBetaStateSchema')!==stateSchema){
      ['guideOnboarding','guideLodgingOnboarding','guideLodgings','guideGuestAges'].forEach(function(k){localStorage.removeItem(k);});
      localStorage.setItem('guideBetaStateSchema',stateSchema);
    }
    var p=new URLSearchParams(location.search||''),c=(p.get('campaign')||p.get('source')||'').trim();
    if(c)localStorage.setItem('guideCampaign',c.slice(0,80));
  }catch(e){}
  function install(){
    var el=document.getElementById('guideBetaBadge');
    if(!el){el=document.createElement('div');el.id='guideBetaBadge';document.body.appendChild(el);}
    el.textContent='BETA 0.9.2';
    el.setAttribute('aria-label','Тестовая версия 0.9.2');
    if(!document.getElementById('guide-beta-badge-style')){var st=document.createElement('style');st.id='guide-beta-badge-style';st.textContent='#guideBetaBadge{position:fixed;right:10px;bottom:10px;z-index:99999;padding:6px 9px;border-radius:999px;background:rgba(31,42,43,.88);color:#fff;font:800 10px/1 system-ui,-apple-system,Segoe UI,sans-serif;letter-spacing:.06em;box-shadow:0 4px 18px rgba(0,0,0,.16);pointer-events:none}';document.head.appendChild(st);}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
