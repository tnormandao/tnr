(function(window){
  window.tnr = tnr || {};
  tnr.audio = function( S ){
    var A = this;
    A.DOM = document.getElementById( S );
    A.ctx = new AudioContext();
    A.anl = A.ctx.createAnalyser();
    A.src = A.ctx.createMediaElementSource( A.DOM );
    A.src.connect( A.ctx.destination );
    A.src.connect( A.anl );
    A.currentData = new Uint8Array( A.anl.frequencyBinCount );
    A.getCurrentData = function(){
      A.anl.getByteFrequencyData( A.currentData );
      return A.currentData;
    }
  };
})(this);