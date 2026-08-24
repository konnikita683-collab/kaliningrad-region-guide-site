(function(){
  if(window.__guideBetaRuntimeInstalled)return;
  window.__guideBetaRuntimeInstalled=true;
  window.__guideBeta=true;
  window.__guideBetaVersion='0.9.1-beta';
  try{
    var p=new URLSearchParams(location.search||''),c=(p.get('campaign')||p.get('source')||'').trim();
    if(c)localStorage.setItem('guideCampaign',c.slice(0,80));
  }catch(e){}
  function install(){
    if(document.getElementById('guideBetaBadge'))return;
    var el=document.createElement('div');
    el.id='guideBetaBadge';
    el.textContent='BETA 0.9.1';
    el.setAttribute('aria-label','Тестовая версия 0.9.1');
    document.body.appendChild(el);
    var st=document.createElement('style');
    st.textContent='#guideBetaBadge{position:fixed;right:10px;bottom:10px;z-index:99999;padding:6px 9px;border-radius:999px;background:rgba(31,42,43,.88);color:#fff;font:800 10px/1 system-ui,-apple-system,Segoe UI,sans-serif;letter-spacing:.06em;box-shadow:0 4px 18px rgba(0,0,0,.16);pointer-events:none}';
    document.head.appendChild(st);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
