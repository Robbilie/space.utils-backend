
	"use strict";

	const IdAndNameStore 			= require("store/IdAndNameStore");
	const CharacterInfoTask 		= require("task/CharacterInfoTask");
	const CharacterAffiliationTask 	= require("task/CharacterAffiliationTask");

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

			if(character) {
				let taskStore 	= await DBUtil.getStore("Task");
				let task 		= await taskStore.get({ "info.name": "CharacterAffiliationTask", $where: "this.data.ids.length < 250" });
				if(task)
					await taskStore.findAndModify({ _id: task.get_id() }, [], { $push: { "data.ids": id }, $set: { info: Object.assign(task.getInfo(), { timestamp: 0 }) } });
			}

			return character;
		}

	}

	module.exports = CharacterStore;