
	"use strict";

	const { BaseHandler } = require("handler/");

	class KillmailHandler extends BaseHandler {

		static filter () {
			return async (req, res) => {
				let d = Date.now();
				console.log(req.body);
				let store 			= await KillmailHandler.getStore();
				console.log(Date.now() - d);
				let killmails 		= await store.find(
					req.body.filter,
					req.body.options
				);
				console.log(Date.now() - d);
				res.json(await Promise.all(killmails.map(killmail => killmail.toJSON())));
				console.log(Date.now() - d);
			};
		}

		static getById () {
			return async (req, res) => {
				let store 		= await KillmailHandler.getStore();
				let killmail 	= await store.findByKillID(req.params.id - 0);
				res.json(await killmail.toJSON());
			};
		}

		static getOrCreate () {
			return async (req, res) => {
				let store 		= await KillmailHandler.getStore();
				let killmail 	= await store.findOrCreate(req.params.id - 0, req.params.hash);
				res.json(await killmail.toJSON());
			};
		}

	}

	module.exports = KillmailHandler;
