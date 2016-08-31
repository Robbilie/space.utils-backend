
	"use strict";

	const { EntityHandler } = require("handler/");

	class CorporationHandler extends EntityHandler {

		static filter () {
			return async (req, res) => {
				let store 			= await CorporationHandler.getStore();
				let corporations = await store.find(req.body.filter);
				res.json(await Promise.all(corporations.map(corporation => corporation.toJSON())));
			};
		}

		static getById () {
			return async (req, res) => {
				let store 			= await CorporationHandler.getStore();
				let corporation 	= await store.findById(req.params.id - 0);
				res.json(await corporation.toJSON());
			};
		}

		static getAlliance () {
			return async (req, res) => {
				let store 			= await CorporationHandler.getStore();
				let corporation 	= await store.findById(req.params.id - 0);
				res.json(await corporation.getAlliance().toJSON());
			};
		}

		static getCeo () {
			return async (req, res) => {
				let store 			= await CorporationHandler.getStore();
				let corporation 	= await store.findById(req.params.id - 0);
				res.json(await corporation.getCeo().toJSON());
			};
		}

	}

	module.exports = CorporationHandler;
	