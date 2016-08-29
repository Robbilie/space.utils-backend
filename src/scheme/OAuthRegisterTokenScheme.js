
	"use strict";

	const { User } = require("model");

	module.exports = {
		types: {
			token: 					String,
			expirationDate: 		Number,
			user: 					User
		},
		aggregations: [
			{
				$lookup: {
					from: 			"users",
					localField: 	"user",
					foreignField: 	"_id",
					as: 			"user"
				}
			},
			{
				$unwind: {
					path: 			"$user",
					preserveNullAndEmptyArrays: true
				}
			}
		]
	};
