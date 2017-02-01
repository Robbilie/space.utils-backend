
	"use strict";

	const { BaseTask } = require("task/");
	const { ESIUtil } = require("util/");
	const { CorporationStore } = require("store/");

	class AllianceTask extends BaseTask {

		async start () {

			let client = await ESIUtil.get_client();

			let [alliance_response, corporations_response] = await Promise.all([
				client.Alliance.get_alliances_alliance_id(this.get_data()),
				client.Alliance.get_alliances_alliance_id_corporations(this.get_data())
			]);

			let alliance =  alliance_response.obj;
				alliance.id = this.get_data().alliance_id;
				alliance.name = alliance.name || alliance.alliance_name;
				delete alliance.alliance_name;
				alliance.date_founded = new Date(alliance.date_founded).getTime();
				alliance.executor_corporation_id = alliance.executor_corporation_id || alliance.executor_corp;
				delete alliance.executor_corp;

			let { executor_corporation_id } = alliance;


			await this.get_store().update(
				{ id: this.get_data().alliance_id },
				{
					$set: alliance,
					$unset: { [executor_corporation_id ? "unset" : "executor_corporation_id"]: true }
				},
				{ upsert: true, w: 0 }
			);

			corporations_response.obj.forEach(corporation_id => CorporationStore.find_or_create(corporation_id));

			if (corporations_response.obj.length == 0)
				await this.destroy();
			else
				await this.update({
					expires: new Date(alliance_response.headers.expires).getTime()
				});

		}

	}

	module.exports = AllianceTask;
