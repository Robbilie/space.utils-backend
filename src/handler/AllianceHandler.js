
	"use strict";

	const { EntityHandler } = require("handler/");

	class AllianceHandler extends EntityHandler {

		static filterAlliances () {
			return async (req, res) => {
				console.log(req.body);
				let store 			= await AllianceHandler.getStore();
				let alliances 		= await store.find(
					AllianceHandler.sanitize(req.body.filter),
					AllianceHandler.limit(req.body.options)
				);
				res.json({ items: await Promise.all(alliances.map(alliance => alliance.toJSON())) });
			};
		}

		static getAllianceById () {
			return async (req, res) => {
				let store 		= await AllianceHandler.getStore();
				let alliance 	= await store.findOrCreate(req.swagger.params.allianceID.value);
				res.json(await alliance.toJSON());
			};
		}

		static getAlliancesExecutor () {
			return async (req, res) => {
				let store 		= await AllianceHandler.getStore();
				let alliance 	= await store.findById(req.swagger.params.allianceID.value);
				res.json(await alliance.getExecutor().toJSON());
			};
		}

		static getAlliancesCorporations () {
			return async (req, res) => {
				let store 		= await AllianceHandler.getStore();
				let alliance 	= await store.findById(req.swagger.params.allianceID.value);
				res.json(await alliance.getCorporations().toJSON());
			};
		}

	}

	module.exports = AllianceHandler;
