
	"use strict";

	const IdAndNameStore 			= require("store/IdAndNameStore");
	const CharacterInfoTask 		= require("task/CharacterInfoTask");
	const CharacterAffiliationTask 	= require("task/CharacterAffiliationTask");
	const DBUtil 					= require("util/DBUtil");

	class CharacterStore extends IdAndNameStore {

		aggregate (data, lookups = ["corporation", "corporation.alliance"]) {
			console.log(data);
			return super.aggregate(data, lookups);
		}

		async getOrCreate (id, unverified, {} = $(1, {id}, "Number")) {
			let character = await this.getById(id);
			
			if(character)
				return character;
			
			if(!unverified)
				await CharacterInfoTask.create({ characterID: id });
			
			character = await this.getById(id);

			if(!character)
			console.log("MISSING CHAR", id);

			if(character) {
				let taskStore 	= await DBUtil.getStore("Task");

				let task = await taskStore.findAndModify({ "info.name": "CharacterAffiliationTask", $where: "this.data.ids.length < 250" }, [], { $push: { "data.ids": id } });
				if(!task)
					await CharacterAffiliationTask.create({ ids: [id] });
			}

			return character;
		}

	}

	module.exports = CharacterStore;