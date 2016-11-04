
	"use strict";

	const { EntityHandler } = require("handler/");

	class FactionHandler extends EntityHandler {

		static filterFactions () {
			return async (req, res) => {
				console.log(req.body);
				let store 			= await FactionHandler.getStore();
				let factions 		= await store.find(
					FactionHandler.sanitize(req.body.filter),
					FactionHandler.limit(req.body.options)
				);
				res.json({ items: await Promise.all(factions.map(faction => type.toJSON())) });
			};
		}

		static getFactionById () {
			return async (req, res) => {
				let store 		= await FactionHandler.getStore();
				let faction 	= await store.findOrCreate(req.swagger.params.typeID.value);
				res.json(await faction.toJSON());
			};
		}

	}

	module.exports = FactionHandler;
