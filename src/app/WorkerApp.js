
	"use strict";

	const { DBUtil, LoadUtil } 			= require("util/");
	const { Task } 						= require("model/");
	const { BaseTask } 					= require("task/");

	const $or = [
		{
			"info.state": 0
		},
		{
			"info.state": 1,
			"info.modified": {
				$lt: Date.now() - (1000 * 60)
			}
		}
	];

	class WorkerApp {

		async init () {

			// gc frequently
			if(typeof(gc) != "undefined")
				setInterval(() => gc(), 1000 * 10);

			this.running = 0;
			this.started = 0;
			this.errors = 0;
			this.completed = 0;

			const log_interval = 60;
			setInterval(() => {
				console.log("tasks:", this.started / log_interval, this.errors / log_interval, this.completed / log_interval, this.running);
				this.started = 0;
				this.errors = 0;
				this.completed = 0;
			}, log_interval * 1000);

			// start some basic tasks
			BaseTask.create_task("Alliances", {}, true);

			// start listener for brand new tasks
			WorkerApp.get_tasks().get_continuous_updates({ op: "i", "o.info.expires": 0 }, undefined,
				({ o }) => this.process(o));

			// start polling for old tasks that have to be fetched
			this.poll_for_tasks();

		}

		async poll_for_tasks () {

			let timeout = Promise.resolve().wait(100);

			let collection = await WorkerApp.get_tasks().get_collection();
			let tasks = await collection
				.find({
					"info.expires": {
						$lt: Date.now()
					},
					$or
				})
				.sort({ "info.expires": 1 })
				.limit(5000)
				.toArray();

			// process them
			tasks.map(doc => this.process(doc));

			// wait if not yet run out or skip and restart polling
			await timeout;
			setImmediate(() => this.poll_for_tasks());

		}

		static get_tasks () {
			return DBUtil.get_store("Task");
		}

		async process (task) {

			try {

				if(this.running >= parseInt(process.env.PARALLEL_TASK_LIMIT))
					return;

				this.running++;

				let { _id, info: { expires, name } } = task;

				let collection = await WorkerApp.get_tasks().get_collection();

				let r = await collection.updateOne(
					{ _id, "info.expires": expires, $or },
					{
						$set: {
							"info.state": 1,
							"info.modified": Date.now()
						}
					}
				);

				console.log(r.modifiedCount);

				if(r.modifiedCount != 1) {
					this.running--;
					return;
				}

				this.started++;

				try {
					// do special processing stuff
					let runner = new (LoadUtil.task(name))(task);
					await runner.start();
					this.completed++;
				} catch (e) {
					console.log(name, e);
					await collection.updateOne(
						{ _id },
						{
							$set: {
								"info.state": 0,
								"info.modified": Date.now()
							}
						}
					);
					this.errors++;
				}

				this.running--;

			} catch (e) {
				console.log("WHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAT", e);
			}

		}

	}

	module.exports = WorkerApp;
