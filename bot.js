var http = require('http');
var AgarioClient = require('agario-client'); //Use this in your scripts
var region = 'US-Atlanta';
var Socks = require('socks');
var ioClient = require('socket.io-client')('allexr.com:3000');


var client = new AgarioClient('worker'); //create new client and call it "worker" (not nickname)
var intervalID = 0; //here we will store setInterval's ID
var ballId = null;

var target_server = process.argv[2];
// x and y to go to
var target_x = 0;
var target_y = 0;

var moveTimeoutID = 0;
var tries = 0;

// communicate with tracker
ioClient.on('master_location', function(location){
	target_x = location.x;
	target_y = location.y;
})

function createAgent() {
    return new Socks.Agent({
        proxy: {
            ipaddress: process.argv[4],
            port: parseInt(process.argv[5]),
            type: parseInt(process.argv[3])
        }}
    );
}

function serverOpts() {
	if (process.argv.length < 4) {
		return {
			region: 'US-Atlanta'
		}
	} else {
		return {
			// using proxy
			agent: createAgent(),
			region: 'US-Atlanta'
		}
	}
}

function attemptLogin(cb) {
	AgarioClient.servers.getFFAServer(serverOpts(), function(srv) { //requesting FFA server
	    if(!srv.server) return console.log('Failed to request server (error=' + srv.error + ', error_source=' + srv.error_source + ')');
	    console.log('target: ' + target_server + ' current: ' + srv.server);
	    if(target_server == srv.server){
	    	client.connect('ws://' + srv.server, srv.key); //do not forget to add ws://
	    } else {
	    	setTimeout(function(){cb(false)}, 100);
	    }
	});
	// AgarioClient.servers.getFFAServer({region: 'US-Atlanta'}, function(srv) { //requesting FFA server
	//     if(!srv.server) return console.log('Failed to request server (error=' + srv.error + ', error_source=' + srv.error_source + ')');
	//     client.connect('ws://' + srv.server, srv.key); //do not forget to add ws://
	// });
}

function handleLogin(success) {
	if(!success) {
		tries++;
		attemptLogin(handleLogin);
	}
}

client.on('connected', function() { //when we connected to server
    client.log('spawning');
	setInterval(printLocation,100);
	spawnRoutine();
});

function printLocation() {
	if(ballId) {
		console.log(client.balls[ballId].x + ' ' + client.balls[ballId].y)
	}
}

function spawnRoutine() {
	client.spawn('agario-client');
	var moveTimeoutID = setInterval(moveToTarget, 100);
}

function moveToTarget() {
	console.log('moving to: ' target_x + ' ' + target_y);
	client.moveTo(target_x,target_y);
}

function cancel() {
	console.log('stopping');
	clearInterval(intervalID);
}

client.on('disconnect', function(e) {
	console.log('disconnected');
	cancel();
});

client.on('myNewBall', function(ball_id) { //when i got new ball
    client.log('my new ball ' + ball_id + ', total ' + client.my_balls.length);
    ballId = ball_id;
});

client.on('lostMyBalls', function() {
	cancel();
	spawnRoutine();
});

attemptLogin(handleLogin);



