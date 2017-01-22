
	"use strict";

	const { BaseTask } = require("task/");
	const { ESIUtil } = require("util/");

	class CorporationTask extends BaseTask {

		async start () {

			let start = Date.now();
			let times = [];

			let client = await ESIUtil.get_client();

			times.push(Date.now() - start);

			let [corporation_response, history_response] = await Promise.all([
				client.Corporation.get_corporations_corporation_id(this.get_data()),
				client.Corporation.get_corporations_corporation_id_alliancehistory(this.get_data())
			]);

			times.push(Date.now() - start);

			let { corporation_name, name, ticker, member_count, ceo_id, alliance_id } = corporation_response.obj;
				name = name || corporation_name;

			await this.get_store().update(
				{ id: this.get_data().corporation_id },
				{
					$set: {
						name,
						ticker,
						member_count,
						ceo_id,
						alliance_id,
						alliance_history: history_response.obj
					},
					$unset: {
						[alliance_id ? "unset" : "alliance_id"]: true
					}
				},
				{ upsert: true, w: 0 }
			);

			times.push(Date.now() - start);

			// get alliance
			if(alliance_id)
				BaseTask.create_task("Alliance", { alliance_id }, true);

			times.push(Date.now() - start);

			// get ceo
			if(ceo_id == 1) {
				// dead corp
			} else if(ceo_id >= 3000000 && ceo_id < 4000000) {
				// is npc ceo
			} else {
				BaseTask.create_task("Character", { character_id: ceo_id }, true);
			}

			times.push(Date.now() - start);

			// get all alliances
			history_response.obj.filter(({ alliance }) => !!alliance).forEach(({ alliance: { alliance_id } }) => BaseTask.create_task("Alliance", { alliance_id }, true));

			times.push(Date.now() - start);

			await this.update({
				expires: new Date(corporation_response.headers.expires).getTime()
			});

			times.push(Date.now() - start);

			//console.log("corporation", ...times);

		}

	}

	module.exports = CorporationTask;
