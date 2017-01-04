	"use strict";

	const { DBUtil, LoadUtil } 			= require("util/");
	const { Task } 						= require("model/");
	const { BaseTask } 					= require("task/");
	const http 							= require("http");

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

			this.task_limit = 20;
			this.running_tasks = 0;
			this.queued_tasks = [];

			this.tasks = [];

			this.heartbeat = Date.now();

			http.createServer((req, res) => {
				switch (req.url) {
					case "/ping":
						res.writeHead(200); break;
					case "/healthcheck":
						res.writeHead(this.heartbeat > Date.now() - (60 * 1000) ? 200 : 500); break;
				}
				res.end();
			}).listen(parseInt(process.env.APP_PORT));

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

			// start listener for just taken tasks
			WorkerApp.get_tasks().get_continuous_updates({ op: "u" }, undefined,
				({ o2: { _id }, o }) => {
					if(o && o.$set && o.$set.info && o.$set.info.state == 1) {
						let ind = this.tasks.findIndex(x => x._id == _id);
						if(ind >= 0)
							this.tasks[ind] = null;
					}
				});

			// start polling for old tasks that have to be fetched
			this.poll_for_tasks();

		}

		enqueue (task) {
			return new Promise(resolve => {

				const run = (runnable, done) => {
					this.process(runnable).then(() => {
						if(this.queued_tasks.length)
							this.queued_tasks.shift()();
						else
							this.running_tasks--;
					});
					done();
				};

				if(this.running_tasks < this.PARALLEL_TASK_LIMIT) {
					this.running_tasks++;
					run(task, resolve);
				} else {
					this.queued_tasks.push(() => run(task, resolve));
				}

			});
		}

		async pull_new_tasks () {
			let now = Date.now();
			let collection = await WorkerApp.get_tasks().get_collection();
			this.tasks = await collection
				.find({
					"info.expires": {
						$lt: now
					},
					$or: [
						{
							"info.state": 0
						},
						{
							"info.state": 1,
							"info.modified": {
								$lt: now - (1000 * 60)
							}
						}
					]
				})
				.sort({ "info.expires": 1 })
				.limit(this.task_limit * 10 * 5)
				.toArray();
			this.heartbeat = Date.now();
		}

		async poll_for_tasks () {

			let pulling_tasks = undefined;

			try {

				while (true) {

					if (this.tasks.length < this.task_limit * 10) {
						if(!pulling_tasks)
							pulling_tasks = this.pull_new_tasks();
						if(this.tasks.length == 0)
							pulling_tasks = await pulling_tasks;
						if(this.tasks.length == 0)
							await Promise.resolve().wait(1000 * 10);
					}

					let task = this.tasks.shift();

					if(task)
						await this.enqueue(task);

				}

			} catch (e) {
				console.log("worker error", e);
			}

			setImmediate(() => this.poll_for_tasks());

			/*
			try {

				let now = Date.now();
				let collection = await WorkerApp.get_tasks().get_collection();
				this.tasks = await collection
					.find({
						"info.expires": {
							$lt: now
						},
						$or: [
							{
								"info.state": 0
							},
							{
								"info.state": 1,
								"info.modified": {
									$lt: now - (1000 * 60)
								}
							}
						]
					})
					.sort({ "info.expires": 1 })
					.limit(500)
					.toArray();

				for(let i = 0; i < this.tasks.length; i++) {

					let task = this.tasks.shift();

					if(!task)
						continue;

					await this.enqueue(task);

				}

			} catch (e) {
				console.log("worker error", e);
			}

			setImmediate(() => this.poll_for_tasks());
			*/

			/*

			let cursor;

			while (!cursor) {

				try {

					let collection = await WorkerApp.get_tasks().get_collection();
					cursor = collection
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
						.limit(1000);

					while (await cursor.hasNext())
						await this.enqueue(await cursor.next());

				} catch (e) {
					console.log("worker error", e);
				}

				cursor = undefined;

			}

			*/

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

			/*

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

			*/

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

				let r = await WorkerApp.get_tasks().update(
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
					await WorkerApp.get_tasks().update(
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
			//console.log("took", Date.now() - start, "ms", task.info.name);

			this.heartbeat = Date.now();

		}

	}

	module.exports = WorkerApp;
