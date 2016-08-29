
	"use strict";

	const { CharacterStore } = require("store/");

	class CharacterHandler {

		static filter () {
			return async (req, res) => {
				let characters = await CharacterStore.find(req.body.filter);
				res.json(await Promise.all(characters.map(character => character.toJSON())));
			};
		}

		static getById () {
			return async (req, res) => {
				let character = await CharacterStore.findById(req.params.id);
				res.json(await character.toJSON());
			};
		}

		static getCorporation () {
			return async (req, res) => {
				let character = await CharacterStore.findById(req.params.id);
				res.json(await character.getCorporation().toJSON());
			};
		}

	}

	module.exports = CharacterHandler;
	