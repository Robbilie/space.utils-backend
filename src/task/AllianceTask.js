
	"use strict";

	const { BaseTask } = require("task/");
	const { DB, ESI, Hash, PropertyWrap: { _ } } = require("util/");

	class AllianceTask extends BaseTask {

		async start () {

			let [{ body: alliance, headers }, { body: corporation_ids }, old_alliance] = await Promise.all([
				ESI.Alliance.get_alliances_alliance_id(this.get_data()),
				ESI.Alliance.get_alliances_alliance_id_corporations(this.get_data()),
				DB.collection("alliances").findOne({ id: this.get_data().alliance_id })
			]);

			alliance = Object.assign(alliance, {
				id: 						this.get_data().alliance_id,
				date_founded: 				new Date(alliance.date_founded).getTime(),
				corporation_ids
			});

			const { id } = alliance;

			const hash = Hash(alliance);

			if (hash !== this.get_info().hash) {

				await DB.collection("alliances").replaceOne(
					{ id },
					alliance,
					{ upsert: true }
				);

				// all new corps in the alli are possibly missing from the db so fetch
				corporation_ids
					.filter(corporation_id => !old_alliance.corporation_ids.includes(corporation_id))
					.forEach(corporation_id => this.enqueue_reference("Corporation", corporation_id));

				// all old ids that are not in the alliance anymore should be instantly fetched again
				const ids = old_alliance.corporation_ids
					.filter(corporation_id => !corporation_ids.includes(corporation_id));

				await DB.collection("tasks").updateMany({ "info.name": "Corporation", "data.corporation_id": { $in: ids } }, { $set: { "info.expires": Date.now() } });

			}

			let expires;
			if (corporation_ids.length === 0) {
				expires = Number.MAX_SAFE_INTEGER;
			} else {
				expires = new Date(headers.expires).getTime();
			}

			await this.update({ expires, hash });

		}

	}

	module.exports = AllianceTask;
