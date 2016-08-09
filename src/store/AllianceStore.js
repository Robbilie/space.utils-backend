
	"use strict";

	const DBUtil 					= require("util/DBUtil");
	const IdAndNameStore 			= require("store/IdAndNameStore");
	const AllianceJsonTask 			= require("task/AllianceJsonTask");
	const Corporation 				= require("model/Corporation");

	class AllianceStore extends IdAndNameStore {

		aggregate (data, lookups = [{ from: "corporations", localField: "executor" }, { from: "corporations", localField: "_id", foreignField: "alliance", as: "corporations" }]) {
			return super.aggregate(
				data, 
				lookups, 
				doc => Object.assign(
					doc, 
					doc.executor ? { executor: new Corporation(doc.executor) } : {}, 
					doc.corporations ? { corporations: doc.corporations.map(corporation => new Corporation(corporation)) } : {}
				)
			);
		}

		async getOrCreate (id, unverified, {} = $(1, {id}, "Number")) {
			try {

				let alliance = await this.getById(id);
				
				if(!alliance) {
					console.log("alli", !!alliance, id);
					if(!unverified)
						await AllianceJsonTask.create({ allianceID: id });
					alliance = await this.getById(id);
				}
				
				return alliance;

			} catch (e) { console.log(e)}
		}

		async getMembers (alliance, {} = $(1, {alliance}, "Alliance")) {
			let charStore = await DBUtil.getStore("Character");
			let corporations = await alliance.getCorporations();
			return charStore.getAll({ corporation: { $in: corporations.map(corporation => corporation.get_id()) } });
		}
	}

	module.exports = AllianceStore;