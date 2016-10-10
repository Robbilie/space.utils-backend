	
	"use strict";

	try {
		const heapdump = require("heapdump");
	} catch (e) {
		console.log("Couldnt load heapdump");
	}

	process.on('warning', (warning) => {
		console.warn(warning.name);    // Print the warning name
		console.warn(warning.message); // Print the warning message
		console.warn(warning.stack);   // Print the stack trace
	});

	if(process.versions.node.split(".")[0] - 0 < 7) {
		require("babel-register")({
			extensions: [".js"],
			plugins: ["transform-async-functions", "transform-async-to-generator", "transform-export-extensions"]
		});
	}

	require("./index.js");
