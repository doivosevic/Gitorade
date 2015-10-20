var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var crypto = require('crypto');

// Initialize hmac crypto for checking webhook auth
console.log(process.env.GITSECRET);
var hmac = crypto.createHmac('sha1', process.env.GITSECRET || "testsecret");

// Initialize express server
var app = express();
var config = fs.readFileSync('./gitorade.config', 'utf8');
console.log(config);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

// Handle default request
app.get('/', function(req, res, next){
	console.log(app.testing);
	if (app.testing === true) {
		console.log('Server on. Testing in progress\n' +
					'This should only display when testing.\n' +
					'Report issue if else!');
		res.send('Testing in progress. Hi :)');
	}
});

// Handle github webhook request
app.post('/git', function(req, res){
	console.log('/git');
	console.log(req.body);
	console.log('\n\nand now header\n\n');
	console.log(req.headers);

	//// CHECKING WEBHOOK SECRET
	// CALCULATING FROM PAYLOAD AND LOCAL SECRET
	var payload = req.body;
	hmac.update(JSON.stringify(payload), 'utf-8');
	var sha1LocalSecret = 'sha1=' + hmac.digest('hex');
	// GETTING REMOTE SECRET
	var sha1RemoteSecret = req.headers['x-hub-signature'];

	console.log('\n\nand now header hook sig\n\n');
	console.log(sha1RemoteSecret);
	console.log(sha1LocalSecret);

	if (sha1RemoteSecret === sha1LocalSecret) {
		var usefulData = {
			
		}
		res.status(202).send('Secret ok. Hook accepted :)');
	}
	else {
		console.log("Wrong secret. Ignoring commit!");
		res.status(400).send('Wrong secret!! :(');
		return;
	}
});

module.exports = app;