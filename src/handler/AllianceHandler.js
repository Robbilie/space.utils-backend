
	"use strict";

	const EntityHandler = require("handler/EntityHandler");

	class AllianceHandler extends EntityHandler {

		static filter () {
			return async (req, res) => {
				console.log(req.body);
				let store 			= await AllianceHandler.getStore();
				let alliances 		= await store.find(
					AllianceHandler.sanitize(req.body.filter),
					AllianceHandler.limit(req.body.options)
				);
				res.json(await Promise.all(alliances.map(alliance => alliance.toJSON())));
			};
		}

		static getById () {
			return async (req, res) => {
				let store 		= await AllianceHandler.getStore();
				let alliance 	= await store.findOrCreate(req.params.id - 0);
				res.json(await alliance.toJSON());
			};
		}

		static getExecutor () {
			return async (req, res) => {
				let store 		= await AllianceHandler.getStore();
				let alliance 	= await store.findById(req.params.id - 0);
				res.json(await alliance.getExecutor().toJSON());
			};
		}

		static getCorporations () {
			return async (req, res) => {
				let store 		= await AllianceHandler.getStore();
				let alliance 	= await store.findById(req.params.id - 0);
				res.json(await alliance.getCorporations().toJSON());
			};
		}

	}

	module.exports = AllianceHandler;
