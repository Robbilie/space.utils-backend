
	"use strict";

	const { PatchUtil } 	= require("util/");
	const { Entity } 		= require("model/");

	class Alliance extends Entity {

		getExecutor () {}

		getCorporations () {}

		getMembers () {
			return this.getStore().getMembers(this);
		}

	}

	Alliance.types = {
		id: 			Number,
		name: 			String,
		shortName: 		String,
		executor: 		"Corporation",
		corporations: 	"CorporationList",
		updated: 		Number
	};
	Alliance.aggregations = [
		{
			$lookup: {
				from: 			"corporations",
				localField: 	"executorID",
				foreignField: 	"id",
				as: 			"executor"
			}
		},
		{
			$unwind: {
				path: 			"$executor",
				preserveNullAndEmptyArrays: true
			}
		},
		{
			$lookup: {
				from: 			"corporations",
				localField: 	"id",
				foreignField: 	"allianceID",
				as: 			"corporations"
			}
		}
	];

	PatchUtil.model(Alliance);

	module.exports = Alliance;
