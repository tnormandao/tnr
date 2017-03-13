var CanvasGifPlayer = (function(){

  //****************************************************************************
  //
  //
  //    GifParserCode
  //
  //    https://github.com/shachaf/jsgif
  //
  //****************************************************************************

  // Generic functions
  var bitsToNum = function(ba) {
    return ba.reduce(function(s, n) { return s * 2 + n; }, 0);
  };

  var byteToBitArr = function(bite) {
    var a = [];
    for (var i = 7; i >= 0; i--) {
      a.push(!!(bite & (1 << i)));
    }
    return a;
  };

// Stream
  /**
   * @constructor
   */ // Make compiler happy.
  var Stream = function(data) {
    this.data = data;
    this.len = this.data.length;
    this.pos = 0;

    this.readByte = function() {
      if (this.pos >= this.data.length) {
        throw new Error('Attempted to read past end of stream.');
      }
      return data.charCodeAt(this.pos++) & 0xFF;
    };

    this.readBytes = function(n) {
      var bytes = [];
      for (var i = 0; i < n; i++) {
        bytes.push(this.readByte());
      }
      return bytes;
    };

    this.read = function(n) {
      var s = '';
      for (var i = 0; i < n; i++) {
        s += String.fromCharCode(this.readByte());
      }
      return s;
    };

    this.readUnsigned = function() { // Little-endian.
      var a = this.readBytes(2);
      return (a[1] << 8) + a[0];
    };
  };

  var lzwDecode = function(minCodeSize, data) {
    // TODO: Now that the GIF parser is a bit different, maybe this should get an array of bytes instead of a String?
    var pos = 0; // Maybe this streaming thing should be merged with the Stream?

    var readCode = function(size) {
      var code = 0;
      for (var i = 0; i < size; i++) {
        if (data.charCodeAt(pos >> 3) & (1 << (pos & 7))) {
          code |= 1 << i;
        }
        pos++;
      }
      return code;
    };

    var output = [];

    var clearCode = 1 << minCodeSize;
    var eoiCode = clearCode + 1;

    var codeSize = minCodeSize + 1;

    var dict = [];

    var clear = function() {
      dict = [];
      codeSize = minCodeSize + 1;
      for (var i = 0; i < clearCode; i++) {
        dict[i] = [i];
      }
      dict[clearCode] = [];
      dict[eoiCode] = null;

    };

    var code;
    var last;

    while (true) {
      last = code;
      code = readCode(codeSize);

      if (code === clearCode) {
        clear();
        continue;
      }
      if (code === eoiCode) break;

      if (code < dict.length) {
        if (last !== clearCode) {
          dict.push(dict[last].concat(dict[code][0]));
        }
      } else {
        if (code !== dict.length) throw new Error('Invalid LZW code.');
        dict.push(dict[last].concat(dict[last][0]));
      }
      output.push.apply(output, dict[code]);

      if (dict.length === (1 << codeSize) && codeSize < 12) {
        // If we're at the last code and codeSize is 12, the next code will be a clearCode, and it'll be 12 bits long.
        codeSize++;
      }
    }

    // I don't know if this is technically an error, but some GIFs do it.
    //if (Math.ceil(pos / 8) !== data.length) throw new Error('Extraneous LZW bytes.');
    return output;
  };

// The actual parsing; returns an object with properties.
  var parseGIF = function( st, handler) {

    handler || (handler = {});

    // LZW (GIF-specific)
    var parseCT = function(entries) { // Each entry is 3 bytes, for RGB.
      var ct = [];
      for (var i = 0; i < entries; i++) {
        ct.push(st.readBytes(3));
      }
      return ct;
    };

    var readSubBlocks = function() {
      var size, data;
      data = '';
      do {
        size = st.readByte();
        data += st.read(size);
      } while (size !== 0);
      return data;
    };

    var parseHeader = function() {
      var hdr = {};
      hdr.sig = st.read(3);
      hdr.ver = st.read(3);
      if (hdr.sig !== 'GIF') throw new Error('Not a GIF file.'); // XXX: This should probably be handled more nicely.

      hdr.width = st.readUnsigned();
      hdr.height = st.readUnsigned();

      var bits = byteToBitArr(st.readByte());
      hdr.gctFlag = bits.shift();
      hdr.colorRes = bitsToNum(bits.splice(0, 3));
      hdr.sorted = bits.shift();
      hdr.gctSize = bitsToNum(bits.splice(0, 3));

      hdr.bgColor = st.readByte();
      hdr.pixelAspectRatio = st.readByte(); // if not 0, aspectRatio = (pixelAspectRatio + 15) / 64

      if (hdr.gctFlag) {
        hdr.gct = parseCT(1 << (hdr.gctSize + 1));
      }
      handler.hdr && handler.hdr(hdr);
    };

    var parseExt = function(block) {
      var parseGCExt = function(block) {
        var blockSize = st.readByte(); // Always 4

        var bits = byteToBitArr(st.readByte());
        block.reserved = bits.splice(0, 3); // Reserved; should be 000.
        block.disposalMethod = bitsToNum(bits.splice(0, 3));
        block.userInput = bits.shift();
        block.transparencyGiven = bits.shift();

        block.delayTime = st.readUnsigned();

        block.transparencyIndex = st.readByte();

        block.terminator = st.readByte();

        handler.gce && handler.gce(block);
      };

      var parseComExt = function(block) {
        block.comment = readSubBlocks();
        handler.com && handler.com(block);
      };

      var parsePTExt = function(block) {
        // No one *ever* uses this. If you use it, deal with parsing it yourself.
        var blockSize = st.readByte(); // Always 12
        block.ptHeader = st.readBytes(12);
        block.ptData = readSubBlocks();
        handler.pte && handler.pte(block);
      };

      var parseAppExt = function(block) {
        var parseNetscapeExt = function(block) {
          var blockSize = st.readByte(); // Always 3
          block.unknown = st.readByte(); // ??? Always 1? What is this?
          block.iterations = st.readUnsigned();
          block.terminator = st.readByte();
          handler.app && handler.app.NETSCAPE && handler.app.NETSCAPE(block);
        };

        var parseUnknownAppExt = function(block) {
          block.appData = readSubBlocks();
          // FIXME: This won't work if a handler wants to match on any identifier.
          handler.app && handler.app[block.identifier] && handler.app[block.identifier](block);
        };

        var blockSize = st.readByte(); // Always 11
        block.identifier = st.read(8);
        block.authCode = st.read(3);
        switch (block.identifier) {
          case 'NETSCAPE':
            parseNetscapeExt(block);
            break;
          default:
            parseUnknownAppExt(block);
            break;
        }
      };

      var parseUnknownExt = function(block) {
        block.data = readSubBlocks();
        handler.unknown && handler.unknown(block);
      };

      block.label = st.readByte();
      switch (block.label) {
        case 0xF9:
          block.extType = 'gce';
          parseGCExt(block);
          break;
        case 0xFE:
          block.extType = 'com';
          parseComExt(block);
          break;
        case 0x01:
          block.extType = 'pte';
          parsePTExt(block);
          break;
        case 0xFF:
          block.extType = 'app';
          parseAppExt(block);
          break;
        default:
          block.extType = 'unknown';
          parseUnknownExt(block);
          break;
      }
    };

    var parseImg = function(img) {
      var deinterlace = function(pixels, width) {
        // Of course this defeats the purpose of interlacing. And it's *probably*
        // the least efficient way it's ever been implemented. But nevertheless...

        var newPixels = new Array(pixels.length);
        var rows = pixels.length / width;
        var cpRow = function(toRow, fromRow) {
          var fromPixels = pixels.slice(fromRow * width, (fromRow + 1) * width);
          newPixels.splice.apply(newPixels, [toRow * width, width].concat(fromPixels));
        };

        // See appendix E.
        var offsets = [0,4,2,1];
        var steps   = [8,8,4,2];

        var fromRow = 0;
        for (var pass = 0; pass < 4; pass++) {
          for (var toRow = offsets[pass]; toRow < rows; toRow += steps[pass]) {
            cpRow(toRow, fromRow)
            fromRow++;
          }
        }

        return newPixels;
      };

      img.leftPos = st.readUnsigned();
      img.topPos = st.readUnsigned();
      img.width = st.readUnsigned();
      img.height = st.readUnsigned();

      var bits = byteToBitArr(st.readByte());
      img.lctFlag = bits.shift();
      img.interlaced = bits.shift();
      img.sorted = bits.shift();
      img.reserved = bits.splice(0, 2);
      img.lctSize = bitsToNum(bits.splice(0, 3));

      if (img.lctFlag) {
        img.lct = parseCT(1 << (img.lctSize + 1));
      }

      img.lzwMinCodeSize = st.readByte();

      var lzwData = readSubBlocks();

      img.pixels = lzwDecode(img.lzwMinCodeSize, lzwData);

      if (img.interlaced) { // Move
        img.pixels = deinterlace(img.pixels, img.width);
      }

      handler.img && handler.img(img);
    };

    var parseBlock = function() {
      var block = {};
      block.sentinel = st.readByte();

      switch (String.fromCharCode(block.sentinel)) { // For ease of matching
        case '!':
          block.type = 'ext';
          parseExt(block);
          break;
        case ',':
          block.type = 'img';
          parseImg(block);
          break;
        case ';':
          block.type = 'eof';
          handler.eof && handler.eof(block);
          break;
        default:
          throw new Error('Unknown block: 0x' + block.sentinel.toString(16)); // TODO: Pad this with a 0.
      }

      if (block.type !== 'eof') setTimeout(parseBlock, 0);
    };

    var parse = function() {
      parseHeader();
      setTimeout(parseBlock, 0);
    };

    parse();
  };

  // GifParser End

  //****************************************************************************
  //
  //
  //    CanvasGifPlayer Code
  //
  //
  //****************************************************************************

  //******************************************************
  //
  //   Frame

  var Frame = (function(){

    function Frame( options ){
      this.player = options.player;
      this.id = options.id;
      this.ext = {};
      this.img = {};

    }

    Frame.prototype.addOptions = function( option ){
        if( option.type === 'ext' ){
            this.ext = option;
        } else if(  option.type === 'img'  ){
          this.img = option;
          this.init();
        }
    };

    Frame.prototype.init = function(){
      var can = this.can = document.createElement( 'canvas' );
          can.width = this.img.width;
          can.height = this.img.height;
      var ctx = can.getContext('2d', { alpha: true });
      var imgData=ctx.getImageData( 0, 0, can.width, can.height );
      var pixel = 0;
      var colorsConfig = this.img.lctFlag ? this.img.lct : this.player.config.gct;
      for( var i = 0; i < imgData.data.length; i+=4 ){
        if( this.ext.transparencyGiven && ( this.img.pixels[ pixel ] === this.ext.transparencyIndex) ){
          imgData.data[i] =  255;
          imgData.data[i+1] =  255;
          imgData.data[i+2] =  255;
          imgData.data[i+3] = 0;
        } else {
          imgData.data[i]   =  colorsConfig[ this.img.pixels[ pixel ] ][0];
          imgData.data[i+1] =  colorsConfig[ this.img.pixels[ pixel ] ][1];
          imgData.data[i+2] =  colorsConfig[ this.img.pixels[ pixel ] ][2];
          imgData.data[i+3] = 255;
        }
        pixel++;
      }
      ctx.putImageData( imgData, 0, 0 );
      this.can = this.id > 0 ? this.drawOnCan( this.copyCanvas( this.player.frames[ this.id-1 ].can ), this.can, true ) : this.can;
      if(!this.player.debug){
        this.img.pixels = [];
      }
    };

    Frame.prototype.drawOnCan = function( source, toDraw, byConfig ){
        if( byConfig ){
          source.getContext('2d').drawImage(
              toDraw,
              this.img.leftPos, this.img.topPos,
              toDraw.width, toDraw.height
          );
        } else {
          source.getContext('2d').drawImage(
              toDraw,
              0,0,
              source.width, source.height
          );
        }

        return source;
    };

    Frame.prototype.copyCanvas = function( canToCopy ){
        var can = document.createElement( 'canvas' );
        can.width = canToCopy.width;
        can.height = canToCopy.height;
        can.getContext('2d').drawImage( canToCopy, 0, 0 );
      return can;
    };

    return Frame;
  })();



  //************************************************************
  //
  // Player

  function CanvasGifPlayer( src, debug ){
    var self = this, options;

    if( typeof src === 'string' ){
      options = {
        src: src,
        file: false
      };
    }

    if( src instanceof File ){
      options = {
        src: src,
        file: true
      };
    }

    if( !options.src ) {
      throw 'Source is undefined!';
      return false;
    }

    this.debug = debug;

    this.src = options.src;
    this.file = options.file ? true : false;

    this.frames = [];

    this.nextDelay = 0;
    this.playerFrame = null;
    this.playerStatus = 'paused'; // [ paused, play ]
    this.playerDirection = 'forward'; // [ forward, backward ]
    this.renderFlag = true; // [ true, false ]
    this.playerTimeout = false;

    this.speedAlpha = 1;

    this.config = {};
    this.parseStory = [];

    this.can = document.createElement('canvas');
    this.ctx = null;

    this.renderUpdated = function(){};

    this.init();

  }

  CanvasGifPlayer.prototype.onConvertationEnd = function(){
    var self = this;
    console.log(' Canvas-Gif player is ready:', self );
    this.play();
    //document.body.appendChild( self.can );
  };

  CanvasGifPlayer.prototype.setSpeed = function( speedAlpha ){
      this.speedAlpha = speedAlpha || 1;
  };

  CanvasGifPlayer.prototype.stop = function(){
    this.clearTimeout();
    this.playerStatus = 'paused';
  };

  CanvasGifPlayer.prototype.play = function(){
      this.playerStatus = 'play';
      this.playNext();
  };

  CanvasGifPlayer.prototype.toggleDirection = function(){
      if( this.playerDirection === 'forward' ){
        this.playerDirection = 'backward';
      } else {
        this.playerDirection = 'forward'
      }
  };

  CanvasGifPlayer.prototype.toggleRenderFlag = function( state /* 0 == false / 1 == true / none == toggle state */ ){
    if( state === 0 ){
      this.renderFlag = false;
    } else if( state === 1 ){
      this.renderFlag = true;
    } else {
      this.renderFlag = !this.renderFlag;
    }
  };

  CanvasGifPlayer.prototype.playNext = function(){
      var self = this;
      if( this.playerStatus === 'play' ){
        this.clearTimeout();
        if( !this.playerFrame )   this.playerFrame = this.frames[0];

        //console.log('test', this.playerFrame.id);

        if( this.renderFlag ) this.render();

        if(this.playerDirection === 'forward'){
          this.playerFrame = (this.frames[ this.playerFrame.id+1 ]) ? this.frames[ this.playerFrame.id+1 ] : this.frames[ 0 ];
        } else if(this.playerDirection === 'backward'){
          this.playerFrame = (this.frames[ this.playerFrame.id-1 ]) ? this.frames[ this.playerFrame.id-1 ] : this.frames[ this.frames.length-1 ];
        }

        this.playerTimeout = setTimeout(function(){
          self.playNext();
        }, this.playerFrame.ext.delayTime*10/this.speedAlpha );

      }
  };

  CanvasGifPlayer.prototype.nextFrame = function( stopFlag ){
    this.clearTimeout();
    this.playerFrame = (this.frames[ this.playerFrame.id+1 ]) ? this.frames[ this.playerFrame.id+1 ] : this.frames[ 0 ];
    if(stopFlag){
      this.playerStatus === 'paused';
      this.render();
    } else {
      this.playNext();
    }
  };

  CanvasGifPlayer.prototype.prevFrame = function( stopFlag ){
    this.clearTimeout();
    this.playerFrame = (this.frames[ this.playerFrame.id-1 ]) ? this.frames[ this.playerFrame.id-1 ] : this.frames[ this.frames.length-1 ];
    if(stopFlag){
      this.playerStatus === 'paused';
      this.render();
    } else {
      this.playNext();
    }
  };

  CanvasGifPlayer.prototype.byAlpha = function( alpha ){
    this.clearTimeout();
    this.playerFrame = this.frames[ Math.floor( (this.frames.length-1) * alpha) ];
    this.playerStatus === 'paused';
    this.render();
  };

  CanvasGifPlayer.prototype.clearTimeout = function(){
    if( this.playerTimeout )  clearTimeout( this.playerTimeout );
  };

  CanvasGifPlayer.prototype.render = function(){
      this.ctx.drawImage( this.playerFrame.can, 0, 0 );
      this.renderUpdated();
  };

  CanvasGifPlayer.prototype.processParseResult = function( data ){
    var self = this;
    if(this.debug) this.parseStory.push( data );
    if( data.type == 'eof' ){
      self.onConvertationEnd();
    } else if( data.type == 'ext' ){
      if( data.extType == 'gce' ){
        var nextFrame = new Frame({
          id: self.frames.length,
          player: self
        });
        self.frames.push( nextFrame );
        self.frames[ self.frames.length-1 ].addOptions( data );
      } else if( data.extType == 'app' ){
        self.netscape = data;
      }
    } else if( data.type == 'img' ) {
      self.frames[ self.frames.length-1 ].addOptions( data );
    }
  };

  CanvasGifPlayer.prototype.presetConfig = function( config ){
    this.config = config;
    this.can.width = this.config.width;
    this.can.height = this.config.height;
    this.ctx = this.can.getContext('2d');
  };

  CanvasGifPlayer.prototype.init = function(){
    var self = this;
    this.convertFileToDataURLviaFileReader( this.src, function( resultData ){
      var handler = {
        hdr: function(hdr) {
          self.presetConfig( hdr );
        },
        img: function(img) {
          self.processParseResult( img );
        },
        gce: function(gce) {
          self.processParseResult( gce );
        },
        com: function( com ){
          self.processParseResult( com );
        },
        app: {
          NETSCAPE: function(block) {
            self.processParseResult( block );
          },
          unknown: function(block) {
            self.processParseResult( block );
          }
        },
        eof: function(eof) {
          self.processParseResult( eof );
        }
      };
      parseGIF( new Stream( resultData ), handler );
    });
  };

  CanvasGifPlayer.prototype.convertFileToDataURLviaFileReader = function( url, callback ) {

    if( this.file ){
      var reader = new FileReader();
      reader.onloadend = function() {
        callback(reader.result);
      };
      reader.readAsBinaryString( this.src );
    } else {
      var xhr = new XMLHttpRequest();
      xhr.onload = function() {
        var reader = new FileReader();
        reader.onloadend = function() {
          callback(reader.result);
        };
        reader.readAsBinaryString( xhr.response );
      };
      xhr.crossOrigin = 'anonymous';
      //xhr.withCredentials = true;
      xhr.open('GET', url, true );
      xhr.responseType = 'blob';
      xhr.send();
    }
  };

  return CanvasGifPlayer;

})();
