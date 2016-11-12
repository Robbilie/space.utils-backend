
	"use strict";

	const { EntityHandler } 	= require("handler/");
	const { CorporationStore } 	= require("store/");

	class CharacterHandler extends EntityHandler {

		static get_corporation () {
			return ({ swagger: { params: { character_id } } }, { json }) =>
				CorporationStore
					.find_or_create(character_id.value)
					.get_corporation()
					.serialize()
					.then(json);
		}

	}

	module.exports = CharacterHandler;
	