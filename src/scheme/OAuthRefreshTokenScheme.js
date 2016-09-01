	
	"use strict";

	const { ObjectId } = require("mongodb");
	
	module.exports = {
		types: {
			_id: 					ObjectId,
			token: 					String,
			expirationDate: 		Number,
			character: 				"Character",
			client: 				"OAuthClient",
			scope: 					Array
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
					foreignField: 	"id",
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
