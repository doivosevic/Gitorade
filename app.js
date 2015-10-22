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
	console.log(text);
	console.log(gitoradeLogLocation);
	fs.appendFileSync(gitoradeLogLocation, text + '\n');
}

// Parse config file
var configLocation = JSON.parse(fs.readFileSync('/home/git/Gitorade/gitorade.location', 'utf8'));
var config = JSON.parse(fs.readFileSync(configLocation.location, 'utf8'));
console.log(config);

var gitoradeLogLocation = config.gitoradeLogLocation;

// Initialize hmac crypto for checking webhook auth
console.log(process.env.GITSECRET);
var hmac = crypto.createHmac('sha1', process.env.GITSECRET || config.gitsecret || "testsecret");

// Initialize express server
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

// OBSOLETE: Get current working directory
var cwd = process.cwd();

var pid = process.pid;
filelog('New PID is: ' + pid);
filelog('Secret is: ' + (process.env.GITSECRET || config.gitsecret || "testsecret"));

app.use(function(req, res, next) {
	console.log('git.dito.ninja!!');
	console.log(req.url);

	// Checking whether the request is push notification from github
	if (req.headers['x-github-event'] !== 'push') {
		filelog('----------------------\n' + 
			'A request which is not a push notif from github was received');
		res.send('This is a misplaced request. Check url again.');
		return;
	}

	next();
})

// Handle github webhook request
app.post('/', function(req, res){
	console.log('git.dito.ninja');

	//console.log(req.body);
	var xHubSig = req.headers['x-hub-signature'];

	// Validate secret and extract info from payload
	commitData = authPayloadAndExtract(req.body, hmac, xHubSig, res);

	filelog('----------------------\n' + 
		'New push\n' +
		'RepoName is: ' + commitData.repoName);

	console.log(pid);
	console.log(cwd);
	console.log(commitData);

	// Bind parameters so that the function can be used as callback
	var bindedRestartNodejs = restartNodejs.bind(this, pid, config.gitoradeServerLocation);

	gitPullCommand(config.gitReposDirectory, commitData.repoName, bindedRestartNodejs);
});

function gitPullCommand(gitReposDirectory, repoName, callback) {
	exec('git -C ' + gitReposDirectory + repoName + ' pull',
		function(err, stdout, stderr){
			// Logging exec streams
			filelog('Git pull stdout is: ' + stdout);
			filelog('Git pull stderr is: ' + stderr);
			if (err !== null) {
				filelog('Git pull err is: ' + err);
			}
			callback();
	});
}

function restartNodejs(pid, serverjsLocation) {
	filelog('PID was: ' + pid);
	console.log(serverjsLocation);
	exec('kill ' + pid + ';screen -d -m nodejs ' + serverjsLocation,
		function(err, stdout, stderr){
			filelog('Kill+screen pull stdout is: ' + stdout);
			filelog('Kill+screen pull stderr is: ' + stderr);
			if (err !== null) {
				filelog('Kill+screen pull err is: ' + err);
			}
	});
}

function authPayloadAndExtract(payload, hmac, xHubSig, res) {
	//// Checking payload secret
	// Calculating local secret
	hmac.update(JSON.stringify(payload), 'utf-8');
	var sha1LocalSecret = 'sha1=' + hmac.digest('hex');
	// Extracting remote secret
	var sha1RemoteSecret = xHubSig;

	// Data to be used for later actions
	var usefulData = {
		'validSecred': sha1RemoteSecret === sha1LocalSecret,
		'commitMessage': payload.head_commit.message,
		'commitTimestamp': payload.head_commit.timestamp,
		'commiterUsername': payload.head_commit.committer.username,
		'commiterEmail': payload.head_commit.committer.email,
		'repoName': payload.repository.name,
		'repoFullname': payload.repository.fullname
	}

	if (sha1RemoteSecret === sha1LocalSecret) {
		console.log("Valid secret :)");
		// Responding to github that the secret is ok.
		res.status(202).send('Secret ok. Hook accepted :)');
	}
	else {
		console.log("Wrong secret. Ignoring commit!");
		// Responding to github that the secret is not ok.
		res.status(400).send('Wrong secret!! :(');
	}

	return usefulData;
}

module.exports = app;