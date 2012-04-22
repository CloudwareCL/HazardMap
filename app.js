
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , streaming = require('./streaming');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);

app.get('/map', function(req, res) {
	
});

app.get('/tweets', function(req, res) {
	res.writeHead(200, {'Content-Type': 'application/json'});
	res.end(JSON.stringify(tweets));
});

var tweets = [];

function spit_coordinates(data) {
//console.log('********************* TEST **********************')
//console.log(tweets);
//console.log(data.coordinates)
  if(data && data.coordinates) {
    coordinates = data.coordinates.coordinates;
    lon = coordinates[0];
    lat = coordinates[1];
    message = data.text;
    id = data.id;
    
    var tweet={'latitud': lat, 'longitud': lon, 'id': id, 'descripcion': message};

    tweets.push(tweet);
    if(tweets>1000) delete tweets[0];

    socket.emit('new-tweet', tweet);
  }
}

// Web-Sockets

var io = require('socket.io').listen(app);
var socket=io.of('/stream').on('connection', function(client) {
	//client.emit('tweet-list', tweets);
});

create_streaming({track: 'earthquake,dissaster,hurricane,flood,danger,caution,fire,explosion,crash',locations: '-122.75,36.8,-121.75,37.8,-74,40,-73,41', data: spit_coordinates, error: function(){}});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
