
	"use strict";

	const { EntityHandler } 	= require("handler/");
	const { CorporationStore } 	= require("store/");

	class CharacterHandler extends EntityHandler {

		static post_characters_filter (...args) {
			return super.post_filter(...args);
		}

		static get_characters_character_id (...args) {
			return super.get_by_id(...args);
		}

		static async get_characters_character_id_corporation ({ swagger: { params: { character_id } } }, res) {
			/*res.json(await CorporationStore
				.find_or_create(character_id.value)
				.get_corporation());*/
		}

	}

	module.exports = CharacterHandler;
	