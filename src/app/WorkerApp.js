
	"use strict";

	const { DBUtil, LoadUtil } 			= require("util/");
	const { Task } 						= require("model/");
	const { BaseTask } 					= require("task/");

	class WorkerApp {

		async init () {

			// gc frequently
			if(typeof(gc) != "undefined")
				setInterval(() => gc(), 1000 * 10);

			this.PARALLEL_TASK_LIMIT = parseInt(process.env.PARALLEL_TASK_LIMIT);

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

			/*

			let collection = await WorkerApp.get_tasks().get_collection();
			let tasks = await collection
				.find({
					"info.expires": {
						$lt: Date.now()
					},
					$or: [
						{
							"info.state": 0
						},
						{
							"info.state": 1,
							"info.modified": {
								$lt: Date.now() - (1000 * 60)
							}
						}
					]
				})
				.sort({ "info.expires": 1 })
				.limit(5000);

			while(await tasks.hasNext()) {

				while(this.running >= this.PARALLEL_TASK_LIMIT) {
					await Promise.resolve().wait(200);
				}

				await this.process(await tasks.next());

			}

			setImmediate(() => this.poll_for_tasks());

			*/

			let timeout = Promise.resolve().wait(200);

			let collection = await WorkerApp.get_tasks().get_collection();
			let tasks = await collection
				.find({
					"info.expires": {
						$lt: Date.now()
					},
					$or: [
						{
							"info.state": 0
						},
						{
							"info.state": 1,
							"info.modified": {
								$lt: Date.now() - (1000 * 60)
							}
						}
					]
				})
				.sort({ "info.expires": 1 })
				.limit(200)
				.toArray();

			// process them
			await Promise.all(tasks.map(doc => this.process(doc)));

			// wait if not yet run out or skip and restart polling
			await timeout;
			setImmediate(() => this.poll_for_tasks());


		}

		static get_tasks () {
			return DBUtil.get_store("Task");
		}

		async process (task) {

			let start = Date.now();

			this.running++;

			try {

				let { _id, info: { name, expires } } = task;

				let now = Date.now();

				let collection = await WorkerApp.get_tasks().get_collection();
				let r = await collection.updateOne(
					{ _id, "info.expires": expires, $or: [
						{
							"info.state": 0
						},
						{
							"info.state": 1,
							"info.modified": {
								$lt: now - (1000 * 60)
							}
						}
					] },
					{
						$set: {
							"info.state": 1,
							"info.modified": now
						}
					}
				);

				if(r.modifiedCount != 1) {
					this.running--;
					return;
				}

				task.info.state = 1;
				task.info.modified = now;

				this.started++;

				try {
					// do special processing stuff
					let runner = new (LoadUtil.task(name))(task);
					await runner.start();
					this.completed++;
				} catch (e) {
					await collection.updateOne(
						{ _id },
						{
							$set: {
								//"info.state": 0, // leaving it on state 1 and just changing the modified should mean back off for 1 minute
								"info.modified": Date.now()
							}
						}
					);
					this.errors++;
					console.log(name, e);
				}

			} catch (e) {
				console.log("WHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAT", e);
			}

			this.running--;
			console.log("took", Date.now() - start, "ms", task.info.name);

		}

	}

	module.exports = WorkerApp;
