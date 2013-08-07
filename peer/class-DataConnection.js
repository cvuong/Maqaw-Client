function DataConnection(options) {
  this.src = options.src;
  this.dst = options.dst;
  this.options = options.options;

  // Establish connection to socket
  var socketUrl = 'http://' + this.options.host + ':' + this.options.port;
  this.socket = io.connect(socketUrl);
}

DataConnection.prototype.send = function(data) {
  console.log("we are sending a message");
  console.log(data);
  console.log(this);
  this.socket.emit('send', { src: this.src, dst: this.dst, message: data });
};

DataConnection.prototype.close = function(data) {
  console.log("inside dataconn close");
  this.socket.emit('close', { src: this.src, dst: this.dst });
}

DataConnection.prototype.on = function(event, cb) {
  if (event == 'open') event = 'connection open';

  var that = this;
  this.socket.on(event, function(data) {
    console.log("the socket got the following event");
    console.log(event);
    console.log("data:");
    console.log(data);
    console.log("that");
    console.log(that);
    switch (event) {
      case "connection open":
        if (that.src == data.src && that.dst == data.dst) {
          console.log("success in firing connection open cb");
          cb(data);
        }
        break;
      case "data":
        if (that.dst == data.src && that.src == data.dst) {
          console.log("success in firing data cb");
          cb(data);
        }
        break;
      case "close":
        if (that.src == data.src && that.dst == data.dst) {
          console.log("success in firing close cb");
          cb(data);
        }
        break;
      default:
        console.log("fired default cb");
        cb(data);
        break;
    }
  });
}
