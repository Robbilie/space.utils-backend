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

			// task queue
			this.PARALLEL_TASK_LIMIT = parseInt(process.env.PARALLEL_TASK_LIMIT);
			this.running_tasks = 0;
			this.queued_tasks = [];

			this.tasks = [];

			// liveness probe from k8s
			this.heartbeat = Date.now();
			http.createServer((req, res) => {
				switch (req.url) {
					case "/ping":
						res.writeHead(200); break;
					case "/healthcheck":
						res.writeHead(this.heartbeat > Date.now() - (120 * 1000) ? 200 : 500); break;
				}
				res.end();
			}).listen(parseInt(process.env.APP_PORT));

			// some debug logs
			this.running = 0;
			this.started = 0;
			this.errors = 0;
			this.completed = 0;
			this.log_interval = 60;
			this.interval = setInterval(() => {
				console.log(
					"tasks:",
					(this.started 	/ this.log_interval).toLocaleString(),
					(this.errors 	/ this.log_interval).toLocaleString(),
					(this.completed / this.log_interval).toLocaleString(),
					this.running
				);
				this.started = 0;
				this.errors = 0;
				this.completed = 0;
			}, this.log_interval * 1000);

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

		async pull_new_tasks (now = Date.now()) {
			let collection = await WorkerApp.get_tasks().get_collection();
			this.tasks = await collection
				.find({ "info.expires": { $lt: now }, $or: WorkerApp.task_query(now) })
				.sort({ "info.expires": 1 })
				.limit(this.PARALLEL_TASK_LIMIT * 10 * 5 * 5)
				.toArray();
			this.heartbeat = Date.now();
		}

		async poll_for_tasks () {

			let pulling_tasks = undefined;

			try {

				while (this.heartbeat > Date.now() - (120 * 1000)) {

					if (this.tasks.length < this.PARALLEL_TASK_LIMIT * 10) {
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

		}

		static get_tasks () {
			return DBUtil.get_store("Task");
		}

		static task_query(now = Date.now()) {
			return [{ "info.state": 0 }, { "info.state": 1, "info.modified": { $lt: now - (1000 * 60) } }];
		}

		async process ({ _id, info: { name, expires } }) {

			this.running++;

			try {

				let now = Date.now();

				let { value } = await WorkerApp.get_tasks().modify(
					{ _id, "info.expires": expires, $or: WorkerApp.task_query(now) },
					{ $set: { "info.state": 1, "info.modified": now } },
					{ returnOriginal: false }
				);

				if(value)
					++this.started;
				else
					return --this.running;

				// do special processing stuff or error out
				try {
					await new (LoadUtil.task(name))(value).start();
					this.completed++;
				} catch (e) {
					await WorkerApp.get_tasks().update({ _id }, { $set: { "info.modified": Date.now() } });
					this.errors++;

					// log error & slow down requests
					console.log(name, e.name != "StatusCodeError" ? e : { name: e.name, statusCode: e.statusCode, error: e.error, href: e.response.request.href });
					++this.running_tasks;
					// increases wait time to up to 5m
					setTimeout(() => --this.running_tasks, 5 * 60 * 1000 / this.PARALLEL_TASK_LIMIT * this.errors);
				}

			} catch (e) {
				console.log("shouldn't happen", e);
			}

			this.running--;

			this.heartbeat = Date.now();

		}

	}

	module.exports = WorkerApp;
