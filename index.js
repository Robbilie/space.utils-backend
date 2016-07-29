
	"use strict";

	process.env.NODE_PATH = __dirname + "/src";
	require("module").Module._initPaths();

	require("lib/extendings")();

	const LoadUtil = require("util/LoadUtil");

	const app = new (LoadUtil.app(process.argv[2]));

	const DBUtil = require("util/DBUtil");




	const repl = require("repl");

	const r = repl.start({
		prompt: 'Node.js via stdin> ',
		input: process.stdin,
		output: process.stdout,
		useGlobal: true,
		replMode: repl.REPL_MODE_SLOPPY
	});
	r.context.app = app;


	/*

	DBUtil.getOplogCursor().then(cursor => {
		const stream = cursor.stream();
			stream.on("data", d => console.log(d));
	});

	DBUtil.getStore("Character").then(store => store.getUpdates()).then(cursor => {
		let stream = cursor.stream();
			stream.on("data", d => console.log("char:", d));

	}).catch(e => console.log(e));

	*/