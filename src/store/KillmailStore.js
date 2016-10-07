
	"use strict";

	const { Store } 				= require("store/");
	const { PatchUtil } 			= require("util/");
	const { KillmailJsonTask } 		= require("task/");

	class KillmailStore extends Store {

		constructor (db) {
			super(db, null, "kms");
		}

		async findOrCreate (id, hash, {} = $(1, { id }, "Number")) {
			try {

				let killmail = await this.findByKillID(id);

				if(await killmail.isNull()) {
					//console.log("killmail", !!killmail, id);
					await KillmailJsonTask.create({ killID: id, hash });
					killmail = await this.findByKillID(id);
				}

				return killmail;

			} catch (e) { console.log(e, new Error()); }
		}

		findByKillID () {}

	}

	PatchUtil.store(KillmailStore);

	module.exports = KillmailStore;