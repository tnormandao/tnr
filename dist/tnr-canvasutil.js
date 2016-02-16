(function(window){
  window.tnr = tnr || {};
  tnr.canvas = function(){
    var utility = this;
    utility.eachCtx = function( cn, cb ){
      var ctx = cn.getContext('2d'), mw = cn.width, mh = Canvas.height;
      var im = ctx.getImageData(0, 0, mw, mh), pd = im.data, C = 0;
      for( var y = 0; y < mh; y++ ){ for( var x = 0; x < mw; x++ ){ var P = { r: pd[C], g: pd[C+1], b: pd[C+2], a: pd[C+3], x: x, y: y }; C+=4; cb(P); } }
    };
    utility.randomHexColor = function(){ return "#"+((1<<24)*Math.random()|0).toString(16); };
  };
})(this);