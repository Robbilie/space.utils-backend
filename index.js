
	"use strict";

	process.env.UV_THREADPOOL_SIZE = 128;

	process.env.NODE_PATH = __dirname + "/src";
	require("module").Module._initPaths();

	require("lib/extendings")();

	const raven 				= require("raven");
	const config = require("util/../../config/");

	global.err = {};
	if(config.sentry.dsn && config.sentry.dsn != "") {
		var client = new raven.Client(config.sentry.dsn);
		client.patchGlobal();
		client.setUserContext({
			app: process.argv[2]
		});
		err.raven = client;
	}

	const { LoadUtil } = require("util/");

	console.log(process.argv[2]);
	
	const App = LoadUtil.app(process.argv[2]);
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