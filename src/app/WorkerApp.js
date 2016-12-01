
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

			setInterval(() => {
				console.log("tasks:", this.started, this.errors, this.running, this.completed);
				this.started = 0;
				this.errors = 0;
				this.completed = 0;
			}, 60 * 1000);

			// start some basic tasks
			BaseTask.create_task("Alliances", {}, true);

			// start listener for brand new tasks
			WorkerApp.get_tasks().get_continuous_updates({ op: "i", "o.info.expires": 0 }, undefined,
				({ o: { _id, info: { expires } } }) => this.process(_id, expires));

			// start polling for old tasks that have to be fetched
			this.poll_for_tasks();

		}

		async poll_for_tasks () {

			/*

			let collection = await WorkerApp.get_tasks().get_collection();

			let cursor = collection
				.find({
					"info.expires": {
						$lt: Date.now()
					},
					$or
				})
				.sort({ "info.expires": 1 });

			while(await cursor.hasNext()) {
				let { _id, info } = await cursor.next();
				await this.process(_id, info.expires);
			}

			setImmediate(() => this.poll_for_tasks());

			*/

			WorkerApp
				.get_tasks()
				.get_collection()
				.then(collection => collection
					.find({
						"info.expires": {
							$lt: Date.now()
						},
						$or
					})
					.sort({ "info.expires": 1 })
					.limit(1000)
					.toArray()
				)
				.then(docs => {
					docs.map(doc => this.process(doc._id, doc.info.expires));
				})
				.then(() =>	setImmediate(() => this.poll_for_tasks()));


			/*

			let timeout = Promise.resolve().wait(100);

			// get 200 tasks to work on
			let collection = await WorkerApp.get_tasks().get_collection();
			let tasks = await collection
				.find({
					"info.expires": {
						$lt: Date.now()
					},
					$or
				})
				.sort({ "info.expires": 1 })
				.limit(200)
				.toArray();

			// process them
			tasks.map(doc => this.process(doc._id, doc.info.expires));

			// wait if not yet run out or skip and restart polling
			await timeout;
			setImmediate(() => this.pollForTasks());

			*/

		}

		static get_tasks () {
			return DBUtil.get_store("Task");
		}

		async process (_id, expires) {

			try {

				if(this.running >= parseInt(process.env.REQUEST_LIMIT))
					return;

				this.running++;

				// update state and check if still valid
				let task = await WorkerApp.get_tasks().modify(
					{ _id, "info.expires": expires, $or },
					{
						$set: {
							"info.state": 1,
							"info.modified": Date.now()
						}
					},
					{ returnOriginal: false }
				);

				// task has already been taken by another worker
				if (!task.value) {
					this.running--;
					return;
				}

				this.started++;

				try {
					// do special processing stuff
					let runner = new (LoadUtil.task(task.value.info.name))(task.value);
					await runner.start();
				} catch (e) {
					this.errors++;
					console.log(task.value.info.name, e);
					await WorkerApp.get_tasks().update(
						{ _id },
						{
							$set: {
								"info.state": 0,
								"info.modified": Date.now()
							}
						}
					);
				}

				this.completed++;
				this.running--;

			} catch (e) {
				console.log("WHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAT", e);
			}

		}

	}

	module.exports = WorkerApp;
