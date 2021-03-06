
	"use strict";

	// allow relative imports
	process.env.NODE_PATH = `${__dirname}/src`;
	require("module").Module._initPaths();

	// preload some basic modifications
	require("lib/extendings")();

	Error.stackTraceLimit = Infinity;

	// import the k8s secrets into a global variable
	try {
		global.config = require("js-yaml").safeLoad(new Buffer(require("fs").readFileSync("/etc/secrets/config.yaml"), "base64"));
	} catch (e) {
		console.log("no config");
	}

	// setup sentry if dsn is set
	if(global.config && config.sentry && config.sentry.dsn && config.sentry.dsn !== "") {

		const Raven = require("raven");
		Raven.config(config.sentry.dsn, { captureUnhandledRejections: true }).install();
		Raven.setContext({
			app: process.env.APP_NAME
		});

	}

	// dynamically load app and launch it
	const { LoadUtil } = require("util/");
	const app = new (LoadUtil.app(process.env.APP_NAME))();

	// init app
	app.init().catch(e => console.log("app level:", e));

	// start a repl, probably not that useful anymore
	if (process.env.REPL === "true") {
		const repl = require("repl");
		const r = repl.start({
			prompt: 'Node.js via stdin> ',
			input: process.stdin,
			output: process.stdout,
			useGlobal: true,
			replMode: repl.REPL_MODE_SLOPPY
		});
		r.context.app = app;
	}
