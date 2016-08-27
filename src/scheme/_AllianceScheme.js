	
	"use strict";
	
	const { _Corporation } = require("model");
	
	module.exports = {
		types: {
			id: 				Number,
			name: 				String,
			executor: 			_Corporation
		},
		lookups: [
			{
				from: 			"corporations",
				localField: 	"executor",
				foreignField: 	"id",
				as: 			"executor"
			}
		]
	};
