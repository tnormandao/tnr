var tnr = tnr || {};
(function(){
  tnr.fileloader = function( _selector, callback, readAs ){
    var exempleText = ' var myFileLoader = FileLoader("myInput", function(callback){ /* will run if file or files was loaded */ }, "readAsText" )';
    if(!_selector){ console.log('You must enter input.file ID, befor you can activete loader.' + '\n\n' + exempleText ); };
    if(!callback){ callback = function(){} };
    if(!readAs){ console.log("Please input third argument fileRider readAs mode  [ 'readAsText' / 'readAsDataURL' / 'readAsBinaryString' / 'readAsArrayBuffer' ]." + '\n\n' + exempleText ); };
    var Loader = this;
    Loader.input = false;
    Loader.handleFileSelect = function(){
      if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
        console.log('The File APIs are not fully supported in this browser.');
        return;
      }
      if (!Loader.input) { console.log(" !file element"); }
      else if (!Loader.input.files) { console.log("!browser not supporty `files` "); }
      else if (!Loader.input.files[0]) { console.log("Please select a file before clicking 'Load'");  }
      else if (!readAs) { console.log("Please input third argument fileRider readAs mode  [ 'readAsText' / 'readAsDataURL' / 'readAsBinaryString' / 'readAsArrayBuffer' ]");  }
      else {
        var fr = new FileReader();
        if(!(readAs in fr )){ console.log("Invalid FileReader mode. Please input third argument fileRider readAs mode  [ 'readAsText' / 'readAsDataURL' / 'readAsBinaryString' / 'readAsArrayBuffer' ]"); return; }
        var Length = Loader.input.files.length;
        var filesToLoad = Length;
        var results = [];
        function readFile( file, iterator ){
          var _fr = new FileReader();
          _fr[ readAs ]( file );
          _fr.onload = function(){
            file.file = _fr.result;
            file.num = iterator;
            results.push(file);
            filesToLoad--;
          };
        };
        for(var _i = 0, currentFile; currentFile = Loader.input.files[_i]; _i++ ){
          readFile( currentFile, _i );
        };
        var waiter = setInterval(function(){
          if( filesToLoad == 0 ){
            Loader.onLoad( results );
            clearInterval( waiter );
          }
        }, 10);
      }
    };
    Loader.onLoad = function( results ){
      callback( results );
    };
    Loader.setListener = function( selector ){
      if(Loader.input){ Loader.input.removeEventListener( 'change', Loader.handleFileSelect ); }
      Loader.selector = selector;
      Loader.input = document.getElementById( Loader.selector );
      Loader.input.addEventListener( 'change', Loader.handleFileSelect );
    };
    Loader.setListener( _selector );
    return Loader;
  };
})();