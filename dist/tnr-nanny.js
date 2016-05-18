

  // Nanny is watching you! 0_0
  var NANNY = new function(){

    var UID = function( prefix ){
      var p = prefix || 'uid_';
      var d = new Date().getTime();
      var uuid = 'xxxxxxyyxxyyxxxxxxxxyyyyxxxxyyxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(32);
      });
      return p+uuid.substring(0, 32);
    };


    var _ = _ || {
      each: function( obj, callback ){
          if(obj instanceof Array){
            for( var i = 0; i < obj.length; i++ ){ callback( obj[i], i, i ); }
          } else if( obj instanceof Object ){
            if( typeof obj == 'object'){
                var keys = Object.keys( obj );
                for(var i = 0; i < keys.length; i++ ){
                    callback( obj[ keys[ i ] ], i, keys[ i ] );
                }
            } else {
              console.warn('not object or array')
            }
          } else {
            console.warn('not object or array');
          }
      }
    }

    var App = {};

    var Nanny = this;
    Nanny.deepGet = function( obj, key ){ var K=key.split('.'),V=obj; for( var _i = 0; _i < K.length; _i++ ){var I=K[_i];if(V[I]||V[I]===0){V=V[I]}else{V=false;}}return V;};

    Nanny.Instruction = function( i1, i2 ){ var S = this; S.constructor = Nanny.Instruction; S._S = []; if ( i1 && i2 && typeof i1 == 'string' && typeof i2 == 'function') { S.add( i1, i2); } else if(i1 && !i2 && typeof i1 == 'function'){ S.add( i1 );}};
    Nanny.Instruction.prototype.add = function(a1, a2){ var S = this, _S = this._S; if (a1 && !a2 && typeof a1 == 'function'){ _S.push( { n: 'f_'+_S.length, f: a1 } ); } else if ( a1 && a2 && typeof a1 == 'string' && typeof a2 == 'function') { _S.push( { n: a1, f: a2 } ); }};
    Nanny.Instruction.prototype.set = function(a1, a2){ var S = this, _S = this._S; if ( a1 && a2 && typeof a1 == 'string' && typeof a2 == 'function') { var fo = false; if(_S.length > 0){ for(var i = 0; i < _S.length; i++){ if(_S[i].n == a1) {  _S[i] = { n: a1, f: a2 }; fo = true; } if( i == _S.length-1 && !fo){ S.add( a1, a2); } }} else { S.add( a1, a2); } } else if(a1 && !a2 && typeof a1 == 'function'){ S.add( a1 ); } };
    Nanny.Instruction.prototype.get = function(n){ var S = this, _S = this._S; if(n){ for(var i = 0; i < _S.length; i++){ if(_S[i].n == n) {  return _S[i]; } } } else { return _S; } return false; };
    Nanny.Instruction.prototype.drop = function(n){ var S = this, _S = this._S;if(n){ var N = (typeof n == 'string') ? 'n' : 'f'; for(var i = 0; i < _S.length; i++){ if(_S[i][N] == n){_S.splice(i, 1); } }} else { _S = []; }};
    Nanny.Instruction.prototype.run = function( t, ff, cb){   var S = this, _S = this._S; var t = t ? t : false, ff = ff ? ff : false; for(var i = 0; i < _S.length; i++){ if(!ff){ _S[i].f(t , _S[i].n ); } else { if( ff( _S[i].n, i) ){  _S[i].f( t , _S[i].n );  } } if(cb && i == _S.length-1){ cb(); } }};
    Nanny.Instruction.prototype.clone = function(){ var S = new this.constructor; for(var i = 0; i < this._S.length; i++){ S._S.push(this._S[i]) } return S; };


    Nanny.session = function(options){

      var _NannySession = this;

      _NannySession.uid = UID('NannySession_');

      var options = options || {};
      options.zones = options.zones ? options.zones : [];
      options.statContainer = options.statContainer ? options.statContainer : false;

      // native Nanny animations
      _NannySession.animations = new Nanny.Instruction();


      _NannySession.animator = function(){
        _NannySession.animations.run();
        requestAnimationFrame(_NannySession.animator);
      };

      if( options.animated ){
        _NannySession.animator();
      };

      _NannySession.time = {
        start: new Date().getTime(),
        previous: 0,
        current: 0,
        gap: 0,
        frame: 0,
        total: function(){
          return ( _NannySession.time.current - _NannySession.time.start );
        },
        fromStamp: function(stamp){
          return _NannySession.time.current - stamp;
        }
      };

      //Zones
      _NannySession.Zone = {
        storage: [],
        active: false,
        last: false,
        toggle: function(obj){
          _NannySession.Zone.last = _NannySession.Zone.active;
          _NannySession.Zone.active = obj;
        },
        addTransition: function(){
          _NannySession.Zone.active.transitions++;
        },
        getData: function(){
          var tempArr = [];
          for( var i = 0; i < _NannySession.Zone.storage.length; i++){
            tempArr = tempArr.concat( _NannySession.Zone.storage[i].createData() );
          }
          tempArr.sort(function (a, b) {
            if (a.time < b.time) { return -1; }
            if (a.time > b.time) { return 1; }
            return 0;
          });
          return tempArr;
        },
        getZipData: function(){
          var tempArr = [];
          for( var i = 0; i < _NannySession.Zone.storage.length; i++){
            tempArr = tempArr.concat( _NannySession.Zone.storage[i].createZipData() );
          }
          tempArr.sort(function (a, b) {
            if (a.time < b.time) { return -1; }
            if (a.time > b.time) { return 1; }
            return 0;
          });
          return tempArr;
        },
        toChart: function(){
          var tempArr = [];
          _.each( _NannySession.Zone.storage, function( _obj ){
              tempArr.push({
                name: _obj.name,
                time: _obj.time,
                transitions: _obj.transitions,
                distance: Math.round( _obj.mousedrag + _obj.touchdistance),
                click: Math.round( _obj.mousereleased + _obj.touchreleased)
              });
          });
          return tempArr;
        },
        ini: function(){
          for( var i = 0; i < options.zones.length; i++){
            _NannySession.Zone.storage[i] = new Nanny.zone( options.zones[i], _NannySession.Zone );
          }
          _NannySession.Zone.active = _NannySession.Zone.storage[0];
          _NannySession.Zone.active.timeHistory.push( new Date().getTime() );
        }
      };
      _NannySession.Zone.ini();

      _NannySession.fixTo3 = function( num ){
        return  parseFloat(( num ).toFixed(3))
      };

      // Statistics complex info
      _NannySession.getHistory = function(){

        var _time = _NannySession.time;
        var fixTimeEnd = _NannySession.time.current;
        var fixTotal = _time.total();

        // ZONES
        var nZones = _NannySession.Zone.getData();
        if(nZones.length == 1){
          nZones[0].duration = fixTimeEnd - _time.start;
          nZones[0].percent = nZones[0].duration / fixTotal;
        } else if (nZones.length == 2){
          nZones[0].duration = nZones[1].time - _time.start;
          nZones[0].percent = nZones[0].duration / fixTotal;
          nZones[1].duration = fixTimeEnd - nZones[1].time;
          nZones[1].percent = nZones[1].duration / fixTotal;
        } else if(nZones.length > 2){
          for(var i = 0; i < nZones.length; i++){
            if(i==0){
              nZones[0].duration = nZones[1].time - _time.start;
              nZones[0].percent = nZones[0].duration / fixTotal;
            } else if ( nZones[i+1] ){
              nZones[i].duration = nZones[i+1].time - nZones[i].time;
              nZones[i].percent = nZones[i].duration / fixTotal;
            } else {
              nZones[i].duration = fixTimeEnd - nZones[i].time;
              nZones[i].percent = nZones[i].duration / fixTotal;
            }
          }
        }

        var response = {
          zones: nZones
        };
        return response;

      };

      _NannySession.getH = function(){

        var _time = _NannySession.time;
        var fTE = _NannySession.time.current;
        var fT = _time.total();

        // ZONES
        var NZ = _NannySession.Zone.getZipData();

        if(NZ.length == 1){
          NZ[0].dr = fTE - _time.start;
          NZ[0].pr = NZ[0].dr / fixTotal;
        } else if (NZ.length == 2){
          NZ[0].dr = NZ[1].tm - _time.start;
          NZ[0].pr = NZ[0].dr / fT;
          NZ[1].dr = fTE - NZ[1].tm;
          NZ[1].pr = NZ[1].dr / fT;
        } else if(NZ.length > 2){
          for(var i = 0; i < NZ.length; i++){
            if(i==0){
              NZ[0].dr = NZ[1].tm - _time.start;
              NZ[0].pr = NZ[0].dr / fT;
            } else if ( NZ[i+1] ){
              NZ[i].dr = NZ[i+1].tm - NZ[i].tm;
              NZ[i].pr = NZ[i].dr / fT;
            } else {
              NZ[i].dr = fTE - NZ[i].tm;
              NZ[i].pr = NZ[i].dr / fT;
            }
          }
        }

        var response = {
          z: NZ,
          h: _NannySession.heatmapGet(),
          t: _time
        };
        return response;

      };

      _NannySession.getAllState = function(){
        var allState = { zones: [] };
        _.each( _NannySession.Zone.storage, function( obj ){
          allState.zones.push({
            name: obj.name,
            type: obj.type,
            id: obj.id,
            timeCreate: obj.timeCreate,
            timeHistory: obj.timeHistory,
            time: obj.time,
            transitions: obj.transitions,
            mousedistance: obj.mousedistance,
            mousedrag: obj.mousedrag,
            mousereleased: obj.mousereleased,
            touchdistance: obj.touchdistance,
            touchreleased: obj.touchreleased
          });
        });

        return allState;
      };


      var paused = false;

      _NannySession.stop = function(){
        paused = true;
        for( var i = 0; i < options.zones.length; i++){
          _NannySession.Zone.storage[i].stop();
        }
      };

      _NannySession.play = function(){
        paused = false;
        for( var i = 0; i < options.zones.length; i++){
          _NannySession.Zone.storage[i].play();
        }
      };

      // PRESET MOUSE AND TOUCH EVENTS LISTENERS

      _NannySession.heatmapHistory = [];
      _NannySession.heatmapPoint = false;

      _NannySession.heatmapGet = function(){
        return _NannySession.heatmapHistory;
      };

      _NannySession.distance = {
        mousegap: 0,
        mousedistance: 0,
        mousedrag: 0,
        mousereleased: 0,
        touchgap: 0,
        touchdistance: 0,
        touchreleased: 0
      };

      _NannySession.element = document;

      var getDistance = function( X1, Y1, X2, Y2){
        return Math.sqrt( Math.abs(Math.pow( X2 - X1, 2)) + Math.abs(Math.pow( Y2 - Y1, 2)) );
      };

      // mouse Events
      _NannySession.element.addEventListener( 'mousemove', function( event ){
        if(paused){ return }
        //console.log(event);
        _NannySession.heatmapPoint = [ event.clientX, event.clientY ];
        var distance = getDistance( 0, 0, event.movementX, event.movementY );
        _NannySession.distance.mousedistance += distance;
        _NannySession.Zone.active.mousedistance += distance;
        if(event.which || event.buttons ){
          _NannySession.distance.mousedrag += distance;
          _NannySession.Zone.active.mousedrag += distance;
        }
      });

      _NannySession.element.addEventListener( 'mouseup', function( event ){
        if(paused){ return }
        _NannySession.distance.mousereleased++;
        _NannySession.Zone.active.mousereleased++;
      });

      // touch Events
      var touchstart, touchend;

      _NannySession.element.addEventListener( 'touchstart', function( event ){
        if(paused){ return }
        touchstart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
      });

      _NannySession.element.addEventListener( 'touchmove', function( event ){
        if(paused){ return }
        //console.log(event);
        _NannySession.heatmapPoint = [  event.touches[0].clientX, event.touches[0].clientY ];
        if(!touchstart){
          touchstart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
        }
        var distance = getDistance( touchstart.x, touchstart.y, event.touches[0].clientX, event.touches[0].clientY );
        _NannySession.distance.touchdistance += distance;
        _NannySession.Zone.active.touchdistance += distance;
        touchstart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
      });

      _NannySession.element.addEventListener( 'touchend', function( event ){
        if(paused){ return }
        touchend = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
        var distance = getDistance( touchstart.x, touchstart.y, touchend.x, touchend.y );
        _NannySession.distance.touchdistance += distance;
        _NannySession.Zone.active.touchdistance += distance;
        touchend = false;
        touchstart = false;
        _NannySession.distance.touchreleased++;
        _NannySession.Zone.active.touchreleased++;
      });

      // PRESET TIME AND ONFRAME EVENTS

      // TODO: repair Replay by heatmap
      _NannySession.Replay = {

        storage: [],

        temp: { q: false, t: false, p:false },

        setTemp: function(){
          _NannySession.Replay.temp.t = new Date().getTime();
          _NannySession.Replay.temp.p = [
            _NannySession.fixTo3(App.camera.quaternion.x),
            _NannySession.fixTo3(App.camera.quaternion.y),
            _NannySession.fixTo3(App.camera.quaternion.z),
            _NannySession.fixTo3(App.camera.quaternion.w)
          ];
          _NannySession.Replay.temp.p = App.Markers.active.pointIndex;
        },
        
        newMoment: function(){
          if(!_NannySession.Replay.temp.t){ return };
          var Moment = new function(){
            this.t1 = _NannySession.Replay.temp.t;
            this.t2 = _NannySession.time.current;
            this.q1 = _NannySession.Replay.temp.q;
            this.q2 = [
              _NannySession.fixTo3(App.camera.quaternion.x),
              _NannySession.fixTo3(App.camera.quaternion.y),
              _NannySession.fixTo3(App.camera.quaternion.z),
              _NannySession.fixTo3(App.camera.quaternion.w)
            ];
            this.p1 = _NannySession.Replay.temp.p;
            this.p2 = App.Markers.active.pointIndex;
            this.tr = this.p1 == this.p2 ? 0 : 1;
          };
          _NannySession.Replay.storage.push( Moment );
          _NannySession.Replay.temp = { q: false, t: false, p: false };
        }


      };

      _NannySession.onFrame = function(){
        if(paused){ return }

        _NannySession.time.frame++;
        if(_NannySession.time.current != 0){ _NannySession.time.previous = _NannySession.time.current; }
        _NannySession.time.current = new Date().getTime();
        if(0 != _NannySession.time.previous){ _NannySession.time.gap = _NannySession.time.fromStamp( _NannySession.time.previous ); }

        _NannySession.Zone.active.time += _NannySession.time.gap;

        if(_NannySession.heatmapPoint && (_NannySession.time.frame % 10 == 0)){
          _NannySession.heatmapHistory.push(_NannySession.heatmapPoint);
          _NannySession.heatmapPoint = false;
        }

        if( _NannySession.time.frame % 300 == 0){
          _NannySession.saveToStorage();
        }

      };

      _NannySession.animations.add(function(){ 
        _NannySession.onFrame(); 
      });

      //$( $window.location.pathname).trigger( 'change', function(){
      //  _NannySession.saveToStorage();
      //});
      window.onbeforeunload = function(){
        Nanny.Utility.saveToStorage( _NannySession );
      };

      _NannySession.saveToStorage = function(){
        Nanny.Utility.saveToStorage( _NannySession );
      };

    };

    Nanny.Utility = {};
    Nanny.Utility.sortByDuration = function( arr ){
      var tempArr = [];

      for( var i = 0; i < arr.length; i++ ){
        tempArr.push(arr[i]);
      }

      tempArr.sort(function (a, b) {
        if (a.time > b.time) { return -1; }
        if (a.time < b.time) { return 1; }
        return 0;
      });

      return tempArr;
    };

    Nanny.Utility.getHistoryInDOM = function( arr ){

      var hContainer = document.createElement('div');
      hContainer.classList.add('history_container');
      hContainer.setAttribute( "style", " position: relative ; width: 100%; height: 30px; " );

      for( var i = 0; i < arr.length; i++ ){
        var hItem = document.createElement('div');
        hItem.classList.add('history_item');
        hItem.setAttribute('title', arr[i].name );
        hItem.setAttribute( "style", " float: left; display: inline-block; border: 1px solid #ccc ; height: 100%; width: "+ ( 97 * arr[i].percent) +"% ;" );
        hContainer.appendChild( hItem );
      };

      return hContainer;
    };

    Nanny.Utility.saveToStorage = function( _NannySession ){
          var toStorage = {
            created: _NannySession.time.start,
            time: {
              start: _NannySession.time.start,
              end: _NannySession.time.current,
              total: _NannySession.time.total(),
              totalInSec: _NannySession.time.total() / 1000
            },
            distance: _NannySession.distance,
            heatmapHistory: _NannySession.heatmapHistory,
            history: _NannySession.getHistory(),
            view: {
              width: screen.width,
              height: screen.height
            }
          };
          localStorage.setItem( _NannySession.uid, JSON.stringify( toStorage ));
    }

    Nanny.Utility.History = {}

    Nanny.Utility.History.getData = function( arr ){
      var tempArr = [];
      for( var i = 0; i < arr.length; i++){
        var nextHistoryBlock = Nanny.Utility.History.createData( arr[i] );
        tempArr = tempArr.concat( nextHistoryBlock );
      }
      tempArr.sort(function (a, b) {
        if (a.time < b.time) { return -1; }
        if (a.time > b.time) { return 1; }
        return 0;
      });
      return tempArr;
    };

    Nanny.Utility.History.createData = function( obj ){
      var tempArr = [];
      for( var i = 0; i < obj.timeHistory.length; i++ ){
        var nextElement = {};
        nextElement.time = obj.timeHistory[i];
        nextElement.name = obj.name;
        nextElement.type = obj.type;
        if( 'index' in obj){
          nextElement.index = obj.index;
        };
        tempArr.push(nextElement);
      }
      return tempArr;
    };

    // Special class to look at the same zones
    Nanny.zone = function( DOMid, Zones ){
      var _zone = this;
      _zone.Zones = Zones;

      _zone.type = 'zone';
      _zone.name = DOMid ? DOMid : 'default';

      _zone.id = DOMid ? DOMid : 'empty';
      _zone.element = document.getElementById(DOMid);

      _zone.transitions = 0;

      _zone.timeCreate = new Date().getTime();
      _zone.timeHistory = [];
      _zone.time = 0;
      _zone.timeInSec = function(){
        return _zone.time / 1000;
      };

      _zone.mousedistance = 0;
      _zone.mousedrag = 0;
      _zone.mousereleased = 0;
      _zone.touchdistance = 0;
      _zone.touchreleased = 0;
      _zone.distance = function(){
        return Math.round(_zone.mousedistance + _zone.touchdistance);
      };
      _zone.drag = function(){
        return Math.round(_zone.mousedrag + _zone.touchdistance);
      };
      _zone.clickntouch = function(){
        return _zone.mousereleased + _zone.touchreleased;
      };

      var enable = function(){
        if( _zone.Zones.active == _zone ) { return; }
        if(_zone.Zones.toggle){ _zone.Zones.toggle(_zone); }
        _zone.timeHistory.push( new Date().getTime() );
      };

      var paused = false;
      _zone.stop = function(){ paused = true; };
      _zone.play = function(){ paused = false; };


      _zone.createZipData = function(){
        var tempArr = [];
        for( var i = 0; i < _zone.timeHistory.length; i++ ){
          tempArr.push({
            tm: _zone.timeHistory[i],
            nm: _zone.name,
            tp: _zone.type
          });
        }
        return tempArr;
      };

      _zone.createData = function(){
        var tempArr = [];
        for( var i = 0; i < _zone.timeHistory.length; i++ ){
          tempArr.push({
            time: _zone.timeHistory[i],
            name: _zone.name,
            type: _zone.type
          });
        }
        return tempArr;
      };

      if(_zone.element) {
        // mouse Events
        _zone.element.addEventListener('mouseenter', function (event) {
          if (paused)  return;
          
          enable();
        });
        // touch Events
        _zone.element.addEventListener('touchstart', function (event) {
          if (paused)  return; 

          enable();
        });
      }

    };


  };

//  return NANNY;
//}]);
