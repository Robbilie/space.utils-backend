
	"use strict";

	const { EntityHandler } 	= require("handler/");
	const { KillmailStore } 	= require("store/");

	class KillmailHandler extends EntityHandler {

		static async get_by_id_and_hash ({ swagger: { params: { killmail_id, hash } } }, res) {
			res.json(await KillmailStore
				.find_or_create(killmail_id.value, hash.value)
				.serialize());
		}

	}

	module.exports = KillmailHandler;
