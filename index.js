
	"use strict";

	process.env.UV_THREADPOOL_SIZE = 128;

	process.env.NODE_PATH = __dirname + "/src";
	require("module").Module._initPaths();

	require("lib/extendings")();

	try {
		const heapdump = require("heapdump");
	} catch (e) {
		console.log("Couldn't load heapdump");
	}

	process.on('warning', (warning) => {
		console.warn(warning.name);    // Print the warning name
		console.warn(warning.message); // Print the warning message
		console.warn(warning.stack);   // Print the stack trace
	});
	
	global.config = require("js-yaml").safeLoad(require("fs").readFileSync("/etc/secrets/config.yaml"));

	const raven 				= require("raven");

	global.err = {};
	if(config.sentry.dsn && config.sentry.dsn != "") {
		var client = new raven.Client(config.sentry.dsn);
		client.patchGlobal();
		client.setUserContext({
			app: process.env.APP_NAME
		});
		err.raven = client;
	}

	const { LoadUtil } = require("util/");
	
	const App = LoadUtil.app(process.env.APP_NAME);
	const app = new App();

	/* REPL */

	const repl = require("repl");
	const r = repl.start({
		prompt: 'Node.js via stdin> ',
		input: process.stdin,
		output: process.stdout,
		useGlobal: true,
		replMode: repl.REPL_MODE_SLOPPY
	});
	r.context.app = app;
	