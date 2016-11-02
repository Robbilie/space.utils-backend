
	"use strict";

	const { EntityHandler } = require("handler/");

	class SystemHandler extends EntityHandler {

		static filterSystems () {
			return async (req, res) => {
				console.log(req.body);
				let store 			= await SystemHandler.getStore();
				let systems 		= await store.find(
					SystemHandler.sanitize(req.body.filter),
					SystemHandler.limit(req.body.options)
				);
				res.json(await Promise.all(systems.map(system => system.toJSON())));
			};
		}

		static getSystemById () {
			return async (req, res) => {
				let store 		= await SystemHandler.getStore();
				let system 		= await store.findOrCreate(req.swagger.params.systemID.value);
				res.json(await system.toJSON());
			};
		}

	}

	module.exports = SystemHandler;
