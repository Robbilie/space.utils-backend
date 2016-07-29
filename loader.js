	
	"use strict";

	require("babel-register")({
		extensions: [".es6", ".es", ".jsx", ".js"],
		plugins: ['transform-runtime'],
		presets: ["es2015", "stage-0"]
	});

	require("./index.js");