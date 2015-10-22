var express = require('express');
var http = require('http');
var vhost = require('vhost');
var fs = require('fs');

// Parse config file
var configLocation = JSON.parse(fs.readFileSync('/home/git/Gitorade/gitorade.location', 'utf8'));
var config = JSON.parse(fs.readFileSync(configLocation.location, 'utf8'));
console.log(config);

var gitapp = require(config.gitoradeAppLocation);

//var ditoninjaapp = require('../dito.ninja/app');

var app = express();

app.use(function(req, res, next) {
  console.log(req.headers.host);
  next();
});

app.use(vhost('git.dito.ninja', gitapp));

var whitelistedApps = [];
for (var i = 0; i < config.whitelistedRepos.length; ++i) {
  console.log('A repo');
  console.log(config.gitReposDirectory + config.whitelistedRepos[i])
  console.log(config.whitelistedRepos[i]);
  whitelistedApps[i] = require(config.gitReposDirectory + config.whitelistedRepos[i] + '/app');
  app.use(vhost(config.whitelistedRepos[i], whitelistedApps[i]));
}

//app.use(vhost('dito.ninja', ditoninjaapp));

// gitapp.testing = true;

var server = http.createServer(app);
var port = process.env.PORT || '80';
server.listen(port);

server.on('error', onError);
server.on('listening', onListening);

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}
