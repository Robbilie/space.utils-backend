
	"use strict";

	const { EntityHandler } 	= require("handler/");
	const { KillmailStore } 	= require("store/");

	class KillmailHandler extends EntityHandler {

		static post_killmails_filter (...args) {
			return super.post_filter(...args);
		}

		static get_killmails_killmail_id (...args) {
			return super.get_by_id(...args);
		}

		static async get_killmails_killmail_id_killmail_hash ({ swagger: { params: { killmail_id, killmail_hash } } }, res) {
			res.json(await KillmailStore
				.find_by_pk(killmail_id.value, killmail_hash.value));
		}

	}

	module.exports = KillmailHandler;
