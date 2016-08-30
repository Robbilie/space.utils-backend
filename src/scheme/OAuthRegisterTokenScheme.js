
	"use strict";

	const { User } = require("model/");
	const { ObjectId } = require("mongodb");

	module.exports = {
		types: {
			_id: 					ObjectId,
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
