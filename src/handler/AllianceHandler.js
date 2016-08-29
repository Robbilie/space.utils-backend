
	"use strict";

	const { AllianceStore } = require("store");

	class AllianceHandler {

		static filter () {
			return async (req, res) => {
				let alliances = await AllianceStore.find(req.body.filter);
				res.json(await Promise.all(alliances.map(alliance => alliance.toJSON())));
			};
		}

		static getById () {
			return async (req, res) => {
				let alliance = await AllianceStore.findById(req.params.id);
				res.json(await alliance.toJSON());
			};
		}

		static getExecutor () {
			return async (req, res) => {
				let alliance = await AllianceStore.findById(req.params.id);
				res.json(await alliance.getExecutor().toJSON());
			};
		}

		static getCorporations () {
			return async (req, res) => {
				let alliance = await AllianceStore.findById(req.params.id);
				res.json(await Promise.all((await alliance.getCorporations()).map(corporation => corporation.toJSON())));
			};
		}

	}

	module.exports = AllianceHandler;
	