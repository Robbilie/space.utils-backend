
	"use strict";

	const { BaseTask } 	= require("task/");
	const { ESI } = require("util/");
	const { TypeStore } = require("store/");

	class TypesTask extends BaseTask {

		async start () {
			await this.get_pages();
			await this.update({ expires: Date.now() + (60 * 60 * 1000) });
		}

		async get_pages (page = 1) {
			const s = { length: 0 };

			{
				const { body: types } = await ESI.Universe.get_universe_types({ page });
				s.length = types.length;

				const ids = await TypeStore
					.from_cursor(c => c.find({ id: { $in: types } }).project({ id: 1 }))
					.map(type => type.get_id());

				types
					.filter(id => !ids.includes(id))
					.forEach(type_id => this.enqueue_reference("Type", type_id));

				await this.tick();
			}

			if (s.length === 1000)
				return await this.get_pages(page + 1);
			else
				return true;
		}

	}

	module.exports = TypesTask;
