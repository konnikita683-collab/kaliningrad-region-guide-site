(function(){
  'use strict';
  var PARTNER='https://www.localrent.com/ru/russia/kaliningrad/?marker=carapp&r=17555';
  function q(s,r){return (r||document).querySelector(s);}
  function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
  function isLocalrent(a){
    var href=String(a.getAttribute('href')||'').toLowerCase();
    var card=a.closest&&a.closest('.rental-option');
    var title=card&&q('h3',card)?String(q('h3',card).textContent||''):'';
    return href.indexOf('localrent.com')>=0 || /localrent/i.test(title);
  }
  function decorate(){
    qa('a.rental-open').forEach(function(a){
      if(!isLocalrent(a))return;
      a.href=PARTNER;
      a.dataset.guidePartner='localrent';
      var card=a.closest&&a.closest('.rental-option');
      if(card&&!q('.guide-localrent-disclosure',card)){
        var d=document.createElement('div');
        d.className='guide-localrent-disclosure';
        d.textContent='Партнёрская ссылка · marker carapp';
        d.style.cssText='margin-top:8px;font-size:10px;line-height:1.35;color:var(--muted);';
        card.insertBefore(d,a);
      }
    });
  }
  decorate();
  if(document.body)new MutationObserver(decorate).observe(document.body,{childList:true,subtree:true});
  document.addEventListener('click',function(e){
    var a=e.target&&e.target.closest&&e.target.closest('a.rental-open');
    if(!a||!isLocalrent(a))return;
    a.href=PARTNER;
  },true);
  var badge=document.getElementById('beta092Date2Badge');
  if(badge)badge.textContent='BETA 0.9.2 LR1';
  window.guideLocalrentPartnerUrl=PARTNER;
})();