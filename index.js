var http = require('http');
var express = require('express');
var app = module.exports.app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

server.listen(80);  //listen on port 80

app.use(express.static('public'));
app.use('/scripts', express.static(__dirname + '/node_modules/'));

io.on('connection', function (socket) {
  console.log('Player joined: ' + socket.conn.id);

  // Tell everyone someone joined
  io.emit('join', { id: socket.conn.id });
  // And tell the user that join was himself !!!
  socket.emit('online', { id: socket.conn.id });

  socket.on('keydown', function (data) {
    console.log('Key Down! ', data);
    // Tell everyone about this movement
    io.emit('keydown', {player: socket.conn.id, key: data.key});
  });

  socket.on('keyup', function (data) {
    // Tell everyone about this movement
    console.log('Key Up! ', data);
    io.emit('keyup', {player: socket.conn.id, key: data.key});
  });
});
