var tnr = tnr || {};
(function(){
  tnr.timeseeker = function( ManagerName ){
    var self = this;
    self.manager_name = 'timeseeker_' + ManagerName || 'timeseeker';
    self.timeGap = function( time1, time2 ){ return (time2 - time1) / 1000; };
    self.scope = [];
    self.start = function(name){ self.scope = []; self.add(name); };
    self.add = function(name){ self.scope.push({ time: new Date().getTime(), name: name ? name : 'empty' }); };
    self.show = function(){
      if(self.scope.length == 0){return false;}
      var startTime = self.scope[0].time;
      for(var i = 0; i < self.scope.length; i++){
        var previousTime = (i === 0) ? startTime : self.scope[i-1].time;
        console.log( self.manager_name + ': ' + self.scope[i].name, self.timeGap( previousTime, self.scope[i].time )+' s' );
      };
    };
    self.total = function(){
      console.log( self.manager_name + ': loading for ', self.timeGap( self.scope[0].time, self.scope[ self.scope.length-1 ].time )+' s' );
    }
  };
})();