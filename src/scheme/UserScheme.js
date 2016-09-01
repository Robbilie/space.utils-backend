
	"use strict";

	module.exports = {
		types: {
			name: 					String,
			password: 				String,
			characters: 			"CharacterList"
		},
		aggregations: [
			{
				$unwind: {
					path: 			"$characters",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$lookup: {
					from: 			"characters",
					localField: 	"characters",
					foreignField: 	"_id",
					as: 			"characters"
				}
			},
			{
				$unwind: {
					path: 			"$characters",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$group: {
					_id: 			"$_id",
					name: {
						$first: 	"$name"
					},
					password: {
						$first: 	"$password"
					},
					characters: {
						$push: 		"$characters"
					}
				}
			}
		]
	};
