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
		res.send('Testing in progress. Hi :)');
	}
});


app.use('/git', function(req, res){
	console.log('/git');
	console.log(req.body);
	var usefulData = {
		
	}
	res.status(202).send('Hook accepted :)');
});

module.exports = app;