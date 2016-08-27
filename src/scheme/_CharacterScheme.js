
	"use strict";

	const { _Corporation } = require("model");

	module.exports = {
		types: {
			id: 				Number,
			name: 				String,
			corporation: 		_Corporation
		},
		lookups: [
			{
				from: 			"corporations",
				localField: 	"corporation",
				foreignField: 	"id",
				as: 			"corporation"
			},
			{
				from: 			"alliances",
				localField: 	"corporation.alliance",
				foreignField: 	"id",
				as: 			"corporation.alliance"
			}
		]
	};
