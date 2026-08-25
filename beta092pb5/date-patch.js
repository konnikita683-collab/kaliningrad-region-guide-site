(function(){
  document.addEventListener('DOMContentLoaded', function(){
    try {
      if (typeof ensureLodgingDates !== 'function') return;
      var original = ensureLodgingDates;
      ensureLodgingDates = function(){
        var result = original.apply(this, arguments);
        try {
          if (typeof lodgingSetup === 'object' && typeof lodgingSplit === 'function') {
            var prev = null;
            lodgingSplit().forEach(function(item){
              if (prev && item.start < prev) item.start = prev;
              if (item.end <= item.start) {
                var d = new Date(item.start + 'T12:00:00');
                d.setDate(d.getDate()+1);
                item.end = d.toISOString().slice(0,10);
              }
              prev = item.end;
              if (lodgingSetup[item.city]) {
                lodgingSetup[item.city].start=item.start;
                lodgingSetup[item.city].end=item.end;
              }
            });
          }
        } catch(e) { console.error('date patch',e); }
        return result;
      };
    } catch(e) { console.error('date patch init',e); }
  });
})();
