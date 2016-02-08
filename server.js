var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.send('<h1>Server is up!</h1>');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

io.on('master_location_report', function(location) {
	io.emit('master_location', location);
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});