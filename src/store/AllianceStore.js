
	"use strict";

	const { DBUtil } = require("util/");
	const { EntityStore } = require("store/");
	const { AllianceTask } = require("task/");

	class AllianceStore extends EntityStore {

		static async find_or_create (alliance_id, {} = $(1, { alliance_id }, "Number")) {
			try {

				let alliance = await this.find_by_id(alliance_id);
				
				if(await alliance.is_null())
					await AllianceTask.create({ alliance_id });

				alliance = await this.find_by_id(alliance_id);

				if(await alliance.is_null())
					console.log("MISSING ALLI", alliance_id);

				return alliance;

			} catch (e) { console.log(e, new Error()); }
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

	module.exports = AllianceStore;
	