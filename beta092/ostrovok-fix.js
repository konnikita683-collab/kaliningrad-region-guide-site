(function(){
  'use strict';
  try{
    if(typeof st==='undefined' || typeof lodgingSetup==='undefined') return;

    var ost={
      'Калининград':{slug:'kaliningrad',q:'1798'},
      'Зеленоградск':{slug:'zelenogradsk',q:'6135696'},
      'Светлогорск':{slug:'svetlogorsk',q:'602214'},
      'Пионерский':{slug:'pionerskiy',q:'965821406'},
      'Янтарный':{slug:'yantarny',q:'6198909'},
      'Балтийск':{slug:'baltiysk',q:'6140000'},
      'Гусев':{slug:'gusev',q:'965829698'}
    };
    var aliases={
      'kaliningrad':'Калининград','калининград':'Калининград',
      'zelenogradsk':'Зеленоградск','зеленоградск':'Зеленоградск',
      'svetlogorsk':'Светлогорск','светлогорск':'Светлогорск',
      'pionerskiy':'Пионерский','пионерский':'Пионерский',
      'yantarny':'Янтарный','yantarnyi':'Янтарный','янтарный':'Янтарный',
      'baltiysk':'Балтийск','baltiisk':'Балтийск','балтийск':'Балтийск',
      'gusev':'Гусев','гусев':'Гусев'
    };

    function ostDate(s){
      var p=String(s||'').split('-');
      return p.length===3 ? p[2]+'.'+p[1]+'.'+p[0] : '';
    }

    window.guideBuildOstrovokUrl=function(city){
      var cfg=ost[city];
      var stay=lodgingSetup[city]||{};
      var start=stay.start||st.start||'';
      var end=stay.end||st.end||'';
      var adults=Math.max(1,parseInt(st.adults||2,10)||2);
      if(!cfg||!start||!end) return '';
      return 'https://ostrovok.ru/hotel/russia/'+cfg.slug+'/?q='+cfg.q+
        '&dates='+ostDate(start)+'-'+ostDate(end)+
        '&guests='+adults+'&search=yes';
    };

    window.guideRewriteOstrovokUrl=function(raw){
      var original=String(raw||'');
      if(original.indexOf('ostrovok.ru/hotel/russia/')<0) return original;
      var decoded=original;
      try{ decoded=decodeURIComponent(original); }catch(e){}
      var marker='/hotel/russia/';
      var pos=decoded.indexOf(marker);
      if(pos<0) return original;
      var rest=decoded.slice(pos+marker.length);
      var key=(rest.split('/')[0]||'').toLowerCase();
      var city=aliases[key];
      return city ? window.guideBuildOstrovokUrl(city) : original;
    };

    if(!window.__guideNativeOpen) window.__guideNativeOpen=window.open.bind(window);
    window.open=function(url,target,features){
      return window.__guideNativeOpen(window.guideRewriteOstrovokUrl(url),target,features);
    };

    var badge=document.getElementById('beta092Date2Badge');
    if(badge) badge.textContent='BETA 0.9.2 OST6';
  }catch(err){
    console.error('OST6',err);
    var badge=document.getElementById('beta092Date2Badge');
    if(badge){badge.textContent='OST6 ERROR';badge.style.background='#8b1e1e';}
  }
})();
