var tnr = tnr || {};
(function(){
  tnr.math = new function(){
    var utility = this;

    utility.toFix = function( n, fn ){ return parseFloat( n.toFixed( fn )) };
    utility.distance = function(X1,Y1,X2,Y2){ return Math.sqrt( Math.abs(Math.pow( X2 - X1, 2)) + Math.abs(Math.pow( Y2 - Y1, 2)) ); };
    utility.get_distance = function(p1,p2){ var xd=p2.x-p1.x,yd=p2.y-p1.y,zd=(p1.z&&p2.z)?p2.z-p1.z:0; return Math.sqrt(xd*xd+yd*yd+zd*zd); };
    utility.toV2 = function(s, d){ return Math.atan2( (d.y - s.y), (d.x - s.x) ); };
    utility.toDegV2 = function(s, d){ return (360 / (Math.PI*2) ) * ( Math.PI + utility.toV2(s, d) ) ; };
    utility.radNormal = function(R){ if( R < 0){ R += Math.PI*2 } else if( R > Math.PI*2 ){R -= Math.PI*2} return R; };
    utility.degNormal = function(D){ if( D < 0){ D += 360 } else if( D > 360 ){D -= 360} return D; };
    utility.sinBetween = function( m, c ) { return Math.sin( ((1/m )*c) * Math.PI/2 ); };
    utility.overCenter = function( X, Y, A, R ){ return { x: R*Math.sin(A)+X, y: R*Math.cos(A)+Y }; };
    utility.get_direction = function(s,d){return((-Math.PI/2+ -(Math.atan2((d.y-s.y),(d.x-s.x))))+(Math.PI*2))%(Math.PI*2) };
    utility.positionLerp = function( c, m, p1, p2 ){ var _l = p2 - p1, s = _l / m, p = (s * c) + p1; return p;};
    utility.lerpV2 = function( num, x1, y1, x2, y2  ){ var R=[]; for( var _i = 0; _i < num; _i++){ R.push([ utility.toFix( utility.positionLerp( _i, num-1, x1, x2 ), 5 ), utility.toFix( utility.positionLerp( _i, num-1, y1, y2), 5 ) ]); }; return R; };
    utility.lerpV3 = function( num, pos1, pos2 ){ var R = []; for( var _i = 0; _i < num; _i++){ R.push([ utility.toFix( utility.positionLerp( _i, num-1, pos1.x, pos2.x ), 5 ), utility.toFix( utility.positionLerp( _i, num-1, pos1.y, pos2.y ), 5 ), utility.toFix( utility.positionLerp( _i, num-1, pos1.z, pos2.z ), 5 ) ]); }; return R; };
    utility.xyz_latlng = function(P){ return { lt: Math.atan2(P.z, Math.sqrt(P.x * P.x + P.y * P.y)), ln: Math.atan2(P.y, P.x) };};
    utility.latlng_xyz = function(lt,ln,R){ return { x:R*(Math.cos(lt)*Math.cos(ln)), y:R*(Math.cos(lt)*Math.sin(ln)), z:R*Math.sin(lt) } };

    utility.checkRadRange = function ( slave, master, R) {
      var _S = utility.radNormal( slave );
      var _M = utility.radNormal( master );
      if( _S > _M + Math.PI ){ _M = Math.PI*2 + _M; } else if( _M > _S + Math.PI){ _S = Math.PI*2 + _S; }
      var H = R / 2;
      if ( _S - H < _M && _S + H > _M ) { return { s: _S, m: _M }; } else { return false; }
    };

  };
})();