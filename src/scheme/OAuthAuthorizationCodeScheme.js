
	"use strict";

	const { Character, OAuthClient } = require("model/");
	const { ObjectId } = require("mongodb");

	module.exports = {
		types: {
			_id: 					ObjectId,
			token: 					String,
			redirect: 				String,
			scope: 					Array,
			character: 				Character,
			client: 				OAuthClient
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
