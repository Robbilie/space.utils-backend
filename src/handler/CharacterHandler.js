
	"use strict";

	const { EntityHandler } 	= require("handler/");
	const { Corporation } 		= require("model/");

	class CharacterHandler extends EntityHandler {

		static get_corporation () {
			return ({ swagger: { params: { character_id } } }, { json }) =>
				Corporation
					.find_or_create(character_id.value)
					.get_corporation()
					.toJSON()
					.then(json);
		}

	}

	module.exports = CharacterHandler;
	