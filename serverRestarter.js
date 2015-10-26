var child_process = require('child_process');
var fs = require('fs');

var configLocation = JSON.parse(fs.readFileSync('/home/git/Gitorade/gitorade.location', 'utf8'));
var config = JSON.parse(fs.readFileSync(configLocation.location, 'utf8'));

function filelog(text) {
	text = text.toString();
	var now = new Date();
	var timestamp = 
		now.getFullYear() + '.' + 
		(now.getMonth()+1) + '.' + 
		now.getDate() + '-' +
		(now.getHours()+1) + ":" +
		(now.getMinutes()+1) + ":" +
		(now.getSeconds()+1);

	text = timestamp + " - " + text;
	console.log(text);
	//console.log(gitoradeLogLocation);
	fs.appendFileSync(gitoradeLogLocation, text + '\n');
}

child_process.exec("kill " + process.env.SERVERPID, function (){
	child_process.exec('screen -d -m -L node ' + config.gitoradeServerLocation, function(){
		filelog('Finished restarting');
	});
})