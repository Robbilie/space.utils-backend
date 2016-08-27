
	"use strict";

	const { _Character, _Alliance } = require("model");

	module.exports = {
		types: {
			id: 				Number,
			name: 				String,
			ceo: 				_Character,
			alliance: 			_Alliance
		},
		lookups: [
			{
				from: 			"alliances",
				localField: 	"alliance",
				foreignField: 	"id",
				as: 			"alliance"
			},
			{
				from: 			"characters",
				localField: 	"ceo",
				foreignField: 	"id",
				as: 			"ceo"
			}
		]
	};
