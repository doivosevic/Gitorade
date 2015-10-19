var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');


var app = express();

var config = fs.readFileSync('./gitorade.config', 'utf8');

console.log(config);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

app.get('/', function(req, res, next){
	console.log(app.testing);
	if (app.testing === true) {
		console.log('Server on. Testing in progress\n' +
					'This should only display when testing.\n' +
					'Report issue if else!');
		res.send('Testing in progress. Hi :)');
	}
});


app.post('/git', function(req, res){
	console.log('/git');
	console.log(req.body);
	console.log('\n\nand now header\n\n');
	console.log(req.header);
	console.log('\n\nand now header\n\n');
	console.log(req);
	var usefulData = {
		
	}
	res.status(202).send('Hook accepted :)');
});

module.exports = app;