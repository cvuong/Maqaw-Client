var DATA_ENUMS = {
  SHARE_SCREEN: 0, 
  SHARE_SCREEN_OK: 1,
  SHARE_SCREEN_REFUSE: 2,
  SCREEN_DATA: 3,
  MOUSE_MOVE: 4,
  MOUSE_CLICK: 5,
  SCROLL: 6
}

function Mirror(options) {
  // stores connection object if exists
  this.conn = options && options.conn;
  this.base;
  this.mouseMirror;
}

Mirror.prototype.data = function(_data) {
  //
  // handle new data. For a new share screen
  // request, function opens a new mirror 
  // for all other requests, function passes 
  // data to mirrorScreen
  //
  switch(_data.request) {
    case DATA_ENUMS.SHARE_SCREEN: 
      // Request from peer to view this screen  
      this.conn.send({ type: 'SCREEN', request: DATA_ENUMS.SHARE_SCREEN_OK });
      this.shareScreen();
      break;
    case DATA_ENUMS.SHARE_SCREEN_OK:
      //  Share screen request received and 
      //  validated open a screen mirror 
      this.openMirror();
      break;
    case DATA_ENUMS.SCREEN_DATA:
      //  Screen Data.
    case DATA_ENUMS.MOUSE_MOVE:
      // Mouse move event
    case DATA_ENUMS.MOUSE_CLICK:
      // TODO: Trigger some sort of fake mouse click. (could be a UI event or something more complicated)
    case DATA_ENUMS.SCROLL:
      // TODO: Scroll mirror screen to reflect peer.
      this.mirrorScreen(_data);  
      break;
    default: 
      // Unknown
      break;
  }
}

Mirror.prototype.openMirror = function() {
  var _this = this;   
  this.mirrorDocument = window.open().document;

  this._mirror = new TreeMirror(this.mirrorDocument, {
    createElement: function(tagName) {
      if (tagName == 'SCRIPT') {
        var node = _this.mirrorDocument.createElement('NO-SCRIPT');
        node.style.display = 'none';
        return node;
      }

      if (tagName == 'HEAD') {
        var node = _this.mirrorDocument.createElement('HEAD');
        node.appendChild(_this.mirrorDocument.createElement('BASE'));
        node.firstChild.href = _this.base;
        return node;
      }
    }
  });
  
  this.mouseMirror = new MouseMirror(this.mirrorDocument, {
    mousemove: function(event) {
      _this.conn.send({ 
        type: 'SCREEN', 
        request: DATA_ENUMS.MOUSE_MOVE,
        coords: {x: event.pageX, y: event.pageY}
      });
    }, 
    click: function(event) {
      console.log("clicked"); 
    }
  }); 
}

Mirror.prototype.setConnection = function(conn) {
  // set a connection if established later
  this.conn = conn;
}

Mirror.prototype.requestScreen = function() {
  //
  //  Sends share screen request to peer
  //
  if (this.conn) {
    this.conn.send({ 
      type: 'SCREEN', 
      request: DATA_ENUMS.SHARE_SCREEN 
    });
  }
}

Mirror.prototype.shareScreen = function() {
  //
  // streams screen to peer
  // 
  var _this = this;

  if (this.conn) {

    this.conn.send({ 
      type: 'SCREEN',
      request: DATA_ENUMS.SCREEN_DATA,
      clear: true 
    });

    this.conn.send({ 
      type: 'SCREEN',
      request: DATA_ENUMS.SCREEN_DATA,
      base: location.href.match(/^(.*\/)[^\/]*$/)[1] 
    });

    var mirrorClient = new TreeMirrorClient(document, {

      initialize: function(rootId, children) {
        _this.conn.send({ 
          type: 'SCREEN',
          request: DATA_ENUMS.SCREEN_DATA,
          f: 'initialize',
          args: [rootId, children]
        });
      },

      applyChanged: function(removed, addedOrMoved, attributes, text) {
        _this.conn.send({
          type: 'SCREEN',
          request: DATA_ENUMS.SCREEN_DATA,
          f: 'applyChanged',
          args: [removed, addedOrMoved, attributes, text]
        });
      }
    });

    this.mouseMirror = new MouseMirror(document, {
      mousemove: function(event) {
        _this.conn.send({ 
          type: 'SCREEN', 
          request: DATA_ENUMS.MOUSE_MOVE,
          coords: {x: event.pageX, y: event.pageY}
        });
      }, 
      click: function(event) {
        console.log("clicked"); 
      }
    });
  
  } else {
    console.log("Error: Connection not established. Unable to stream screen");
  }
}

Mirror.prototype.mirrorScreen = function(data) {
  var _this = this;

  function clearPage() {
    // clear page //
    while (_this.mirrorDocument.firstChild) {
      _this.mirrorDocument.removeChild(_this.mirrorDocument.firstChild);
    }
  }

  function handleMessage(msg) {
    if (msg.clear)
      clearPage();
    else if (msg.base)
      _this.base = msg.base;
    else if (msg.request === DATA_ENUMS.SCREEN_DATA) 
      _this._mirror[msg.f].apply(_this._mirror, msg.args);
    else if (msg.request === DATA_ENUMS.MOUSE_MOVE || msg.request === DATA_ENUMS.MOUSE_CLICK)
      _this.mouseMirror.data(msg);
  }

  var msg = data;
  if (msg instanceof Array) {
    msg.forEach(function(subMessage) {
      handleMessage(JSON.parse(subMessage));
    });
  } else {
    handleMessage(msg);
  }
}

function MouseMirror(doc, options) {

  this.moveEvent = options.mousemove;
  this.clickEvent = options.click;
  this.doc = doc; 

  this.cursor = this.doc.createElement('div'); 
  this.cursor.style.width = '20px';
  this.cursor.style.height = '20px';
  this.cursor.style.backgroundColor = 'red';
  this.cursor.style.position = 'absolute';
  this.cursor.style.top = '0px';
  this.cursor.style.left = '0px';

  this.doc.addEventListener('mousemove', this.moveEvent, false); 
  this.doc.addEventListener('click', this.clickEvent, false);
  
  this.isDrawn = false;

  return this;
}

MouseMirror.prototype.data = function(_data) {

  if (!this.isDrawn) {
    //  Hack that appends cursor only  
    //  once a document.body exists
    if (this.doc.body) {
      this.doc.body.appendChild(this.cursor)
        this.isDrawn = true;
    }
  }

  if (_data.request === DATA_ENUMS.MOUSE_MOVE) {
    this.moveMouse(_data);
  } else if (_data.request === DATA_ENUMS.MOUSE_CLICK) {
    this.clickMouse(_data);
  } 
}

MouseMirror.prototype.moveMouse = function(_data) {
  this.cursor.style.top = _data.coords.y + 'px';
  this.cursor.style.left = _data.coords.x + 'px';
}

MouseMirror.prototype.clickMouse = function(_data) {
  // TODO: Click mouse or something
}

MouseMirror.prototype.off = function() {
  this.doc.removeEventListener('mousemove', this.moveEvent, false);
  this.doc.removeEventListener('click', this.clickEvent, false);
}
