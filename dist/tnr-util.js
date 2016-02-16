var tnr = tnr || {};
(function(){
  tnr.util = function(){
    var utility = this;
    utility.eachInTime = function( D, A, cb, O ){ var _c = A.length, _i = 0; (function N(){ if(_i < _c){ var _t = setTimeout( function(){ clearTimeout(_t); cb( A[ _i ] ); _i++; N(); }, D);}else{if(O){O()}}})();};
    utility.eachInSeries = function( li, cb, oe ){ var ci = -1; var nt = function(){ ci++; if( li.length > ci ){ cb( ci, li[ ci ], nt ); } else { if(oe){ oe() } } }; nt(); };
    utility.once = function( ex, cb ){ if (ex && cb){  var wt = setInterval( function(){ if( ex() ){ clearInterval( wt ); cb(); } }, 20); } };
    utility.deepGet = function( o, k ){ var _k = k.split('.'), v = o; for( var i = 0; i < _k.length; i++ ){ var I = _k[i]; if(v[I] || v[I] === 0){ v = v[I] } else { v = false; } } return v; };
    utility.deepSort = function( A, key ){var K = key.split('.');function pk( V ){ for( var _i = 0; _i < K.length; _i++ ){ var I = K[_i]; if(V[I] || V[I] === 0){ V = V[I] } else { V = false; } } return V; }A.sort(function( a, b ){var P = { a: pk(a), b: pk(b) };if( P.a && P.b ){ if ( P.a < P.b ) { return -1; } else if ( P.a > P.b ) { return 1; } return 0; } else if( P.a && !P.b ) { return -1; } else if( !P.a && P.b ) { return 1; } else { return 0; }});};
  };
})();