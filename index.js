var http = require('http');
var AgarioClient = require('agario-client'); //Use this in your scripts
var region = 'US-Atlanta';
var Socks = require('socks');
var client = new AgarioClient('worker'); //create new client and call it "worker" (not nickname)
var interval_id = 0; //here we will store setInterval's ID

var target_server = process.argv[2];
console.log(process.argv);

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
	    console.log(target_server == srv.server + ' target: ' + target_server + ' current: ' + srv.server);
	    if(target_server == srv.server){
	    	client.connect('ws://' + srv.server, srv.key); //do not forget to add ws://

	    } else {
	    	setTimeout(function(){cb(false)}, 100);
	    }
	});
}

client.on('connected', function() { //when we connected to server
    client.log('spawning');
    client.spawn('agario-client'); //spawning new ball
	// setInterval(100,moveTo);
	moveTo();
});

function moveTo() {
	client.moveTo(1000,2000);
}

client.on('disconnect', function(e) {
	console.log('disconnected')
});

function handleLogin(success) {
	if(!success) {
		console.log(handleLogin)
		attemptLogin(handleLogin);
	}
}

attemptLogin(handleLogin);



