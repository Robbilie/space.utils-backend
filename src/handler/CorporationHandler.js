
	"use strict";

	const { CorporationStore } = require("store");

	class CorporationHandler {

		static filter () {
			return async (req, res) => {
				let corporations = await CorporationStore.find(req.body.filter);
				res.json(await Promise.all(corporations.map(corporation => corporation.toJSON())));
			};
		}

		static getById () {
			return async (req, res) => {
				let corporation = await CorporationStore.findById(req.params.id);
				res.json(await corporation.toJSON());
			};
		}

		static getAlliance () {
			return async (req, res) => {
				let corporation = await CorporationStore.findById(req.params.id);
				res.json(await corporation.getAlliance().toJSON());
			};
		}

		static getCeo () {
			return async (req, res) => {
				let corporation = await CorporationStore.findById(req.params.id);
				res.json(await corporation.getCeo().toJSON());
			};
		}

	}

	module.exports = CorporationHandler;
	