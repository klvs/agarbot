//this is example of API usage
var http = require('http');
var AgarioClient = require('agario-client');
var ioClient = require('socket.io-client')('allexr.com:3000');
var socket = null;

var client = new AgarioClient('worker');
var target_server = process.argv[2];

client.auth_token = '';
var ballId = null;

// ioClient.on('connect', function(socket) {
// 	socket = socket;
// });

client.on('connected', function() { 
	setInterval(emitLocation,100);
});

client.on('myNewBall', function(ball_id) {
    client.log('my new ball ' + ball_id + ', total ' + client.my_balls.length);
    ballId = ball_id;
});

function emitLocation() {
	console.log(client.balls[ballId].x + ' ' + client.balls[ballId].y)
	ioClient.emit('master_location', {
		x: client.balls[ballId].x,
		y: client.balls[ballId].y
	});
}



client.connect('ws://' + target_server, ''); //do not forget to add ws://