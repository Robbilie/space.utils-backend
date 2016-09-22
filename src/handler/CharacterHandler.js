
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

		static getById () {
			return async (req, res) => {
				let store 		= await CharacterHandler.getStore();
				let character 	= await store.findOrCreate(req.params.id - 0);
				res.json(await character.toJSON());
			};
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
	