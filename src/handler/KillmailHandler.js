
	"use strict";

	const { EntityHandler } 	= require("handler/");
	const { KillmailStore } 	= require("store/");

	class KillmailHandler extends EntityHandler {

		static get_by_id_and_hash () {
			return ({ swagger: { params: { killmail_id, hash } } }, { json }) =>
				KillmailStore
					.find_or_create(killmail_id.value, hash.value)
					.serialize()
					.then(json);
		}

	}

	module.exports = KillmailHandler;
