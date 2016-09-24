var http        = require('http');
var express		= require('express');
var fs			= require('fs');
var io			= require('socket.io');
var crypto		= require('crypto');

var app       	= express();
var staticDir 	= express.static;
var server    	= http.createServer(app);

io = io(server);

var opts = {
	port: process.env.PORT || 1948,
};

var ids = {};

io.on('connection', function(socket) {
	socket.on('multiplex-statechanged', function(data) {
		if (typeof data.secret == 'undefined' || data.secret == null || data.secret === '') return;
		if (createHash(data.secret) === data.socketId) {
			data.secret = null;
			socket.broadcast.emit(data.socketId, data);
		};
	});
});

app.get("/", function(req, res) {
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.write('<!DOCTYPE html><html><head><title>FoosterNET Reveal.js Multiplex</title></head><body><header><h1>FoosterNET Reveal.js Multiplex</h1></header><br/><br/><section><p>If you are looking for a presentation id, you can get it by typing in the presentation name below.</p><form action="/id" method="get"><label for="id_presentation">Presentation: </label><input type="text" id="id_presentation" name="presentation" placeholder="presentation"/><br/><br/><input type="submit"/></form></section><br/><br/><section><p>If you are looking to make a presentation token and id, you can make one by typing in the presentation name below.</p><form action="/token" method="get"><label for="token_presentation">Presentation: </label><input type="text" token="token_presentation" name="presentation" placeholder="presentation"/><br/><br/><input type="submit"/></form></section></body></html>');
	res.end();

	stream.on('readable', function() {
		stream.pipe(res);
	});
});

app.get("/token", function(req, res) {
	if (typeof req.query.presentation === 'undefined') {
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write('<!DOCTYPE html><html><head><title>FoosterNET Reveal.js Multiplex</title></head><body><header><h1>FoosterNET Reveal.js Multiplex</h1></header><br/><br/><section><p>If you are looking to make a presentation token and id, you can make one by typing in the presentation name below.</p><form action="/token" method="get"><label for="token_presentation">Presentation: </label><input type="text" token="token_presentation" name="presentation" placeholder="presentation"/><br/><br/><input type="submit"/></form></section></body></html>');
		res.end();
	}
	else {
		var ts = new Date().getTime();
		var rand = Math.floor(Math.random()*9999999);
		var secret = ts.toString() + rand.toString();
		ids[req.query.presentation] = createHash(secret);
		res.send({secret: secret, id: ids[req.query.presentation]});
	}
});

app.get("/id", function(req, res) {
	if (typeof req.query.presentation === 'undefined' || !(req.query.presentation in ids)) {
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write('<!DOCTYPE html><html><head><title>FoosterNET Reveal.js Multiplex</title></head><body><header><h1>FoosterNET Reveal.js Multiplex</h1></header><br/><br/><section><p>If you are looking for a presentation id, you can get it by typing in the presentation name below.</p><form action="/id" method="get"><label for="id_presentation">Presentation: </label><input type="text" id="id_presentation" name="presentation" placeholder="presentation"/><br/><br/><input type="submit"/></form></section></body></html>');
		res.end();
	}
	else {
		res.send(ids[req.query.presentation]);
	}
});

var createHash = function(secret) {
	var cipher = crypto.createCipher('blowfish', secret);
	return(cipher.final('hex'));
};

// Actually listen
server.listen( opts.port || null );

var brown = '\033[33m',
	green = '\033[32m',
	reset = '\033[0m';

console.log( brown + "reveal.js:" + reset + " Multiplex running on port " + green + opts.port + reset );
