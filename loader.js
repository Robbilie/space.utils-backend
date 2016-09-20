	
	"use strict";

	const heapdump = require("heapdump");

	process.on('warning', (warning) => {
		console.warn(warning.name);    // Print the warning name
		console.warn(warning.message); // Print the warning message
		console.warn(warning.stack);   // Print the stack trace
	});

	require("babel-register")({
		extensions: [".js"],
		plugins: ["transform-async-functions", "transform-async-to-generator", "transform-export-extensions"]
	});

	require("./index.js");
