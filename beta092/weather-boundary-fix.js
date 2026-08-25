(function(){
  if(window.__guideBoundaryWeatherFixInstalled)return;
  window.__guideBoundaryWeatherFixInstalled='WX1';
  var cityLoc={
    'Калининград':[54.7104,20.5100,false],
    'Зеленоградск':[54.9600,20.4750,true],
    'Светлогорск':[54.9430,20.1510,true],
    'Пионерский':[54.9510,20.2270,true],
    'Янтарный':[54.8710,19.9400,true],
    'Балтийск':[54.6530,19.9080,true],
    'Гусев':[54.5922,22.1997,false]
  };
  var seaLoc={
    'Зеленоградск':[54.970,20.360],
    'Светлогорск':[54.950,20.080],
    'Пионерский':[54.955,20.185],
    'Янтарный':[54.880,19.860],
    'Балтийск':[54.660,19.800]
  };
  function q(s,r){return (r||document).querySelector(s);}
  function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
  function pad(n){return String(n).padStart(2,'0');}
  function iso(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
  function tripDates(){
    var a=(q('#a')&&q('#a').value)||(q('#start')&&q('#start').value)||'',b=(q('#b')&&q('#b').value)||(q('#end')&&q('#end').value)||'';
    if(!a||!b)return[];var out=[],d=new Date(a+'T12:00:00'),e=new Date(b+'T12:00:00'),g=0;
    while(d<=e&&g<31){out.push(iso(d));d.setDate(d.getDate()+1);g++;}return out;
  }
  function cityFor(i,card){
    var c=(window.planBases&&window.planBases[i])||'';
    var s=(window.currentPlan&&window.currentPlan[i])||{};
    c=c||s.__boundaryCity||s.base||'';
    if(c)return c;
    var txt=(card&&card.innerText)||'';return Object.keys(cityLoc).find(function(x){return txt.indexOf(x)>=0;})||'Калининград';
  }
  function weatherText(c){if(c===0)return'ясно';if(c<=3)return'облачно';if(c===45||c===48)return'туман';if(c>=51&&c<=67)return'дождь';if(c>=80&&c<=82)return'ливни';if(c>=95)return'гроза';return'переменная погода';}
  function seaText(h){if(h==null)return'—';if(h<0.45)return'спокойное';if(h<0.9)return'небольшая волна';if(h<1.5)return'волнуется';return'сильная волна';}
  function daily(j,date){if(!j||!j.daily)return null;var i=j.daily.time.indexOf(date);if(i<0)return null;return{code:j.daily.weather_code[i],max:j.daily.temperature_2m_max[i],min:j.daily.temperature_2m_min[i],rain:j.daily.precipitation_probability_max[i]};}
  function marine(j,date){if(!j||!j.hourly)return null;var ts=[],ws=[];for(var i=0;i<j.hourly.time.length;i++){if(j.hourly.time[i].slice(0,10)!==date)continue;var t=j.hourly.sea_surface_temperature&&j.hourly.sea_surface_temperature[i],w=j.hourly.wave_height&&j.hourly.wave_height[i];if(t!=null)ts.push(t);if(w!=null)ws.push(w);}return{temp:ts.length?ts.reduce(function(a,b){return a+b;},0)/ts.length:null,wave:ws.length?ws.reduce(function(a,b){return a+b;},0)/ws.length:null};}
  function fetchWeather(city,date){var p=cityLoc[city]||cityLoc['Калининград'];var u='https://api.open-meteo.com/v1/forecast?latitude='+p[0]+'&longitude='+p[1]+'&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Europe%2FKaliningrad&forecast_days=16';var wp=fetch(u).then(function(r){return r.ok?r.json():null;}).catch(function(){return null;});var sp=Promise.resolve(null);if(p[2]&&seaLoc[city]){var s=seaLoc[city];var su='https://marine-api.open-meteo.com/v1/marine?latitude='+s[0]+'&longitude='+s[1]+'&hourly=sea_surface_temperature,wave_height&timezone=Europe%2FKaliningrad&forecast_days=8&cell_selection=sea';sp=fetch(su).then(function(r){return r.ok?r.json():null;}).catch(function(){return null;});}return Promise.all([wp,sp]).then(function(v){return{w:daily(v[0],date),m:marine(v[1],date),coastal:p[2]};});}
  function staleBlock(card){var candidates=qa('div,section',card).filter(function(el){var t=(el.innerText||'');return /Прогноз ближе к дате/i.test(t)&&/ПОГОДА/i.test(t);});candidates.sort(function(a,b){return (a.innerText||'').length-(b.innerText||'').length;});return candidates[0]||null;}
  function liveBlock(card){return q('.guide-live-boundary-weather',card);}
  function render(card,i,date,city,data){
    if(!data||!data.w)return;
    var w=data.w,m=data.m,box=liveBlock(card)||document.createElement('div');box.className='guide-live-boundary-weather';
    var sea=data.coastal?'<div><span>Вода</span><b>'+(m&&m.temp!=null?m.temp.toFixed(1)+'°':'—')+'</b><small>Балтийское море</small></div><div><span>Море</span><b>'+seaText(m&&m.wave)+'</b><small>'+(m&&m.wave!=null?m.wave.toFixed(1)+' м':'волна —')+'</small></div>':'';
    box.innerHTML='<div class="guide-weather-title">ПОГОДА</div><div class="guide-weather-grid"><div><span>Воздух</span><b>'+Math.round(w.min)+'…'+Math.round(w.max)+'°</b><small>'+weatherText(w.code)+'</small></div><div><span>Осадки</span><b>'+(w.rain==null?'—':Math.round(w.rain)+'%')+'</b><small>вероятность</small></div>'+sea+'</div>';
    var stale=staleBlock(card);if(stale&&stale!==box){stale.replaceWith(box);}else if(!box.parentNode){var head=q('.day-head',card)||card;head.appendChild(box);}
    card.dataset.boundaryWeatherDate=date;card.dataset.boundaryWeatherCity=city;
  }
  function refresh(){
    var cards=qa('#planList .day'),ds=tripDates();if(!cards.length||!ds.length)return;
    cards.forEach(function(card,i){var txt=(card.innerText||'');var boundary=i===0||i===cards.length-1||/День приезда|День вылета|День отъезда/i.test(txt);if(!boundary)return;var date=ds[i];if(!date||card.dataset.boundaryWeatherDate===date)return;var city=cityFor(i,card);fetchWeather(city,date).then(function(data){render(card,i,date,city,data);});});
  }
  var st=document.createElement('style');st.id='guide-boundary-weather-style';st.textContent='.guide-live-boundary-weather{margin:12px 0 4px;padding:12px 0;border-top:1px solid var(--line,#ddd);border-bottom:1px solid var(--line,#ddd)}.guide-weather-title{font-size:11px;font-weight:850;color:var(--muted,#777);letter-spacing:.05em;margin-bottom:8px}.guide-weather-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.guide-weather-grid div{min-width:0}.guide-weather-grid span{display:block;font-size:10px;text-transform:uppercase;color:var(--muted,#777);margin-bottom:3px}.guide-weather-grid b{display:block;font-size:15px;line-height:1.25}.guide-weather-grid small{display:block;font-size:10px;color:var(--muted,#777);margin-top:2px}@media(max-width:560px){.guide-weather-grid{grid-template-columns:repeat(2,minmax(0,1fr));row-gap:11px}}';if(!q('#'+st.id))document.head.appendChild(st);
  document.addEventListener('click',function(e){var t=e.target;if(t&&(t.dataset&&t.dataset.tab==='days'||t.id==='next'||t.classList&&t.classList.contains('ob-next')))setTimeout(refresh,700);},true);
  var root=q('#planList');if(root)new MutationObserver(function(){setTimeout(refresh,80);}).observe(root,{childList:true,subtree:true});
  setTimeout(refresh,1000);window.guideRefreshBoundaryWeather=refresh;
})();