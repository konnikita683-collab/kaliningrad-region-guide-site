(function(){
  if(window.__guideDateFixInstalled)return;
  window.__guideDateFixInstalled='0.9.2-datefix-1';
  var SCHEMA='0.9.2-datefix-1';
  function read(k,d){try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d));}catch(e){return d;}}
  function write(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
  function fmt(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(String(s||'')))return '—';return new Date(s+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'short'});}
  function selectedCities(){return Array.prototype.slice.call(document.querySelectorAll('.ob-choice[data-group="city"].selected')).map(function(x){return x.dataset.value;});}
  function ensureDatesInStorage(){
    var ob=read('guideOnboarding',{}),meta=read('guideLodgingOnboarding',{start:'',end:'',cities:{},cityOrder:[]});
    var start=ob.start||meta.start||'',end=ob.end||meta.end||'';
    var cities=selectedCities();
    if(!cities.length||!start||!end)return;
    ob.cities=cities.slice();write('guideOnboarding',ob);
    meta.start=start;meta.end=end;meta.cities=meta.cities||{};
    if(cities.length===1){
      var city=cities[0],old=meta.cities[city]||{};
      meta.cities={};
      meta.cities[city]=Object.assign({},old,{start:start,end:end});
      meta.cityOrder=[city];
      write('guideLodgingOnboarding',meta);
      var lod={};lod[city]={start:start,end:end,address:(old.address||'')};write('guideLodgings',lod);
    }
  }
  function refreshHousing(){
    ensureDatesInStorage();
    if(typeof window.guideRenderHousingOnboarding==='function'){
      try{window.guideRenderHousingOnboarding();}catch(e){}
    }
    var cities=selectedCities();
    if(cities.length!==1)return;
    var ob=read('guideOnboarding',{}),meta=read('guideLodgingOnboarding',{}),start=ob.start||meta.start||'',end=ob.end||meta.end||'';
    var span=document.querySelector('.ob-lodging-head span');
    if(span&&start&&end)span.textContent=fmt(start)+' — '+fmt(end);
  }
  if(localStorage.getItem('guideDateFixSchema')!==SCHEMA){
    var seed={step:0,adults:2,children:0,cities:[],housing:'have',car:'maybe',carDays:2,interests:['sea','nature']};
    write('guideOnboarding',seed);
    localStorage.removeItem('guideLodgingOnboarding');
    localStorage.removeItem('guideLodgings');
    localStorage.setItem('guideDateFixSchema',SCHEMA);
    if(!sessionStorage.getItem('guideDateFixReloaded')){
      sessionStorage.setItem('guideDateFixReloaded','1');
      location.reload();
      return;
    }
  }
  document.addEventListener('click',function(e){
    var t=e.target;
    if(!t)return;
    var next=t.closest&&t.closest('.ob-next');
    if(next){
      var a=document.querySelector('#obStart'),b=document.querySelector('#obEnd');
      if(a&&b){var ob=read('guideOnboarding',{});ob.start=a.value;ob.end=b.value;write('guideOnboarding',ob);var meta=read('guideLodgingOnboarding',{start:'',end:'',cities:{},cityOrder:[]});meta.start=a.value;meta.end=b.value;write('guideLodgingOnboarding',meta);}
    }
    var city=t.closest&&t.closest('.ob-choice[data-group="city"]');
    if(city||next)setTimeout(refreshHousing,30);
  },true);
  setTimeout(refreshHousing,300);
})();
