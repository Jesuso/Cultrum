var socket = io('http://localhost');

socket.on('news', function (data) {
  console.log("Received:", data);
  socket.emit('my other event', { my: 'data' });
});
