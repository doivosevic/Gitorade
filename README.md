# Gitorade

> Git automation tool for syncing git repos with host snapshots running on nodejs

This is a fully functioning expressjs server which supports hosting on multiple domains and subdomains using nodejs vhost. Once set up the server is listening on port 80 and running all whitelisted repo applications on one nodejs expressjs server.

## Install

```bash
$ npm install
$ node server
```

## Usage

All you need is a fresh install of nodejs on your linux server and a modified config file which should look like this:


```json
{
	"port": 80,
	"gitsecret": "mygitsecret",
	"gitReposDirectory": "/home/git/",
	"gitoradeAppLocation": "/home/git/Gitorade/app.js",
	"gitoradeServerLocation": "/home/git/Gitorade/server.js",
	"gitoradeServerRestarterLocation": "/home/git/Gitorade/serverRestarter.js",
	"gitoradeLogLocation": "/home/git/gitoradeLog.txt",
	"whitelistedAuthors": [ "MeMyself" ],
	"whitelistedRepos": [ "www.google.com", "www.google.xyz" ]
}
```

This config is set up to have all the repositories which you want to sync in `/home/git/` directory and the Gitorade directory with the server is in `/home/git/Gitorade`. The config and the log are outside the repositories so that they do not get pushed. They are in `/home/git`. Whitelisting does not support regex for now.

## License

MIT © [Dominik Dito Ivosevic](http://dito.ninja)
