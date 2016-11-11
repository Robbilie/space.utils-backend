
	"use strict";

	const { DBUtil }				= require("util/");
	const { EntityStore } 			= require("store/");
	const { AllianceJsonTask } 		= require("task/");

	class AllianceStore extends EntityStore {

		async findOrCreate (id, {} = $(1, { id }, "Number")) {
			try {

				let alliance = await this.findById(id);
				
				if(await alliance.isNull()) {
					console.log("alli", !!alliance, id);
					await AllianceJsonTask.create({ allianceID: id });
					alliance = await this.findById(id);
				}
				
				return alliance;

			} catch (e) { console.log(e, new Error()); }
		}

		async get_members (alliance, {} = $(1, { alliance }, "Alliance")) {
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
	