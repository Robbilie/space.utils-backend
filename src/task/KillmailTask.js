
	"use strict";

	const { BaseTask } 				= require("task/");
	const { ESIUtil } 				= require("util/");

	class KillmailTask extends BaseTask {

		async start () {

			let client = await ESIUtil.get_client();

			let killmail_response = await client.Killmails.get_killmails_killmail_id_killmail_hash(this.get_data());

			let killmail = killmail_response.obj;
				delete killmail.killmail_id;
				killmail.id 				= this.get_data().killmail_id;
				killmail.hash 				= this.get_data().killmail_hash;
				killmail.attacker_count 	= killmail.attackers.length;
				killmail.time 				= new Date(killmail.killmail_time).getTime();
				delete killmail.killmail_time;

			await this.get_store().insert(killmail, { w: 0 });

			await this.destroy();

		}

	}

	module.exports = KillmailTask;
