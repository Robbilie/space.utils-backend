
	"use strict";

	const { EntityHandler } = require("handler/");

	class TypeHandler extends EntityHandler {

		static filterTypes () {
			return async (req, res) => {
				console.log(req.body);
				let store 			= await TypeHandler.getStore();
				let types 			= await store.find(
					TypeHandler.sanitize(req.body.filter),
					TypeHandler.limit(req.body.options)
				);
				res.json({ items: await Promise.all(types.map(type => type.toJSON())) });
			};
		}

		static getTypeById () {
			return async (req, res) => {
				let store 		= await TypeHandler.getStore();
				let type 		= await store.findOrCreate(req.swagger.params.typeID.value);
				res.json(await type.toJSON());
			};
		}

	}

	module.exports = TypeHandler;
