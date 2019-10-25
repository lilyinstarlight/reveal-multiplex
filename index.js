var creds       = require('./creds.js');

var http        = require('http');
var express     = require('express');
var auth        = require('express-basic-auth');
var io          = require('socket.io');
var crypto      = require('crypto');

var app         = express();
var staticDir   = express.static;
var server      = http.createServer(app);

io = io(server);

var opts = {
    port: process.env.PORT || 1948,
    auth: Object.keys(creds).length ? auth(creds) : function(req, res, next) { return next() },
    expire: 24
};

var ids = {};

io.on('connection', function(socket) {
    socket.on('multiplex-statechanged', function(data) {
        if (typeof data.secret === 'undefined' || data.secret === null || data.secret === '') return;
        if (!Object.values(ids).includes(data.socketId)) return;

        crypto.scrypt(data.secret, data.secret.split('.')[2], 32, function(err, hash) {
            if (hash.toString('hex') === data.socketId) {
                data.secret = null;
                socket.broadcast.emit(data.socketId, data);
            }
        });
    });
});

app.get('/', function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<!DOCTYPE html><html><head><title>Reveal.js Multiplex</title></head><body><header><h1>Reveal.js Multiplex</h1></header><br/><br/><section><p>If you are looking for a presentation id, you can get it by typing in the presentation name below.</p><form action="/id" method="get"><label for="id_presentation">Presentation: </label><input type="text" id="id_presentation" name="presentation" placeholder="presentation"/><br/><br/><input type="submit"/></form></section><br/><br/><section><p>If you are looking to make a presentation token and id, you can make one by typing in the presentation name below.</p><form action="/token" method="get"><label for="token_presentation">Presentation: </label><input type="text" id="token_presentation" name="presentation" placeholder="presentation"/><br/><br/><input type="submit"/></form></section></body></html>');
    res.end();
});

app.get('/token', opts.auth, function(req, res) {
    if (typeof req.query.presentation === 'undefined') {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write('<!DOCTYPE html><html><head><title>Reveal.js Multiplex</title></head><body><header><h1>Reveal.js Multiplex</h1></header><br/><br/><section><p>If you are looking to make a presentation token and id, you can make one by typing in the presentation name below.</p><form action="/token" method="get"><label for="token_presentation">Presentation: </label><input type="text" id="token_presentation" name="presentation" placeholder="presentation"/><br/><br/><input type="submit"/></form></section></body></html>');
        res.end();
    }
    else {
        var ts = new Date().getTime();
        var rand = crypto.randomBytes(16);
        var salt = crypto.randomBytes(16);
        var secret = ts.toString() + '.' + rand.toString('hex') + '.' + salt.toString('hex');

        crypto.scrypt(secret, secret.split('.')[2], 32, function(err, hash) {
            ids[req.query.presentation] = hash.toString('hex');
            setTimeout(function(idx) {
                delete ids[idx];
            }, opts.expire*3600000, req.query.presentation);

            var cors = req.get('Origin') ? {'Access-Control-Allow-Origin': req.get('Origin'), 'Access-Control-Allow-Credentials': 'true'} : {};
            res.writeHead(200, {'Content-Type': 'text/plain', 'Vary': 'Origin', ...cors});
            res.write(secret);
            res.end();
        });
    }
});

app.get('/id', function(req, res) {
    if (typeof req.query.presentation === 'undefined') {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write('<!DOCTYPE html><html><head><title>Reveal.js Multiplex</title></head><body><header><h1>Reveal.js Multiplex</h1></header><br/><br/><section><p>If you are looking for a presentation id, you can get it by typing in the presentation name below.</p><form action="/id" method="get"><label for="id_presentation">Presentation: </label><input type="text" id="id_presentation" name="presentation" placeholder="presentation"/><br/><br/><input type="submit"/></form></section></body></html>');
        res.end();
    }
    else if (!Object.keys(ids).includes(req.query.presentation)) {
        var cors = req.get('Origin') ? {'Access-Control-Allow-Origin': req.get('Origin'), 'Access-Control-Allow-Credentials': 'true'} : {};
        res.writeHead(200, {'Content-Type': 'text/plain', 'Vary': 'Origin', ...cors});
        res.write('');
        res.end();
    }
    else {
        var cors = req.get('Origin') ? {'Access-Control-Allow-Origin': req.get('Origin'), 'Access-Control-Allow-Credentials': 'true'} : {};
        res.writeHead(200, {'Content-Type': 'text/plain', 'Vary': 'Origin', ...cors});
        res.write(ids[req.query.presentation]);
        res.end();
    }
});

server.listen(opts.port || null);

var brown = '\033[33m',
    green = '\033[32m',
    reset = '\033[0m';

console.log(brown + 'reveal.js:' + reset + ' Multiplex running on port ' + green + opts.port + reset);
