
	"use strict";

	const rp 		= require("request-promise-native");
	const request 	= rp.defaults({
		forever: true,
		pool: {
			maxSockets: Infinity
		},
		json: true
	});

	const { BaseTask } = require("task/");

	class ZKBHistoryTask extends BaseTask {

		async start () {
			await this.get_pages(this.get_info().page, true);
			await this.update({ expires: Date.now() + (24 * 60 * 60 * 1000), page: "2007-12-05" });
		}

		async get_pages (page = "2007-12-05", start = false) {
			console.log("get page", page);

			const date = new Date(page);

			{
				console.log("page tick", page);

				if (start === false)
					await this.tick({ page });

				console.log("api page", page);

				const res = await request(`https://zkillboard.com/api/history/${this.get_url_date(date)}/`);

				console.log("zkb start map", page);


				let interval = setInterval(() => this.tick(), 30 * 1000);

				const kms = Object
					.entries(res)
					.map(([killmail_id, killmail_hash]) => [parseInt(killmail_id), killmail_hash])
					.sort(([killmail_id_a], [killmail_id_b]) => killmail_id_a > killmail_id_b ? 1 : -1)
					.filter(([killmail_id, killmail_hash]) => killmail_hash.length === 40);

				for (let [killmail_id, killmail_hash] in kms) {
					console.log("create km task", killmail_id);
					await BaseTask.create_task("Killmail", { killmail_id, killmail_hash }, true);
				}

				/*
				const chunks = Object
						.entries(res)
						.map(([killmail_id, killmail_hash]) => [parseInt(killmail_id), killmail_hash])
						.sort(([killmail_id_a], [killmail_id_b]) => killmail_id_a > killmail_id_b ? 1 : -1)
						.filter(([killmail_id, killmail_hash]) => killmail_hash.length === 40)
						.chunk(2500);
				console.log("chunked page", page);

				for (let chunk in chunks)
					await Promise.all(chunk.map(([killmail_id, killmail_hash]) => this.enqueue_reference("Killmail", killmail_id, killmail_hash)));
						//.map(([killmail_id, killmail_hash]) => BaseTask.create_task("Killmail", { killmail_id, killmail_hash }, true))
						//.map(([killmail_id, killmail_hash]) => this.enqueue_reference("Killmail", killmail_id, killmail_hash));
				//);
				*/

				clearInterval(interval);

				console.log("zkb end map", page);
			}

			if (this.get_url_date(date) !== this.get_url_date())
				return await this.get_pages(this.get_url_date(!date.setDate(date.getDate() + 1) || date, "-"));
			else
				return true;

		}

		get_url_date (date = new Date(), sep = "") {
			return `${date.getUTCFullYear()}${sep}${(date.getUTCMonth() + 1).toString().padStart(2, "0")}${sep}${date.getUTCDate().toString().padStart(2, "0")}`;
		}

	}

	module.exports = ZKBHistoryTask;
