
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

			// start some basic tasks
			BaseTask.create_task("Alliances", {}, true);

			// start listener for brand new tasks
			WorkerApp.get_tasks().get_continuous_updates({ op: "i", "o.info.timestamp": 0 }, undefined,
				({ o: { _id, info: { timestamp } } }) => WorkerApp.process(_id, timestamp));

			// start polling for old tasks that have to be fetched
			this.pollForTasks();

		}

		async pollForTasks () {

			let timeout = Promise.resolve().wait(200);

			// get 200 tasks to work on
			let collection = await WorkerApp.get_tasks().get_collection();
			let tasks = await collection
				.find({
					"info.timestamp": {
						$lt: Date.now()
					},
					$or
				})
				.sort({ "info.timestamp": 1 })
				.limit(200)
				.toArray();

			// process them
			//await Promise.all(
				tasks.map(doc => WorkerApp.process(doc._id, doc.info.timestamp))
			//);

			// wait if not yet run out or skip and restart polling
			await timeout;
			setImmediate(() => this.pollForTasks());

		}

		static get_tasks () {
			return DBUtil.get_store("Task");
		}

		static async process (_id, timestamp) {

			try {

				// update state and check if still valid
				let task = await WorkerApp.get_tasks().modify(
					{ _id, "info.timestamp": timestamp, $or },
					{
						$set: {
							"info.state": 1,
							"info.modified": Date.now()
						}
					},
					{ returnOriginal: false }
				);

				// task has already been taken by another worker
				if (!task.value)
					return;

				console.log("processing", _id);

				try {
					// do special processing stuff
					let runner = new (LoadUtil.task(task.value.info.name))(task.value);
					await runner.start();
				} catch (e) {
					console.log(task.value.info.name, e, new Error());
				}

			} catch (e) {
				console.log(e, new Error());
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

		}

	}

	module.exports = WorkerApp;
