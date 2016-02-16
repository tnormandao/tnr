var tnr = tnr || {};
(function(){
  tnr.Instruction = function( i1, i2 ){var S = this; S.constructor = tnr.Instruction; S._S = [];if ( i1 && i2 && typeof i1 == 'string' && typeof i2 == 'function') { S.add( i1, i2); } else if(i1 && !i2 && typeof i1 == 'function'){ S.add( i1 );}};
  tnr.Instruction.prototype.add = function(a1, a2){ var S = this, _S = this._S; if (a1 && !a2 && typeof a1 == 'function'){ _S.push( { n: 'f_'+_S.length, f: a1 } ); } else if ( a1 && a2 && typeof a1 == 'string' && typeof a2 == 'function') { _S.push( { n: a1, f: a2 } ); }};
  tnr.Instruction.prototype.set = function(a1, a2){ var S = this, _S = this._S; if ( a1 && a2 && typeof a1 == 'string' && typeof a2 == 'function') { var fo = false; if(_S.length > 0){ for(var i = 0; i < _S.length; i++){ if(_S[i].n == a1) {  _S[i] = { n: a1, f: a2 }; fo = true; } if( i == _S.length-1 && !fo){ S.add( a1, a2); } }} else { S.add( a1, a2); } } else if(a1 && !a2 && typeof a1 == 'function'){ S.add( a1 ); }};
  tnr.Instruction.prototype.get = function(n){ var S = this, _S = this._S; if(n){ for(var i = 0; i < _S.length; i++){ if(_S[i].n == n) {  return _S[i]; } } } else { return _S; } return false; };
  tnr.Instruction.prototype.run = function( t, ff, cb){   var S = this, _S = this._S; var t = t ? t : false, ff = ff ? ff : false; for(var i = 0; i < _S.length; i++){ if(!ff){ _S[i].f(t , _S[i].n ); } else { if( ff( _S[i].n, i) ){  _S[i].f( t , _S[i].n );  } } if(cb && i == _S.length-1){ cb(); } }};
  tnr.Instruction.prototype.clone = function(){ var S = new this.constructor; for(var i = 0; i < this._S.length; i++){ S._S.push(this._S[i]) } return S; };
  tnr.Instruction.prototype.drop = function(sF){var _S = this._S;if(sF){if(typeof sF == 'string'){for(var i = 0; i < _S.length; i++){ if(_S[i].n == sF) { _S.splice(i, 1); } }} else if(typeof sF == 'function'){for(var i = 0; i < _S.length; i++){ if(_S[i].f == sF) { _S.splice(i, 1); } }} } else { _S = []; }};
})();