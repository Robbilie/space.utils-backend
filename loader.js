	
	"use strict";

	var heapdump = require("heapdump");

	require("babel-register")({
		extensions: [".js"],
		plugins: ["transform-async-functions", "transform-export-extensions"],
		presets: ["es2016", "stage-0"]
	});

	require("./index.js");