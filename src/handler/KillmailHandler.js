
	"use strict";

	const { BaseHandler } = require("handler/");

	class KillmailHandler extends BaseHandler {

		static filter () {
			return async (req, res) => {
				console.log(req.body);
				let store 			= await KillmailHandler.getStore();
				let killmails 		= await store.find(
					KillmailHandler.sanitize(req.body.filter),
					KillmailHandler.limit(req.body.options)
				);
				res.json(await Promise.all(killmails.map(killmail => killmail.toJSON())));
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
