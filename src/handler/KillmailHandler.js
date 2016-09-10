
	"use strict";

	const { BaseHandler } = require("handler/");

	class KillmailHandler extends BaseHandler {

		static filter () {
			return async (req, res) => {
				console.log(req.body);
				let store 			= await KillmailHandler.getStore();
				let killmails 		= await store.find(req.body.filter || {}, Object.assign(req.body.options || {}, Math.min((req.body.options ? req.body.options.limit : 250) || 250, 250)));
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
