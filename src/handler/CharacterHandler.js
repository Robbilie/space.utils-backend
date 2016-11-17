
	"use strict";

	const { EntityHandler } 	= require("handler/");
	const { CorporationStore } 	= require("store/");

	class CharacterHandler extends EntityHandler {

		static async get_corporation ({ swagger: { params: { character_id } } }, res) {
			res.json(await CorporationStore
				.find_or_create(character_id.value)
				.get_corporation()
				.serialize());
		}

	}

	module.exports = CharacterHandler;
	