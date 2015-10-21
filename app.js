// For running a server.
var express = require('express');
// For getting a proper json from requests' bodies.
var bodyParser = require('body-parser');
// For reading config file.
var fs = require('fs');
// For checking github webhook secret validity.
var crypto = require('crypto');
// For executing shell script.
var exec = require('child_process').exec;

function filelog(text) {
	fs.appendFileSync('/home/git/Gitorade/log.txt', text + '\n');
}

// Parse config file
var config = JSON.parse(fs.readFileSync('/home/git/Gitorade/gitorade.config', 'utf8'));
console.log(config);

// Initialize hmac crypto for checking webhook auth
console.log(process.env.GITSECRET);
var hmac = crypto.createHmac('sha1', process.env.GITSECRET || config.gitsecret || "testsecret");

// Initialize express server
var app = express();
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

var pid = process.pid;
filelog('New PID is: ' + pid);
filelog('Secret is: ' + (process.env.GITSECRET || config.gitsecret || "testsecret"));

// Handle github webhook request
app.post('/git', function(req, res){
	console.log('/git');
	//console.log(req.body);
	var xHubSig = req.headers['x-hub-signature'];
	commitData = authPayloadAndExtract(req.body, hmac, xHubSig, res);

	var cwd = process.cwd();

	filelog('----------------------\n' + 
		'New push\n' +
		'RepoName is: ' + commitData.repoName);

	console.log(pid);
	console.log(cwd);
	console.log(commitData);

	/*options = {
		env: {
			'PID': pid,
			'REPONAME': commitData.repoName
		}
	}*/

	exec('git -C /home/git/' + commitData.repoName + ' pull', 
		{cwd:('/home/git/' + commitData.repoName)},
		function(err, stdout, stderr){
			filelog('Git pull stdout is: ' + stdout);
			filelog('Git pull stderr is: ' + stderr);
			if (err !== null) {
				filelog('Git pull err is: ' + err);
			}
			if (true) {
				filelog('PID was: ' + pid);
				exec('kill ' + pid + ';screen -d -m nodejs server.js', 
					{cwd:'/home/git/Gitorade'},
					function(err, stdout, stderr){
						filelog('Kill+screen pull stdout is: ' + stdout);
						filelog('Kill+screen pull stderr is: ' + stderr);
						if (err !== null) {
							filelog('Kill+screen pull err is: ' + err);
						}
				});
			}
	});

	
		

	/*exec('sh magic.sh', options, function(err, stdout, stderr) {
		console.log('stdout:' + stdout);
		console.log('stderr:' + stderr);
	    if (err !== null) {
	      console.log('exec error: ' + err);
	    }
	});*/

	/*
		position "cd cwd && cd .."
		kill this server "kill pid"
		git pull updated repo "cd 'repoName' && git pull"
		restart server "cd .. && PORT=80 GITSECRET=q nodejs server.js"
	*/
});

function authPayloadAndExtract(payload, hmac, xHubSig, res) {
	//// Checking payload secret
	// Calculating local secret
	hmac.update(JSON.stringify(payload), 'utf-8');
	var sha1LocalSecret = 'sha1=' + hmac.digest('hex');
	// Extracting remote secret
	var sha1RemoteSecret = xHubSig;

	if (sha1RemoteSecret === sha1LocalSecret) {
		// Data to be used for later actions
		var usefulData = {
			'commitMessage': payload.head_commit.message,
			'commitTimestamp': payload.head_commit.timestamp,
			'commiterUsername': payload.head_commit.committer.username,
			'commiterEmail': payload.head_commit.committer.email,
			'repoName': payload.repository.name,
			'repoFullname': payload.repository.fullname
		}
		// Responding to github that the secret is ok.
		res.status(202).send('Secret ok. Hook accepted :)');
		return usefulData;
	}
	else {
		console.log("Wrong secret. Ignoring commit!");
		// Responding to github that the secret is not ok.
		res.status(400).send('Wrong secret!! :(');
		return null;
	}
}

module.exports = app;