
	"use strict";

	const { EntityHandler } = require("handler/");

	class CorporationHandler extends EntityHandler {

		static getAlliance () {
			return async (req, res) => {
				let store 			= await CorporationHandler.getStore();
				let corporation 	= await store.findOrCreate(req.swagger.params.corporationID.value);
				res.json(await corporation.getAlliance().toJSON());
			};
		}

		static getCeo () {
			return async (req, res) => {
				let store 			= await CorporationHandler.getStore();
				let corporation 	= await store.findOrCreate(req.swagger.params.corporationID.value);
				res.json(await corporation.getCeo().toJSON());
			};
		}

	}

	module.exports = CorporationHandler;
	