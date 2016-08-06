	
	"use strict";

	var heapdump = require("heapdump");

	require("babel-register")({
		extensions: [".js"],
		plugins: ["transform-async-functions", "transform-async-to-generator", "transform-export-extensions"]
	});

	require("./index.js");