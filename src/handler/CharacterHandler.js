
	"use strict";

	const { EntityHandler } = require("handler/");

	class CharacterHandler extends EntityHandler {

		static filter () {
			return async (req, res) => {
				console.log(req.body);
				let store 			= await CharacterHandler.getStore();
				let characters 		= await store.find(
					CharacterHandler.sanitize(req.body.filter),
					CharacterHandler.limit(req.body.options)
				);
				res.json(await Promise.all(characters.map(character => character.toJSON())));
			};
		}

		static getCharacterByID ({ swagger }, res, next) {
			console.log(swagger);
			return (async ({ characterID }, res, next) => {
				console.log(characterID);
				let store 		= await CharacterHandler.getStore();
				let character 	= await store.findOrCreate(characterID);
				res.json(await character.toJSON());
			})(swagger.params, res, next);
		}

		static getCorporation () {
			return async (req, res) => {
				let store 		= await CharacterHandler.getStore();
				let character 	= await store.findOrCreate(req.params.id - 0);
				res.json(await character.getCorporation().toJSON());
			};
		}

	}

	module.exports = CharacterHandler;
	