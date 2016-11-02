
	"use strict";

	const EntityHandler = require("handler/EntityHandler");

	class CorporationHandler extends EntityHandler {

		static filter () {
			return async (req, res) => {
				console.log(req.body);
				let store 			= await CorporationHandler.getStore();
				let corporations 	= await store.find(
					CorporationHandler.sanitize(req.body.filter),
					CorporationHandler.limit(req.body.options)
				);
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
	