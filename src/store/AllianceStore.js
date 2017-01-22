
	"use strict";

	const { DBUtil } = require("util/");
	const { EntityStore } = require("store/");
	const { AllianceTask } = require("task/");

	class AllianceStore extends EntityStore {

		static async find_or_create (alliance_id, {} = $(1, { alliance_id }, "Number")) {

			let alliance = await this.find_by_id(alliance_id);

			if(await alliance.is_null()) {
				await AllianceTask.create({ alliance_id });
				alliance = await this.find_by_id(alliance_id);
			}

			if(await alliance.is_null())
				console.log("MISSING ALLI", alliance_id);

			return alliance.get_future();

		}

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
	