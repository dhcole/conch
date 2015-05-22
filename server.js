var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    _ = require('underscore');

var queue = {};

server.listen(80);

app.use(express.static(__dirname + '/public'));
app.use(function(req, res) {
  res.sendFile(__dirname + '/public/app.html');
});

io.on('connection', function(socket) {
  var headers = socket.handshake.headers,
      room = headers.referer.split('://')[1].split(headers.host)[1];

  // Create and join room based on path
  queue[room] = queue[room] || [];
  socket.join(room);

  // Send client id
  socket.emit('id', socket.id, queue[room][0]);

  // Client takes action
  socket.on('ping', function() {

    // Not in queue
    if (queue[room].indexOf(socket.id) === -1) {
      queue[room].push(socket.id);
      socket.emit('waiting');

    // In queue
    } else {
      queue[room] = _(queue[room]).without(socket.id);
      socket.emit('not waiting');
    }

    // Send current
    io.to(room).emit('active', queue[room][0]);

  });

  // Client disconnects
  socket.on('disconnect', function() {

    // Remove from queue
    queue[room] = _(queue[room]).without(socket.id);

    // Send current
    io.to(room).emit('active', queue[room][0]);
  });
});
