
	"use strict";

	const { EntityHandler } = require("handler/");

	class CorporationHandler extends EntityHandler {

		static filter () {
			return async (req, res) => {
				console.log(req.body);
				let store 			= await CorporationHandler.getStore();
				let corporations 	= await store.find(req.body.filter || {}, Object.assign(req.body.options || {}, { limit: req.body.options ? Math.min(req.body.options.limit || 250, 250) : 250 }));
				res.json(await Promise.all(corporations.map(corporation => corporation.toJSON())));
			};
		}

		static getById () {
			return async (req, res) => {
				let store 			= await CorporationHandler.getStore();
				let corporation 	= await store.findOrCreate(req.params.id - 0);
				res.json(await corporation.toJSON());
			};
		}

		static getAlliance () {
			return async (req, res) => {
				let store 			= await CorporationHandler.getStore();
				let corporation 	= await store.findOrCreate(req.params.id - 0);
				res.json(await corporation.getAlliance().toJSON());
			};
		}

		static getCeo () {
			return async (req, res) => {
				let store 			= await CorporationHandler.getStore();
				let corporation 	= await store.findOrCreate(req.params.id - 0);
				res.json(await corporation.getCeo().toJSON());
			};
		}

	}

	module.exports = CorporationHandler;
	