
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

			const date = new Date(page);

			{
				if (start === false)
					await this.tick({ page });

				const res = await request(`https://zkillboard.com/api/history/${this.get_url_date(date)}/`);

				const pre = Date.now();
				//await Promise.all(
					Object
						.entries(res)
						.map(([killmail_id, killmail_hash]) => [parseInt(killmail_id), killmail_hash])
						.sort(([killmail_id_a], [killmail_id_b]) => killmail_id_a > killmail_id_b ? 1 : -1)
						.filter(([killmail_id, killmail_hash]) => killmail_hash.length === 40)
						//.map(([killmail_id, killmail_hash]) => BaseTask.create_task("Killmail", { killmail_id, killmail_hash }))
						.map(([killmail_id, killmail_hash]) => this.enqueue_reference("Killmail", killmail_id, killmail_hash))
				//);
				console.log(page, "took", (Date.now() - pre) / 1000, "seconds");
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
