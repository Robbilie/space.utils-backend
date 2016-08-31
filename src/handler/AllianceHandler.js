
	"use strict";

	const { EntityHandler } = require("handler/");

	class AllianceHandler extends EntityHandler {

		static filter () {
			return async (req, res) => {
				let store 		= await AllianceHandler.getStore();
				let alliances 	= await store.find(req.body.filter);
				res.json(await Promise.all(alliances.map(alliance => alliance.toJSON())));
			};
		}

		static getById () {
			return async (req, res) => {
				let store 		= await AllianceHandler.getStore();
				let alliance 	= await store.findById(req.params.id);
				res.json(await alliance.toJSON());
			};
		}

		static getExecutor () {
			return async (req, res) => {
				let store 		= await AllianceHandler.getStore();
				let alliance 	= await store.findById(req.params.id);
				res.json(await alliance.getExecutor().toJSON());
			};
		}

		static getCorporations () {
			return async (req, res) => {
				let store 		= await AllianceHandler.getStore();
				let alliance 	= await store.findById(req.params.id);
				res.json(await Promise.all((await alliance.getCorporations()).map(corporation => corporation.toJSON())));
			};
		}

	}

	module.exports = AllianceHandler;
