var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var WebSocketServer = require('ws').Server;
var net = require('net');
var tls = require('tls');
var tasks = require('./tasks.js');
var fs = require('fs');

app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/dynamic', express.static( __dirname + '/build'));

app.get('/', function (req, res) {
    fs.readFile(__dirname + '/public/index.html', 'utf8', function(err, text){
        res.send(text);
    });
});

var wss = new WebSocketServer({server: server});

wss.on('connection', function (socket) {
    var req = socket.upgradeReq;
    if (req.host !== req.origin) {
        socket.send("Only same origin allowed");
        socket.close();
        return;
    }

    var match = req.url.match(/^\/(tcp|tls)\/([^\/]+)\/([0-9]+)$/);
    if (!match) {
        socket.send("Invalid request url.\nMust be /:protocol/:host/:port");
        socket.close();
        return;
    }
    
    var protocol = match[1];
    console.log("socket<->%s Client connected", protocol);
    var host = match[2];
    var port = parseInt(match[3], 10);
    var base = protocol === "tcp" ? net : tls;
    console.log("Connecting to %s:%s", host, port)
    var s = base.connect({host: host, port: port}, onConnect);

    s.on("error", function (err) {
        try {
            socket.send(err);
            socket.close();
        } catch (err) {}
    });

    function onConnect() {
        socket.send("connect");
        console.log("Connected to %s:%s", host, port);

        s.on("error", function (err) {
            try {
                socket.send(err);
                socket.close();
            } catch (err) {}
        });

        socket.on('message', function (message) {
            try {
                s.write(message);
            } catch (err) {}
        });

        socket.on('close', function () {
            try {
                s.end();
            } catch (err) {}
        });

        s.on('data', function (chunk) {
            try {
                socket.send(chunk);
            } catch (err) {}
        });

        s.on('close', function () {
            try {
                socket.close();
            } catch (err) {}
        });
    }
});

app.listen(process.env.PORT || 8001);

var targets = process.argv.slice(2);
if (targets[0] === 'w' || targets[0] === 'watch') {
    tasks.watch();
} else {
    tasks.run();
}