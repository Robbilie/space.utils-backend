
	"use strict";

	const { EntityHandler } = require("handler/");

	class CharacterHandler extends EntityHandler {

		static getCorporation () {
			return async (req, res) => {
				let store 		= await CharacterHandler.getStore();
				let character 	= await store.findOrCreate(req.swagger.params.characterID.value);
				res.json(await character.getCorporation().toJSON());
			};
		}

	}

	module.exports = CharacterHandler;
	