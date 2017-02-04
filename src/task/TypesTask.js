
	"use strict";

	const { BaseTask } 	= require("task/");
	const { ESIUtil } 	= require("util/");
	const { TypeStore } = require("store/");

	class TypesTask extends BaseTask {

		async start () {
			await this.get_pages(await ESIUtil.get_client());
			await this.update({ expires: Date.now() + (60 * 60 * 1000) });
		}

		async get_pages (client, page = 1) {
			let { obj } = await client.Universe.get_universe_types({ page });
			for (let type_id of obj) {
				await TypeStore.find_or_create(type_id, true);
				await this.tick();
			}
			if (obj.length == 2000)
				return await this.get_pages(client, page + 1);
			else
				return true;
		}

	}

	module.exports = TypesTask;
