
	"use strict";

	const { BaseTask } 	= require("task/");
	const { ESIUtil } 	= require("util/");
	const { TypeStore } = require("store/");

	class TypesTask extends BaseTask {

		async start () {

			let start = Date.now();
			let times = [];

			let client = await ESIUtil.get_client();

			times.push(Date.now() - start);

			const { expires, ids } = await ESIUtil.get_all_pages(client.Universe.get_universe_types);
			console.log("types", ids.length);
			process.nextTick(() => ids.forEach(id => process.nextTick(() => TypeStore.find_or_create(id))));

			await this.update({
				expires
			});

			times.push(Date.now() - start);

			console.log("types", ...times);

		}

	}

	module.exports = TypesTask;
