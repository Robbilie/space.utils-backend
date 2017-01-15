
	"use strict";

	// allow relative imports
	process.env.NODE_PATH = `${__dirname}/src`;
	require("module").Module._initPaths();

	// preload some basic modifications
	require("lib/extendings")();

	// import the k8s secrets into a global variable
	global.config = require("js-yaml").safeLoad(new Buffer(require("fs").readFileSync("/etc/secrets/config.yaml"), "base64"));

	// setup sentry if dsn is set
	global.err = {};
	if(config.sentry.dsn && config.sentry.dsn != "") {
		const { Client } = require("raven");
		let client = new Client(config.sentry.dsn);
		client.patchGlobal();
		client.setUserContext({
			app: process.env.APP_NAME
		});
		err.raven = client;
		process.on("unhandledRejection", function (reason) {
			err.raven.captureException(reason);
		});
	}

	(function () {
		var oldCall = Function.prototype.call;
		var newCall = function(self) {
			Function.prototype.call = oldCall;
			console.log('Function called:', this.name);
			var args = Array.prototype.slice.call(arguments, 1);
			var res = this.apply(self, args);
			Function.prototype.call = newCall;
			return res
		}
		Function.prototype.call = newCall;
	})();

	// dynamically load app and launch it
	const { LoadUtil } = require("util/");
	const app = new (LoadUtil.app(process.env.APP_NAME))();

	// init app
	app.init().catch(e => console.log(e));

	// start a repl, probably not that useful anymore
	/*const repl = require("repl");
	const r = repl.start({
		prompt: 'Node.js via stdin> ',
		input: process.stdin,
		output: process.stdout,
		useGlobal: true,
		replMode: repl.REPL_MODE_SLOPPY
	});
	r.context.app = app;*/
	