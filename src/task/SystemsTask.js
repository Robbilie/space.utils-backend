
	"use strict";

	const { BaseTask } 	= require("task/");
	const { DB, ESI, PropertyWrap: { _ } } 	= require("util/");

	class SystemsTask extends BaseTask {

		async start () {
			const { body: systems } = await ESI.Universe.get_universe_systems();

			const ids = await DB
				.collections("systems")
				.find({ id: { $in: systems } })
				.project({ id: 1 })
				.map(_.id)
				.toArray();

			systems
				.filter(id => !ids.includes(id))
				.forEach(system_id => this.enqueue_reference("System", system_id));

			await this.update({ expires: Date.now() + (60 * 60 * 1000) });
		}

	}

	module.exports = SystemsTask;
