
	"use strict";

	const { EntityHandler } = require("handler/");

	class AllianceHandler extends EntityHandler {

		static filter () {
			return async (req, res) => {
				console.log(req.body);
				let store 			= await AllianceHandler.getStore();
				let alliances 		= await store.find(req.body.filter || {}, Object.assign(req.body.options || {}, Math.min((req.body.options ? req.body.options.limit : 250) || 250, 250)));
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
