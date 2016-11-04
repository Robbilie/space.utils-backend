
	"use strict";

	const { EntityHandler } = require("handler/");

	class KillmailHandler extends EntityHandler {

		static getByIdAndHash () {
			return async (req, res) => {
				let store 		= await KillmailHandler.getStore();
				let killmail 	= await store.findOrCreate(req.swagger.params.killID.value, req.swagger.params.hash.value);
				res.json(await killmail.toJSON());
			};
		}

	}

	module.exports = KillmailHandler;
