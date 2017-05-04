
	"use strict";

	const { BaseTask } = require("task/");
	const { ESIUtil } = require("util/");
	const { CorporationStore } = require("store/");

	class AllianceTask extends BaseTask {

		async start () {

			const client = await ESIUtil.get_client();

			let [{ body: alliance, headers }, { body: corporations }] = await Promise.all([
				client.apis.Alliance.get_alliances_alliance_id(this.get_data()),
				client.apis.Alliance.get_alliances_alliance_id_corporations(this.get_data())
			]);

			let doc = Object.assign(
				{},
				alliance,
				{
					id: 						this.get_data().alliance_id,
					name:						alliance.name || alliance.alliance_name,
					date_founded: 				new Date(alliance.date_founded).getTime()
				}
			);

			// manage optional convert
			if (doc.executor_corporation_id || doc.executor_corp)
				doc.executor_corporation_id = doc.executor_corporation_id || doc.executor_corp;

			// TODO : ESI should fix this
			delete doc.executor_corp;
			delete doc.alliance_name;

			await this.get_store().replace(
				{ id: doc.id },
				doc,
				{ upsert: true }
			);

			const alliance_id = alliance.id;
			const corporation_ids = await CorporationStore.from_cursor(c => c.find({ alliance_id }).project({ id: 1 })).map(corporation => corporation.get_id());

			corporations
				.filter(corporation_id => !corporation_ids.includes(corporation_id))
				.forEach(corporation_id => this.enqueue_reference("Corporation", corporation_id));

			if (corporations.length === 0)
				await this.destroy();
			else
				await this.update({ expires: new Date(headers.expires).getTime() });

		}

	}

	module.exports = AllianceTask;
