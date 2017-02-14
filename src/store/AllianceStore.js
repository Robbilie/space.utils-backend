
	"use strict";

	const { EntityStore } = require("store/");

	class AllianceStore extends EntityStore {

	}

	AllianceStore.aggregations = [
		{
			$lookup: {
				from: 			"corporations",
				localField: 	"executor_corporation_id",
				foreignField: 	"id",
				as: 			"executor_corporation"
			}
		},
		{
			$unwind: {
				path: 			"$executor_corporation",
				preserveNullAndEmptyArrays: true
			}
		},
		{
			$lookup: {
				from: 			"corporations",
				localField: 	"id",
				foreignField: 	"alliance_id",
				as: 			"corporations"
			}
		}
	];

	module.exports = AllianceStore;
	