
	"use strict";

	const { BaseTask } = require("task/");
	const { ESI } = require("util/");
	const { CorporationStore } = require("store/");

	class AllianceTask extends BaseTask {

		async start () {

			let [{ body: alliance, headers }, { body: corporation_ids }] = await Promise.all([
				ESI.Alliance.get_alliances_alliance_id(this.get_data()),
				ESI.Alliance.get_alliances_alliance_id_corporations(this.get_data())
			]);

			alliance = Object.assign(alliance, {
				id: 						this.get_data().alliance_id,
				name:						alliance.name || alliance.alliance_name,
				date_founded: 				new Date(alliance.date_founded).getTime(),
				corporation_ids
			});

			// manage optional convert
			if (alliance.executor_corporation_id || alliance.executor_corp)
				alliance.executor_corporation_id = alliance.executor_corporation_id || alliance.executor_corp;

			// TODO : ESI should fix this
			delete alliance.executor_corp;
			delete alliance.alliance_name;

			let hash = ESIUtil.hash(alliance);

			if (hash !== this.get_info().hash) {

				await this.get_store().replace(
					{ id: alliance.id },
					alliance,
					{ upsert: true }
				);

				const alliance_id = alliance.id;
				const old_corporation_ids = await CorporationStore.from_cursor(c => c.find({ alliance_id }).project({ id: 1 })).map(corporation => corporation.get_id());

				corporation_ids
					.filter(corporation_id => !old_corporation_ids.includes(corporation_id))
					.forEach(corporation_id => this.enqueue_reference("Corporation", corporation_id));

			}

			await this.update({
				expires: (corporation_ids.length === 0) ? Number.MAX_SAFE_INTEGER : new Date(headers.expires).getTime(),
				hash
			});

		}

	}

	module.exports = AllianceTask;
