var DATA_ENUMS = {
  SHARE_SCREEN: 0, 
  SHARE_SCREEN_OK: 1,
  SHARE_SCREEN_REFUSE: 2,
  SCREEN_DATA: 3,
  MOUSE_MOVE: 4,
  MOUSE_CLICK: 5,
  SCROLL: 6,
  INPUT: 7,
  TEXT_AREA: 8,
  SELECT: 9
};

function Mirror(options) {
  // stores connection object if exists
  this.conn = options && options.conn;
  this.base;

  this.mirrorDocument;
  this.mirrorWindow;
  this.mouseMirror;

    // whether or not we are currently viewing our peer's screen
    this.isViewingScreen = false;
}

/*
 * Called when the connection to our peer is reset
 */
Mirror.prototype.connectionReset = function () {
   // if we were watching our peer's screen, tell that to start sending screen
   //data again
    if(this.mirrorWindow && !this.mirrorWindow.closed){
        this.requestScreen();
    }
};

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
      // Mouse click event
    case DATA_ENUMS.INPUT:
      // Interactions with input elements
    case DATA_ENUMS.SELECT:
      // Interactions with select elements
    case DATA_ENUMS.TEXT_AREA:
     // Interactions with textarea elements
      this.mirrorScreen(_data);  
      break;
    case DATA_ENUMS.SCROLL:
      this.mirrorWindow.scrollTo(_data.left, _data.top);
      break;
    default:
      // Unknown
      break;
  }
};

Mirror.prototype.openMirror = function() {
  var _this = this;

  // if we are already viewing the screen, don't open a new window
    if(!this.isViewingScreen) {
         this.mirrorWindow = window.open();
         this.mirrorDocument = this.mirrorWindow.document;

        // attach a listener for if the window is closed
        this.mirrorWindow.addEventListener('unload', function() {
            // TODO: implement me
            this.isViewingScreen = false;
        }, false);
    }

    this.isViewingScreen = true;


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
        _this.conn.send({
            type: 'SCREEN',
            request: DATA_ENUMS.MOUSE_CLICK,
            coords: {x: event.pageX, y: event.pageY},
            target: maqawGetNodeHierarchy(event.target)
        });
    }
  }); 
};

Mirror.prototype.setConnection = function(conn) {
  // set a connection if established later
  this.conn = conn;
};

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
};

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
          _this.conn.send({
              type: 'SCREEN',
              request: DATA_ENUMS.MOUSE_CLICK,
              coords: {x: event.pageX, y: event.pageY},
              target: maqawGetNodeHierarchy(event.target)
          });
      }
    });
  
    // Set up scroll listener
    function scrollListener(){
      var top = window.pageYOffset;
      var left = window.pageXOffset;
      _this.conn.send({
        type: 'SCREEN',
        request: DATA_ENUMS.SCROLL,
        top: top,
        left: left
      });
    }

    window.addEventListener('scroll', scrollListener, false);

      // attach listeners for form data
      var inputs, index;
      inputs = document.getElementsByTagName('input');
      inputs = Array.prototype.slice.call(inputs);
      // include textareas
      var textareas = document.getElementsByTagName('textarea');
      textareas = Array.prototype.slice.call(textareas);
      inputs = inputs.concat(textareas);
      for (index = 0; index < inputs.length; ++index) {
          var elem = inputs[index];

          // attach change listeners for radio and check buttons
          if(elem.type === 'radio' || elem.type === 'checkbox'){
              elem.addEventListener('change', function(){
                  _this.conn.send({
                      type: 'SCREEN',
                      request: DATA_ENUMS.INPUT,
                      index: maqawGetNodeHierarchy(this),
                      checked: this.checked
                  });
              }, false);
          }

          // listen to value for other input types
          else {
              elem.addEventListener('keyup', function(){
                  _this.conn.send({
                      type: 'SCREEN',
                      request: DATA_ENUMS.INPUT,
                      index: maqawGetNodeHierarchy(this),
                      text: this.value
                  });
              }, false);
          }
      }

      // listen for select fields
      var selects = document.getElementsByTagName('select');
       for(index = 0; index < selects.length; index++){
           var selectNode = selects[index];
          if(selectNode.type === 'select-one'){
              selectNode.addEventListener('change', function(){
                  _this.conn.send({
                      type: 'SCREEN',
                      request: DATA_ENUMS.INPUT,
                      index: maqawGetNodeHierarchy(this),
                      selectedIndex: this.selectedIndex
                  });
              }, false);
          } else if (selectNode.type === 'select-multiple'){
              selectNode.addEventListener('change', function(){
              // get list of selected options
              var selectedOptions = [];
              for(var j = 0; j < this.selectedOptions.length; j++){
                  selectedOptions.push(this.selectedOptions[j].text);
              }
              _this.conn.send({
                  type: 'SCREEN',
                  request: DATA_ENUMS.INPUT,
                  index: maqawGetNodeHierarchy(this),
                  selectedOptions: selectedOptions
              });
              }, false);
          }

      }

  } else {
    console.log("Error: Connection not established. Unable to stream screen");
  }
};

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
    else if (msg.request === DATA_ENUMS.INPUT) {
          var inputNode = maqawGetNodeFromHierarchy(_this.mirrorDocument, msg.index);
            // set the checked attribute if applicable
            if(typeof msg.checked !== 'undefined'){
                inputNode.checked = msg.checked;
            }

            // check for select options
            else if (typeof msg.selectedIndex !== 'undefined'){
                inputNode.selectedIndex = msg.selectedIndex;
            }

            // check for multiple select options
            else if (typeof msg.selectedOptions !== 'undefined'){
                var i, option, length = inputNode.options.length, selectedOptions = msg.selectedOptions,
                    optionsList = inputNode.options;
                for (i = 0; i < length; i++ ) {
                    option = optionsList[i];
                    var index = selectedOptions.indexOf(option.text);
                    if(index !== -1){
                        option.selected = true;
                    } else {
                        option.selected = false;
                    }

                }
            }

            // otherwise set text value
            else {
                inputNode.value = msg.text;
            }
    }
  }

  var msg = data;
  if (msg instanceof Array) {
    msg.forEach(function(subMessage) {
      handleMessage(JSON.parse(subMessage));
    });
  } else {
    handleMessage(msg);
  }
};

function MouseMirror(doc, options) {
  this.CURSOR_RADIUS = 10;
  this.moveEvent = options.mousemove;
  this.clickEvent = options.click;
  this.doc = doc;
  var _this = this;

    // keep track of the last element that was clicked on
  this.lastElementClicked;

  this.cursor = this.doc.createElement('div'); 
  this.cursor.style.width = 2*this.CURSOR_RADIUS + 'px';
  this.cursor.style.height = 2*this.CURSOR_RADIUS + 'px';
  this.cursor.style.backgroundColor = 'red';
  this.cursor.style.borderRadius = '999px';
  this.cursor.style.zIndex = 10000;
  this.cursor.style.position = 'absolute';
  this.cursor.style.top = '0px';
  this.cursor.style.left = '0px';
  this.cursor.setAttribute("ignore", "true");

    // maximum number of times per second mouse movement data will be sent
    var MAX_SEND_RATE = 10;
    // has enough time elapsed to send data again?
    var isMouseTimeUp = true;
    function moveMouse(event){
      if(isMouseTimeUp){
          _this.moveEvent(event);
          isMouseTimeUp = false;
          setTimeout(function(){isMouseTimeUp = true;}, 1000 / MAX_SEND_RATE);
      }
    }


  this.doc.addEventListener('mousemove', moveMouse, false);
  this.doc.addEventListener('click', this.clickEvent, false);


  this.isDrawn = false;

  return this;
}

MouseMirror.prototype.data = function(_data) {

  if (!this.isDrawn) {
    //  Hack that appends cursor only  
    //  once a document.body exists
    if (this.doc.body) {
      this.doc.body.appendChild(this.cursor);
      this.isDrawn = true;
    }
  }

  if (_data.request === DATA_ENUMS.MOUSE_MOVE) {
    this.moveMouse(_data);
  } else if (_data.request === DATA_ENUMS.MOUSE_CLICK) {
    this.clickMouse(_data);
  }

};

MouseMirror.prototype.moveMouse = function(_data) {
  this.cursor.style.top = _data.coords.y - this.CURSOR_RADIUS + 'px';
  this.cursor.style.left = _data.coords.x - this.CURSOR_RADIUS + 'px';
};

MouseMirror.prototype.clickMouse = function(_data) {
    var x = _data.coords.x;
    var y = _data.coords.y;
    var _this = this;

    // get the clicked element
    var target = maqawGetNodeFromHierarchy(this.doc, _data.target);
    // remove highlight from last clicked element
    if(this.lastElementClicked){
        this.lastElementClicked.className = this.lastElementClicked.className.replace(/\bmaqaw-mirror-clicked-element\b/,'');
    }
    // highlight the element that was clicked if it wasn't the body
    if(target.tagName !== 'BODY'){
        target.className = target.className + ' maqaw-mirror-clicked-element';
        this.lastElementClicked = target;
    }


    function makeExpandingRing(){
        var radius = 1;
        var click = _this.doc.createElement('div');
        click.style.width = 2*radius + 'px';
        click.style.height = 2*radius + 'px';
        click.style.backgroundColor = 'transparent';
        click.style.border = '2px solid rgba(255, 255, 0, 1)';
        click.style.borderRadius = '999px';
        click.style.zIndex = 10000;
        click.style.position = 'absolute';
        click.style.top = y - radius + 'px';
        click.style.left = x - radius + 'px';
        click.setAttribute("ignore", "true");
        _this.doc.body.appendChild(click);

        var rate = 50;
        var radiusIncrease = 2;
        var transparency = 1;
        var transparencyRate = .03;

        (function expand() {
            radius += radiusIncrease;
            transparency -= transparencyRate;
            click.style.border = '2px solid rgba(255, 255, 0, ' + transparency + ')';
            click.style.width = 2*radius + 'px';
            click.style.height = 2*radius + 'px';
            click.style.top = y - radius + 'px';
            click.style.left = x - radius + 'px';

            if(transparency > 0){
                setTimeout(expand, rate);
            } else {
                _this.doc.body.removeChild(click);
            }
        })();
    }

    var numRings = 6;
    var ringSpacing = 300;
    var ringCounter = 0;

    (function doRings (){
        if(ringCounter < numRings){
            makeExpandingRing();
            ringCounter++;
            setTimeout(doRings, ringSpacing);
        }
    })();


};

MouseMirror.prototype.off = function() {
  this.doc.removeEventListener('mousemove', this.moveEvent, false);
  this.doc.removeEventListener('click', this.clickEvent, false);
};
