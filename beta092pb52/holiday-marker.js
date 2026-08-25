(function(){
  'use strict';
  if(window.__guideHolidayMarkerInstalled)return;
  window.__guideHolidayMarkerInstalled='NY1';
  function q(s,r){return(r||document).querySelector(s);}
  function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
  function pad(n){return String(n).padStart(2,'0');}
  function iso(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
  function tripDates(){
    var state=(typeof st!=='undefined'&&st)||{},a=(q('#a')&&q('#a').value)||state.start||'',b=(q('#b')&&q('#b').value)||state.end||'';
    if(!a||!b)return[];
    var out=[],d=new Date(a+'T12:00:00'),e=new Date(b+'T12:00:00'),guard=0;
    while(d<=e&&guard++<31){out.push(iso(d));d.setDate(d.getDate()+1);}return out;
  }
  function isNewYearPeriod(date){
    if(!date)return false;
    var d=new Date(date+'T12:00:00'),m=d.getMonth(),n=d.getDate();
    return (m===11&&n>=30)||(m===0&&n<=8);
  }
  function labelFor(date){
    var d=new Date(date+'T12:00:00'),m=d.getMonth(),n=d.getDate();
    if(m===11&&n===31)return'31 декабря';
    if(m===0&&n===1)return'1 января';
    if(m===0&&n===7)return'Рождество';
    return'Новогодние каникулы';
  }
  function refresh(){
    var ds=tripDates(),cards=qa('.day');if(!ds.length||!cards.length)return;
    cards.forEach(function(card,i){
      var date=ds[i],daynum=q('.daynum',card);if(!daynum||!date)return;
      var marker=q('.guide-holiday-tree',daynum),legacy=q('.mini-tree',daynum);
      if(isNewYearPeriod(date)){
        if(!legacy){marker=document.createElement('span');marker.className='mini-tree guide-holiday-tree';marker.textContent='🎄';daynum.appendChild(marker);}else if(legacy&&!legacy.getAttribute('title'))legacy.setAttribute('title',labelFor(date));
        var shown=q('.guide-holiday-tree',daynum)||q('.mini-tree',daynum);if(shown){shown.setAttribute('title',labelFor(date));shown.setAttribute('aria-label',labelFor(date));}
      }else if(marker){marker.remove();}
    });
  }
  var timer=0;function schedule(ms){clearTimeout(timer);timer=setTimeout(refresh,typeof ms==='number'?ms:80);}
  var root=q('#planList')||document.body;new MutationObserver(function(){schedule(100);}).observe(root,{childList:true,subtree:true});
  document.addEventListener('click',function(e){var t=e.target;if(t&&(t.id==='next'||(t.dataset&&t.dataset.tab==='days')||(t.tagName==='BUTTON'&&/Заменить/i.test(t.textContent||''))))schedule(160);},true);
  document.addEventListener('change',function(e){if(e.target&&e.target.closest&&e.target.closest('.day'))schedule(120);},true);
  [300,900,1800].forEach(function(ms){setTimeout(refresh,ms);});
  window.guideRefreshHolidayMarker=refresh;
})();
