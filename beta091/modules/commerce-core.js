(function(){
  if(window.guideCommerce)return;
  function read(k,d){try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d));}catch(e){return d;}}
  function write(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
  var defaults={
    yandexTravel:{enabled:false,affiliateClid:'',affiliateVid:'guidehotels',partnerUrl:'',erid:''},
    localrent:{enabled:false,referralUrl:''},
    afisha:{enabled:false,clientKey:'',eventUrls:{}}
  };
  function mergedPart(name){var staticConfig=window.GUIDE_PARTNERS||{},local=read('guideCommerceConfig',{});return Object.assign({},defaults[name]||{},local[name]||{},staticConfig[name]||{});}
  function config(){return{yandexTravel:mergedPart('yandexTravel'),localrent:mergedPart('localrent'),afisha:mergedPart('afisha')};}
  function setConfig(next){var local=read('guideCommerceConfig',{});Object.keys(next||{}).forEach(function(k){local[k]=Object.assign({},local[k]||{},next[k]||{});});write('guideCommerceConfig',local);return config();}
  function append(url,key,value){if(value==null||value==='')return url;return url+(url.indexOf('?')>=0?'&':'?')+encodeURIComponent(key)+'='+encodeURIComponent(value);}
  function cleanAges(value){return(Array.isArray(value)?value:[]).map(function(v){return Number(v);}).filter(function(v){return Number.isInteger(v)&&v>=0&&v<=17;});}
  function dotDate(value){var m=String(value||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?m[3]+'.'+m[2]+'.'+m[1]:'';}
  function hotelUrl(ctx){
    ctx=ctx||{};var slug=ctx.slug||'kaliningrad',u='https://travel.yandex.ru/hotels/'+encodeURIComponent(slug)+'/';
    if(ctx.start)u=append(u,'checkinDate',ctx.start);
    if(ctx.end)u=append(u,'checkoutDate',ctx.end);
    if(ctx.adults)u=append(u,'adults',ctx.adults);
    var ages=cleanAges(ctx.childrenAges);
    if(ages.length)u=append(u,'childrenAges',ages.join(','));
    u=append(u,'roomCount',ctx.roomCount||1);
    var c=config().yandexTravel;
    if(c.enabled&&c.affiliateClid){
      u=append(u,'affiliate_clid',c.affiliateClid);
      if(c.affiliateVid)u=append(u,'affiliate_vid',c.affiliateVid);
      if(c.erid)u=append(u,'erid',c.erid);
      u=append(u,'utm_source','distribution');
      u=append(u,'utm_medium','cpa');
      return u;
    }
    if(c.enabled&&c.partnerUrl)return c.partnerUrl;
    return u;
  }
  function ostrovokUrl(ctx){
    ctx=ctx||{};
    var slug=String(ctx.ostrovokSlug||ctx.slug||'kaliningrad').toLowerCase();
    var u='https://ostrovok.ru/hotel/russia/'+encodeURIComponent(slug)+'/';
    var start=dotDate(ctx.start),end=dotDate(ctx.end);
    if(start&&end)u=append(u,'dates',start+'-'+end);
    return u;
  }
  function campaign(){try{return String(localStorage.getItem('guideCampaign')||'').trim();}catch(e){return'';}}
  function track(event){var log=read('guideCommerceClicks',[]),base={ts:new Date().toISOString()},c=campaign();if(c)base.campaign=c;log.push(Object.assign(base,event||{}));if(log.length>200)log=log.slice(log.length-200);write('guideCommerceClicks',log);}
  function open(url,event){track(Object.assign({url:url},event||{}));if(window.__guideAndroid){window.location.href=url;return true;}return false;}
  function status(){var c=config(),eventUrls=c.afisha.eventUrls||{};return{
    yandexTravel:!!(c.yandexTravel.enabled&&(c.yandexTravel.affiliateClid||c.yandexTravel.partnerUrl)),
    localrent:!!(c.localrent.enabled&&c.localrent.referralUrl),
    afisha:!!(c.afisha.enabled&&(c.afisha.clientKey||Object.keys(eventUrls).length))
  };}
  window.guideCommerce={config:config,setConfig:setConfig,buildYandexTravelHotelUrl:hotelUrl,buildOstrovokUrl:ostrovokUrl,track:track,open:open,status:status};
})();