var tnr = tnr || {};
(function(){
  tnr.lstorage = function( prefix ){
    var LS = this;
    LS.prefix = prefix+'_' || 'LS_';
    LS.result = function( _result, _count ){
      var Result = function( result, count ){
        var _R = this;
        _R.result = result || {};
        _R.count = count || 0;
      }
      Result.prototype.toJSON = function(){
        var _R = this;
        for(var Key in _R.result){
          _R.result[ Key ] = JSON.parse( _R.result[ Key ] );
        }
        return _R.result;
      }
      return new Result( _result, _count );
    };
  };

  tnr.lstorage.prototype.prefIn = function( str ){
    var LS = this;
    return LS.prefix+str;
  };
  tnr.lstorage.prototype.prefOut = function( str ){
    var LS = this;
    return str.replace( LS.prefix , '');
  };

  tnr.lstorage.prototype.set = function( SID, dataObj ){
    var LS = this;
    var data = dataObj; //JSON.stringify( dataObj );
    console.log(data);
    localStorage.setItem( LS.prefIn(SID), data );
  };

  tnr.lstorage.prototype.get = function( SID ){
    var LS = this;
    var ls_item = localStorage.getItem( LS.prefIn(SID) );
    console.log(ls_item);
    if(ls_item){
      return ls_item;
    } else {
      return false;
    }
  };

  tnr.lstorage.prototype.filter = function( str, callback ){
    var LS = this;
    var filtered = {};
    var count = 0;
    LS.list(function( key, val ){
      if( key.indexOf( str ) != -1 ){
        filtered[ key ] = val;
        count++;
      }
    });
    return LS.result( filtered, count ); //{ result: filtered, count: count }
  };

  tnr.lstorage.prototype.list = function( callback ){
    var LS = this;
    var LS_List = {};
    var count = 0;
    for( var Item in localStorage ){
      if( Item.indexOf(LS.prefix) == 0 ){
        if( callback ) callback( LS.prefOut( Item ), localStorage[Item] );
        LS_List[ LS.prefOut( Item ) ] = localStorage[Item];
        count++;
      }
    }
    return LS.result( LS_List, count );
  };

  tnr.lstorage.prototype.remove = function( SID ){
    var LS = this;
    var item = LS.get(SID);
    if( item ){
      localStorage.removeItem( LS.prefIn( SID ) );
    }
  };

})();