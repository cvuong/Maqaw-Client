function DataConnection(options) {
  this.src = options.src;
  this.dst = options.dst;
  this.options = options.options;
  this.open = true;

  // Establish connection to socket
  var socketUrl = 'http://' + this.options.host + ':' + this.options.port;
  this.socket = io.connect(socketUrl);
}

DataConnection.prototype.send = function(data) {
  this.socket.emit('send', { src: this.src, dst: this.dst, message: data });
};

DataConnection.prototype.on = function(event, cb) {
  if (event == 'open') event = 'connection open';
  this.socket.on(event, function(data) {
    cb(data);
  });
}
