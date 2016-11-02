
	"use strict";

	const { EntityHandler } = require("handler/");

	class CorporationHandler extends EntityHandler {

		static filterCorporations () {
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

		static getCorporationById () {
			return async (req, res) => {
				let store 			= await CorporationHandler.getStore();
				let corporation 	= await store.findOrCreate(req.swagger.params.corporationID.value);
				res.json(await corporation.toJSON());
			};
		}

		static getCorporationsAlliance () {
			return async (req, res) => {
				let store 			= await CorporationHandler.getStore();
				let corporation 	= await store.findOrCreate(req.swagger.params.corporationID.value);
				res.json(await corporation.getAlliance().toJSON());
			};
		}

		static getCorporationsCeo () {
			return async (req, res) => {
				let store 			= await CorporationHandler.getStore();
				let corporation 	= await store.findOrCreate(req.swagger.params.corporationID.value);
				res.json(await corporation.getCeo().toJSON());
			};
		}

	}

	module.exports = CorporationHandler;
	