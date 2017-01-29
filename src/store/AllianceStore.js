
	"use strict";

	const { DBUtil } = require("util/");
	const { EntityStore } = require("store/");

	class AllianceStore extends EntityStore {

		static async get_members (alliance, {} = $(1, { alliance }, "Alliance")) {
			let charStore = await DBUtil.getStore("Character");
			let corporations = await alliance.getCorporations();
			return charStore.getAll({ corporation: { $in: await Promise.all(corporations.map(corporation => corporation.getId())) } });
		}

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
	