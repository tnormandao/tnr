var tnr = tnr || {};
(function(){
  tnr.math = (function(){
    
    function Math(){};

    Math.toFix = function( n, fn ){ 
      return parseFloat( n.toFixed( fn ) ) 
    };
    
    Math.distance = function(X1,Y1,X2,Y2){ 
      return Math.sqrt( Math.abs(Math.pow( X2 - X1, 2)) + Math.abs(Math.pow( Y2 - Y1, 2)) ); 
    };
    
    Math.get_distance = function(p1,p2){ 
      var xd = p2.x-p1.x,
          yd = p2.y-p1.y,
          zd = ( p1.z && p2.z ) ? p2.z-p1.z : 0; 
      return Math.sqrt( xd*xd + yd*yd + zd*zd ); 
    };
    
    Math.toV2 = function(s, d){ 
      return Math.atan2( (d.y - s.y), (d.x - s.x) ); 
    };
    
    Math.toDegV2 = function(s, d){ 
      return (360 / (Math.PI*2) ) * ( Math.PI + Math.toV2(s, d) ) ; 
    };
    
    Math.radNormal = function(R){ 
      if( R < 0){ 
        R += Math.PI*2 
      } else if( R > Math.PI*2 ){
        R -= Math.PI*2
      } 
      return R;
    };
    
    Math.degNormal = function(D){ 
      if( D < 0){ 
        D += 360 
      } else if( D > 360 ){
        D -= 360
      } 
      return D; 
    };
    
    Math.sinBetween = function( m, c ) { 
      return Math.sin( ((1/m )*c) * Math.PI/2 ); 
    };
    
    Math.overCenter = function( X, Y, A, R ){ 
      return { 
        x: R*Math.sin(A)+X, 
        y: R*Math.cos(A)+Y 
      }; 
    };
    
    Math.get_direction = function(s,d){
      return Math.atan2((d.y-s.y),(d.x-s.x));
    };
    
    Math.positionLerp = function( c, m, p1, p2 ){ 
      var _l = p2 - p1, 
          s = _l / m, 
          p = (s * c) + p1; 
      return p;
    };
    
    Math.lerpV2 = function( num, x1, y1, x2, y2  ){ 
      var R=[]; 
      for( var _i = 0; _i < num; _i++){ 
        R.push([ 
          Math.toFix( Math.positionLerp( _i, num-1, x1, x2 ), 5 ),
          Math.toFix( Math.positionLerp( _i, num-1, y1, y2), 5 ) 
        ]); 
      }; 
      return R; 
    };
    
    Math.lerpV3 = function( num, pos1, pos2 ){ 
      var R = []; 
      for( var _i = 0; _i < num; _i++){ 
        R.push([ 
          Math.toFix( Math.positionLerp( _i, num-1, pos1.x, pos2.x ), 5 ), 
          Math.toFix( Math.positionLerp( _i, num-1, pos1.y, pos2.y ), 5 ), 
          Math.toFix( Math.positionLerp( _i, num-1, pos1.z, pos2.z ), 5 ) 
        ]); 
      }; 
      return R; 
    };
    
    Math.xyz_latlng = function(P){ 
      return { 
        lt: Math.atan2(P.z, Math.sqrt(P.x * P.x + P.y * P.y)), 
        ln: Math.atan2(P.y, P.x) 
      }
    };
    
    Math.latlng_xyz = function(lt,ln,R){ 
      return { 
        x:R*(Math.cos(lt)*Math.cos(ln)), 
        y:R*(Math.cos(lt)*Math.sin(ln)), 
        z:R*Math.sin(lt) 
      } 
    };
    
    Math.segmentCrossCircle = function( x, y, r, x01, y01, x02, y02 ){
        x01 -= x, y01 -= y, x02 -= x, y02 -= y;
        var dx = x02 - x01, dy = y02 - y01;
        var a = dx * dx + dy * dy, b = 2 * ( x01 * dx + y01 * dy ), c = x01 * x01 + y01 * y01 - r * r;
        if ( -b < 0 ) return ( c < 0 );
        if ( -b < ( 2 * a ) ) return ( 4 * a * c - b * b < 0);
        return ( a + b + c < 0 );
    };
    
    Math.checkRadRange = function ( slave, master, R) {
      var _S = Math.radNormal( slave );
      var _M = Math.radNormal( master );
      if( _S > _M + Math.PI ){ _M = Math.PI*2 + _M; } else if( _M > _S + Math.PI){ _S = Math.PI*2 + _S; }
      var H = R / 2;
      if ( _S - H < _M && _S + H > _M ) { return { s: _S, m: _M }; } else { return false; }
    };

    Math.pathInterpolation = function( points, a ){
        var point = false;
        function FN( PTS ){
            if( PTS.length > 1 ){
                var NP = [];
                for( var i = 1; i < PTS.length; i++ ){
                    NP.push( Math.lerpVectors( PTS[i-1], PTS[i], a ));
                }
                FN(NP);
            } else {
                point = PTS[0];
            }
        }
        FN( points );
        return point;
    };
    
    Math.lerpVectors = function( v1, v2, a ){
          return {
              x: v1.x + ((v2.x - v1.x) * a),
              y: v1.y + ((v2.y - v1.y) * a)
          };
    }
    
    Math.createMultiCurve = function ( pointslist, precision ){
            var result = [];
            for( let i = 0; i < precision; i++ ){
                result.push(  Math.pathInterpolation( pointslist, i/precision ) );
            }
            return result;
        };
    
    return Math;
  })();
})();
