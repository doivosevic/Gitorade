var express = require('express');
var fs = require('fs');


var app = express();

var config = fs.readFileSync('./gitorade.config', 'utf8');

console.log(config);

app.get('/', function(req, res, next){
	console.log(app.testing);
	if (app.testing === true) {
		console.log('Server on. Testing in progress\n' +
					'This should only display when testing.\n' +
					'Report issue if else!');
		res.render('Testing in progress. Hi :)');
	}
});


app.use('/git', function(req, res){
	console.log(req);
});

module.exports = app;