
	"use strict";

	const { EntityStore } 			= require("store/");
	const {
		CharacterInfoTask,
		NPCAffiliationTask
	} 	= require("task/");

	class CharacterStore extends EntityStore {

		async findOrCreate (id, {} = $(1, { id }, "Number")) {

			try {

				let character = await this.findById(id);
				
				if(await character.isNull()) {
					await CharacterInfoTask.create({ characterID: id });
					character = await this.findById(id);
				}

				if(await character.isNull()) {
					await NPCAffiliationTask.create({ ids: [id] });
					character = await this.findById(id);
					console.log("NPC CHAR?", id);
				}

				if(await character.isNull()) {
					console.log("MISSING CHAR", id);
				}

				return character;

			} catch (e) { console.log(e, new Error()); }

		}

	}

	module.exports = CharacterStore;
