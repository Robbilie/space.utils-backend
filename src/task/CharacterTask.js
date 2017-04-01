
	"use strict";

	const { BaseTask } = require("task/");
	const { ESIUtil } = require("util/");
	const { CharacterStore } = require("store/");

	class CharacterTask extends BaseTask {

		async start () {

			let tss = [Date.now()];

			let client = await ESIUtil.get_client();

			tss.push(Date.now());

			let [{ obj: character, headers }, old_char] = await Promise.all([
				client.Character.get_characters_character_id(this.get_data()),
				CharacterStore.find_by_id(this.get_data().character_id).get_future()
			]);

			tss.push(Date.now());

			let corporation_history = null;
			if (!old_char || (old_char && old_char.corporation_id != character.corporation_id)) {
				let { obj } = await client.Character.get_characters_character_id_corporationhistory(this.get_data());
				corporation_history = obj;
			}

			tss.push(Date.now());

			character = Object.assign(character, {
				id: 					this.get_data().character_id,
				birthday: 				new Date(character.birthday).getTime()
			}, corporation_history ? {
				corporation_history: 	corporation_history.map(entry => Object.assign(entry, { start_date: new Date(entry.start_date).getTime() }))
			} : {});

			tss.push(Date.now());

			await this.get_store().update(
				{ id: character.id },
				{ $set: character },
				{ upsert: true }
			);

			tss.push(Date.now());

			if (!old_char)
				await CharacterAffiliationTask.queue_id(character.id);

			tss.push(Date.now());

			// get corp
			this.enqueue_reference("Corporation", character.corporation_id);

			tss.push(Date.now());

			if (character.alliance_id)
				this.enqueue_reference("Alliance", character.alliance_id);

			tss.push(Date.now());

			// get all corps from history
			if (corporation_history)
				corporation_history
					.forEach(({ corporation_id }) => this.enqueue_reference("Corporation", corporation_id));

			tss.push(Date.now());

			if (character.corporation_id == 1000001)
				await this.destroy();
			else
				await this.update({ expires: Date.now() + (1000 * 60 * 60 * 24) /*new Date(headers.expires).getTime()*/ });

			tss.push(Date.now());

			console.log("character", ...tss.map((t, i, a) => t - (a[i - 1] || t)));

		}

	}

	module.exports = CharacterTask;
