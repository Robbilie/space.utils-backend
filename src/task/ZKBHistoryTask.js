
	"use strict";

	const rp 		= require("request-promise-native");
	const request 	= rp.defaults({
		//gzip: true,
		json: true,
		headers: {
			"User-Agent": "zkbhistoryfetcher/utils.space (Vincent Eneticum / Robert Schuh)"
		},
		forever: true,
		pool: {
			maxSockets: Infinity
		}
	});

	const { BaseTask } = require("task/");
	const { DB, ESI, Hash, PropertyWrap: { _ } } = require("util/");

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

				console.log("zkb start map", page);

				const killmail_chunks = Object
					.entries(await request(`https://zkillboard.com/api/history/${this.get_url_date(date)}/`))
					.sort(([killmail_id_a], [killmail_id_b]) => (killmail_id_a - 0) > (killmail_id_b - 0) ? 1 : -1)
					.chunk(500);

				console.log("zkb end map", page);

				const collection = await DB.collection("tasks");

				for (let chunk of killmail_chunks) {
					console.log("zkb insert chunk");
					await collection.insertMany(chunk.map(([killmail_id, killmail_hash]) => BaseTask.create_doc("Killmail", { killmail_id: killmail_id - 0, killmail_hash })));
					await this.tick({ page });
				}

				//await collection.insertMany(killmails);
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
