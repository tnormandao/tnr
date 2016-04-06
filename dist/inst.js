        var Inst = function( i1, i2 ){
            var S = this;
            S.constructor = Inst;
            S._S = [];
            if ( i1 && i2 && typeof i1 == 'string' && typeof i2 == 'function') { S.add( i1, i2); } else if(i1 && !i2 && typeof i1 == 'function'){ S.add( i1 );}
        };
        Inst.prototype.add = function(a1, a2){ var S = this, _S = this._S; if (a1 && !a2 && typeof a1 == 'function'){ _S.push( { n: 'f_'+_S.length, f: a1 } ); } else if ( a1 && a2 && typeof a1 == 'string' && typeof a2 == 'function') { _S.push( { n: a1, f: a2 } ); }};
        Inst.prototype.set = function(a1, a2){ var S = this, _S = this._S; if ( a1 && a2 && typeof a1 == 'string' && typeof a2 == 'function') { var fo = false; if(_S.length > 0){ for(var i = 0; i < _S.length; i++){ if(_S[i].n == a1) {  _S[i] = { n: a1, f: a2 }; fo = true; } if( i == _S.length-1 && !fo){ S.add( a1, a2); } }} else { S.add( a1, a2); } } else if(a1 && !a2 && typeof a1 == 'function'){ S.add( a1 ); }};
        Inst.prototype.get = function(arg){
            var S = this, _S = this._S;
            var result = [];
            if(arg){
                var cell = (typeof arg == 'string') ? 'n' : 'f';
                for(var i = 0; i < _S.length; i++){
                    if(_S[i][cell] == arg) {
                        result.push( _S[i] );
                    }
                }
            } else {
                result = result.concat(_S);
            }
            return result;
        };
        Inst.prototype.drop = function(n){ var S = this, _S = this._S;if(n){var N = (typeof n == 'string') ? 'n' : 'f'; for(var i = 0; i < _S.length; i++){ if(_S[i][N] == n){_S.splice(i, 1); } }} else { _S = []; }};
        Inst.prototype.run = function( t, ff, cb){   var S = this, _S = this._S; var t = t ? t : false, ff = ff ? ff : false; for(var i = 0; i < _S.length; i++){ if(!ff){ _S[i].f(t , _S[i].n ); } else { if( ff( _S[i].n, i) ){  _S[i].f( t , _S[i].n );  } } if(cb && i == _S.length-1){ cb(); } }};
        Inst.prototype.clone = function(){ var S = new this.constructor; for(var i = 0; i < this._S.length; i++){ S._S.push(this._S[i]) } return S; };
