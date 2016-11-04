
	"use strict";

	const { EntityHandler } = require("handler/");

	class AllianceHandler extends EntityHandler {

		static getExecutor () {
			return async (req, res) => {
				let store 		= await AllianceHandler.getStore();
				let alliance 	= await store.findById(req.swagger.params.allianceID.value);
				res.json(await alliance.getExecutor().toJSON());
			};
		}

		static getCorporations () {
			return async (req, res) => {
				let store 		= await AllianceHandler.getStore();
				let alliance 	= await store.findById(req.swagger.params.allianceID.value);
				res.json(await alliance.getCorporations().toJSON());
			};
		}

	}

	module.exports = AllianceHandler;
