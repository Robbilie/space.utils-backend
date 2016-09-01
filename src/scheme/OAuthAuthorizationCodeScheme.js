
	"use strict";

	const { ObjectId } = require("mongodb");

	module.exports = {
		types: {
			_id: 					ObjectId,
			token: 					String,
			redirect: 				String,
			scope: 					Array,
			character: 				"Character",
			client: 				"OAuthClient"
		},
		aggregations: [
			{
				$lookup: {
					from: 			"characters",
					localField: 	"character",
					foreignField: 	"id",
					as: 			"character"
				}
			},
			{
				$unwind: {
					path: 			"$character",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$lookup: {
					from: 			"oauthclients",
					localField: 	"client",
					foreignField: 	"_id",
					as: 			"client"
				}
			},
			{
				$unwind: {
					path: 			"$client",
					preserveNullAndEmptyArrays: true
				}
			}
		]
	};
