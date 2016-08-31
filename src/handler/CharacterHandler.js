
	"use strict";

	const { EntityHandler } = require("handler/");

	class CharacterHandler extends EntityHandler {

		static filter () {
			return async (req, res) => {
				let store 		= await CharacterHandler.getStore();
				let characters 	= await store.find(req.body.filter);
				res.json(await Promise.all(characters.map(character => character.toJSON())));
			};
		}

		static getById () {
			return async (req, res) => {
				let store 		= await CharacterHandler.getStore();
				let character 	= await store.findById(req.params.id);
				res.json(await character.toJSON());
			};
		}

		static getCorporation () {
			return async (req, res) => {
				let store 		= await CharacterHandler.getStore();
				let character 	= await store.findById(req.params.id);
				res.json(await character.getCorporation().toJSON());
			};
		}

	}

	module.exports = CharacterHandler;
	