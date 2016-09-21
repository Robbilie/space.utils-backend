
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

		async getMembers (alliance, {} = $(1, { alliance }, "Alliance")) {
			let charStore = await DBUtil.getStore("Character");
			let corporations = await alliance.getCorporations();
			return charStore.getAll({ corporation: { $in: await Promise.all(corporations.map(corporation => corporation.getId())) } });
		}
	}

	module.exports = AllianceStore;