
	"use strict";

	const { BaseTask } = require("task/");
	const { ESIUtil } = require("util/");
	const { CorporationStore } = require("store/");

	class AllianceTask extends BaseTask {

		async start () {

			let client = await ESIUtil.get_client();

			let [{ obj: alliance, headers }, { obj: corporations }] = await Promise.all([
				client.Alliance.get_alliances_alliance_id(this.get_data()),
				client.Alliance.get_alliances_alliance_id_corporations(this.get_data())
			]);

			alliance = Object.assign(alliance, {
				id: 						this.get_data().alliance_id,
				name:						alliance.name || alliance.alliance_name,
				date_founded: 				new Date(alliance.date_founded).getTime(),
				executor_corporation_id: 	alliance.executor_corporation_id || alliance.executor_corp,
				executor_corp: 				undefined,
				alliance_name: 				undefined
			});

			await this.get_store().update(
				{ id: alliance.id },
				{
					$set: alliance,
					$unset: { [alliance.executor_corporation_id ? "unset" : "executor_corporation_id"]: true }
				},
				{ upsert: true }
			);

			const alliance_id = alliance.id;
			const corporation_ids = await CorporationStore.from_cursor(c => c.find({ alliance_id }).project({ id: 1 })).map(corporation => corporation.get_id());

			corporations
				.filter(corporation_id => !corporation_ids.includes(corporation_id))
				.forEach(corporation_id => this.enqueue_reference("Corporation", corporation_id));

			if (corporations.length == 0)
				await this.destroy();
			else
				await this.update({ expires: new Date(headers.expires).getTime() });

		}

	}

	module.exports = AllianceTask;
