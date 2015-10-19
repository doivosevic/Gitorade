var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var crypto = require('crypto')
  , shasum = crypto.createHash('sha1');



var rawLocalSecret = process.env.GITSECRET || 'testsecret';
shasum.update(rawLocalSecret, 'utf8');
var sha1LocalSecret = 'sha1=' + shasum.digest('hex');

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
	console.log(req.headers);

	var sha1RemoteSecret = req.headers['x-hub-signature'];

	console.log('\n\nand now header hook sig\n\n');
	console.log(sha1RemoteSecret);

	if (sha1RemoteSecret === sha1LocalSecret) {
		var usefulData = {
			
		}
		res.status(202).send('Hook accepted :)');
	}
	else {
		console.log("Wrong secret. Ignoring commit!");
		res.status(400).send('Wrong secret!! :(');
		return;
	}
});

module.exports = app;