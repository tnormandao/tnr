// Nanny is watching you! 0_0

var tnr = tnr || {};
var tnr.nanny = tnr.nanny || new function(){

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

      _NannySession.Replay = {
        storage: [],
        temp: { q: false, t: false, p:false },
        setTemp: function(){
          _NannySession.Replay.temp.t = new Date().getTime();
          _NannySession.Replay.temp.q = [
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

      _NannySession.getData = function(){
        var response = {
          zones: {
            threejs: {
              time: Math.round( _NannySession.Zone.storage[0].timeInSec()),
              transitions: _NannySession.Zone.storage[0].transitions,
              distance: Math.round( (_NannySession.Zone.storage[0].mousedistance + _NannySession.Zone.storage[0].touchdistance) )
            },
            map: {
              time: Math.round(_NannySession.Zone.storage[1].timeInSec()),
              transitions: _NannySession.Zone.storage[1].transitions,
              distance: Math.round( (_NannySession.Zone.storage[1].mousedistance + _NannySession.Zone.storage[1].touchdistance) )
            },
            slider: {
              time: Math.round(_NannySession.Zone.storage[2].timeInSec()),
              transitions: _NannySession.Zone.storage[2].transitions,
              distance: Math.round( (_NannySession.Zone.storage[2].mousedistance + _NannySession.Zone.storage[2].touchdistance) )
            }
          }
        };
        return response;
      };

      _NannySession.getAllState = function(){

        var allState = {
          zones: []
        };

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

        // _.each( _NannySession.Point.storage, function( obj ){
        //   allState.points.push({
        //     name: obj.name,
        //     type: obj.type,
        //     time: obj.time,
        //     index: obj.index,
        //     roomType: obj.Marker.roomType,
        //     timeCreate: obj.timeCreate,
        //     timeHistory: obj.timeHistory,
        //     transitionsFloor: obj.transitionsFloor,
        //     mousedistance: obj.mousedistance,
        //     mousedrag: obj.mousedrag,
        //     touchdistance: obj.touchdistance
        //   });
        // });

        // _.each( _NannySession.Orientation.storage, function( obj ){
        //   allState.orientations.push({
        //     name: obj.name,
        //     type: obj.type,
        //     timeCreate: obj.timeCreate,
        //     timeHistory: obj.timeHistory,
        //     time: obj.time
        //   });
        // });

        // _.each( _NannySession.Mode.storage, function( obj ){
        //   allState.modes.push({
        //     name: obj.name,
        //     type: obj.type,
        //     timeCreate: obj.timeCreate,
        //     timeHistory: obj.timeHistory,
        //     time: obj.time
        //   });
        // });

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

      _NannySession.onFrame = function(){
        if(paused){ return }

        _NannySession.time.frame++;
        if(_NannySession.time.current != 0){ _NannySession.time.previous = _NannySession.time.current; }
        _NannySession.time.current = new Date().getTime();
        if(0 != _NannySession.time.previous){ _NannySession.time.gap = _NannySession.time.fromStamp( _NannySession.time.previous ); }

        _NannySession.Zone.active.time += _NannySession.time.gap;

        if(_NannySession.heatmapPoint && (_NannySession.time.frame % 20 == 0)){
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

      var render = true;
      _NannySession.renderStat = function(){
        if(!render || !options.statContainer ){return}

        var St = _NannySession.getData();

        $('#stat_transition_total').html( St.zones.threejs.transitions + St.zones.map.transitions + St.zones.slider.transitions );
        $('#stat_transition_threejs').html(St.zones.threejs.transitions);
        $('#stat_transition_map').html(St.zones.map.transitions);
        $('#stat_transition_slider').html(St.zones.slider.transitions);

        $('#stat_distance_total').html( St.zones.threejs.distance + St.zones.map.distance + St.zones.slider.distance );
        $('#stat_distance_threejs').html(St.zones.threejs.distance);
        $('#stat_distance_map').html(St.zones.map.distance);
        $('#stat_distance_slider').html(St.zones.slider.distance);

        var fullTime = Math.round( _NannySession.time.total() / 1000 );
        var sec = fullTime % 60;
        var min = (fullTime - sec > 0) ? ((fullTime- sec)/60) : 0;

        $('#stat_time_Zthreejs').html( St.zones.threejs.time);
        $('#stat_time_Zmap').html( St.zones.map.time);
        $('#stat_time_zSlider').html( St.zones.slider.time);

        $('#stat_time_total').html( 'm: ' + min + ' s: ' + sec );
        $('#stat_time_3d').html(St.modes.default.time);
        $('#stat_time_fullscreen').html(St.modes.fullscreen.time);
        $('#stat_time_virtualreality').html(St.modes.virtualReality.time);

        // $('#'+options.statContainer).html( dZones );
      };

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

    // Statistics Object
    Nanny.StatisticResult = function(){
      var _NannyStatResult = this;

      _NannyStatResult.query = { filterType: '', filterId:   '' };
      _NannyStatResult.storage = {};
      _NannyStatResult.history = {};

      _NannyStatResult.getFromLocalStorage = function(UID){
          var str = localStorage.getItem(UID);
          if( str ){
           _NannyStatResult.storage = JSON.parse( str );
          
           _NannyStatResult.Zone = _NannyStatResult.storage.state.zones;
           _NannyStatResult.Point = _NannyStatResult.storage.state.points;
           _NannyStatResult.Mode = _NannyStatResult.storage.state.modes;
           _NannyStatResult.Orientation = _NannyStatResult.storage.state.orientations;
          
           _NannyStatResult.time = _NannyStatResult.storage.time;
           _NannyStatResult.distance = _NannyStatResult.storage.distance;
          }
      };

      _NannyStatResult.presetFromStorage = function( UID ){
        if( UID in _NannyStatResult.StatisticsCollection ){

          //console.log( UID, _NannyStatResult.StatisticsCollection  );

          _NannyStatResult.storage = _NannyStatResult.StatisticsCollection[UID].value;

          _NannyStatResult.Zone = _NannyStatResult.storage.state.zones;

          _NannyStatResult.time = _NannyStatResult.storage.time;
          _NannyStatResult.distance = _NannyStatResult.storage.distance;

        }
      };



      _NannyStatResult.activeHistory = '';

      _NannyStatResult.activeHistoryA = function(){
        return _NannyStatResult.activeHistory.split('_');
      };

      _NannyStatResult.activeHistoryName = function(UID){
        var _stat = _NannyStatResult.StatisticsCollection.getByUID( UID );
        if(!_stat) return false;
        return _stat.tourname;
      };

      _NannyStatResult.activeHistoryH = function(){
        var arr = _NannyStatResult.activeHistory.split('_');
        return arr[1] + ' ' + arr[2];
      };

      var StatisticsCollection = function( userStatistic ){
        var self = this;

        //_.each( userStatistic, function( _singleStatistic ){
        //  self[ _singleStatistic._id ] = {
        //    user:     _singleStatistic.user,
        //    value:    _singleStatistic.value,
        //    uid:      _singleStatistic._id,
        //    scene:    _singleStatistic.apartment,
        //    created:  _singleStatistic.created,
        //    time: self.getReadebleTime(_singleStatistic.created)
        //  };
        //});
        /*
         for( var A in localStorage ){
         var el = A.split('_');
         if(el[0] && el[0] == 'TourSession'){
         _NannyStatResult.StatisticsCollection.push({
         uid: A,
         scene: el[1],
         tourname: '<b>' + el[1] + '</b> <small>' + el[2] + '</small >'
         });
         }
         }
         */
      };
      StatisticsCollection.prototype.getReadebleTime = function( data ){
        var now = new Date( data );
        return now.getUTCFullYear() +'-'+ now.getUTCMonth() +'-'+ now.getUTCDate() +' '+ now.getUTCHours() +':'+ now.getUTCMinutes() +':'+ now.getUTCSeconds();
      };
      StatisticsCollection.prototype.add = function(_Statistic ){
        this[ _Statistic.uid ] = _Statistic;
      };
      StatisticsCollection.prototype.getByUID = function( UID ){
        if( UID in this ){ return this[UID]; } else { return false; }
      };
      StatisticsCollection.prototype.remove = function( UID ){
        if( UID in this ){
          delete self[UID];
          return true;
        } else {
          return false;
        }
      };

      _NannyStatResult.StatisticsCollection = new StatisticsCollection();

      _NannyStatResult.getStorage = function( callback ){
        if( _NannyStatResult.query.filterType && _NannyStatResult.query.filterId ){
          var _query = {};
          _query[_NannyStatResult.query.filterType] = _NannyStatResult.query.filterId;
          //UserStatistic.query( _query, function(userStatistic) {
          //  _NannyStatResult.StatisticsCollection = new StatisticsCollection( userStatistic );
          //  callback( _NannyStatResult.StatisticsCollection );
          //});
        }
      };

      _NannyStatResult.compliteHistory = function( UID ){
        if(UID){ _NannyStatResult.activeHistory = UID; }
        if(_NannyStatResult.activeHistory != ''){
          _NannyStatResult.presetFromStorage( _NannyStatResult.activeHistory );
          //console.log( _NannyStatResult.storage );
          _NannyStatResult.history = Nanny.Utility.History.getHistory( _NannyStatResult.storage.state, _NannyStatResult.storage.time );
        }
      };

      _NannyStatResult.computeHistory = function( _history ){
        _NannyStatResult.presetFromStorage( _history );
        return Nanny.Utility.History.getHistory( _NannyStatResult.storage.state, _NannyStatResult.storage.time );
      };

      _NannyStatResult.constructReplayLine = function(){
        if(!_NannyStatResult.storage.replay){ return }
        var replayLine = [];

        for( var i = 0; i < _NannyStatResult.storage.replay.length; i++){
          var frameC = _NannyStatResult.storage.replay[i];
          var frameF = _NannyStatResult.storage.replay[i+1];

          replayLine.push(_NannyStatResult.storage.replay[i]);

          if(frameF){

            var Moment = new function(){
              this.t1 = frameC.t2;
              this.t2 = frameF.t1;
              this.q1 = frameC.q2;
              this.q2 = frameF.q1;
              this.p1 = frameC.p2;
              this.p2 = frameF.p1;
              this.tr = 0;
            };

            replayLine.push(Moment);
          }
        }
        return replayLine;
      };

      _NannyStatResult.replayLine = [];
      _NannyStatResult.prepareReplay = function(){
        _NannyStatResult.replayLine = _NannyStatResult.constructReplayLine();
      };

      _NannyStatResult.getStorage();
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

    Nanny.Utility.History.createData = function(obj){
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

    Nanny.Utility.History.getHistory = function( _state, _time ){

      var nZones = Nanny.Utility.History.getData( _state.zones );
      var fixTimeEnd = _time.end;

      // ZONES
      if(nZones.length == 1){
        nZones[0].duration = fixTimeEnd - _time.start;
      } else if (nZones.length == 2){
        nZones[0].duration = nZones[1].time - _time.start;
        nZones[1].duration = fixTimeEnd - nZones[1].time;
      } else if(nZones.length > 2){
        for(var i = 0; i < nZones.length; i++){
          if(i==0){
            nZones[0].duration = nZones[1].time - _time.start;
          } else if ( nZones[i+1] ){
            nZones[i].duration = nZones[i+1].time - nZones[i].time;
          } else {
            nZones[i].duration = fixTimeEnd - nZones[i].time;
          }
        }
      }

      var response = { zones: nZones };
      return response;
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
