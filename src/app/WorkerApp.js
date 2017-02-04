	"use strict";

	const {
		DBUtil,
		LoadUtil,
		RPSUtil,
		MetricsUtil } = require("util/");
	const { Task } 						= require("model/");
	const { BaseTask } 					= require("task/");
	const http 							= require("http");

	class WorkerApp {

		async init () {

			// gc frequently
			if (typeof(gc) != "undefined")
				setInterval(() => gc(), 1000 * 10);

			// task queue
			this.PARALLEL_TASK_LIMIT = parseInt(process.env.PARALLEL_TASK_LIMIT);
			this.TASK_TIMEOUT_SECONDS = parseInt(process.env.TASK_TIMEOUT_SECONDS);
			this.POLL_THRESHOLD = this.PARALLEL_TASK_LIMIT * 50;
			this.running_tasks = 0;
			this.queued_tasks = [];
			this.tasks = [];
			this.poll_treshold_promise = null;

			this.start_heartbeat();
			this.start_logging();
			this.start_task_watch();

			// start some basic tasks
			WorkerApp.create_base_tasks();

			// start polling for old tasks that have to be fetched
			this.pulling_tasks = null;
			this.poll_for_tasks();

		}

		start_heartbeat () {
			// liveness probe from k8s
			this.heartbeat = Date.now();
			http.createServer((req, res) => {
				try {
					//console.log("SERVER:", req);
					switch (req.url) {
						case "/healthcheck":
							res.writeHead(this.heartbeat > Date.now() - (2 * 60 * 1000) ? 200 : 500, { "Content-Type": "text/plain" });
							res.end("healthcheck");
							console.log("HEALTHCHECK", this.heartbeat > Date.now() - (2 * 60 * 1000));
							break;
						case "/ping":
							res.writeHead(200, { "Content-Type": "text/plain" });
							res.end("ping");
							console.log("PING");
							break;
						default:
							res.writeHead(200, { "Content-Type": "text/plain" });
							res.end("ok");
							console.log("WTF HEARTBEAT DEFAULT");
							console.log(req);
							break;
					}
				} catch (e) {
					console.log("REQ ERR", e);
				}
			}).listen(parseInt(process.env.APP_PORT));
		}

		start_logging () {

			// some debug logs
			this.errors 		= 0;
			this.completed 		= 0;

			this.interval = RPSUtil.monotonic_loop(difference => {
				console.log("tasks:", ...[this.errors, this.completed].map(x => (x / difference).toLocaleString()));
				this.errors 		= 0;
				this.completed 		= 0;
			});

			setInterval(() => console.log("~~~~~~~~~~~~~~~~~~~~"), 10 * 1000);

		}

		start_task_watch () {

			// start listener for brand new tasks
			WorkerApp.get_tasks().get_continuous_updates({ op: "i", "o.info.expires": 0 }, undefined,
				({ o }) => this.enqueue(o)/*this.process(o)*/);

			// start listener for just taken tasks
			WorkerApp.get_tasks().get_continuous_updates({ op: "u" }, undefined,
				({ o2: { _id }, o }) => {
					if(o && o.$set && o.$set.info && o.$set.info.state == 1) {
						let ind = this.tasks.findIndex(x => x._id == _id);
						if(ind >= 0)
							this.tasks[ind] = null;
					}
				});

		}

		static create_base_tasks () {
			BaseTask.create_task("Alliances", {}, true);
			BaseTask.create_task("Factions", {}, true);
			BaseTask.create_task("Wars", {}, true);			// ~265 "pages"
			BaseTask.create_task("Types", {}, true);		// 32 pages
			//BaseTask.create_task("Systems", {}, true);
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

		poll_treshold () {
			return new Promise(resolve => this.poll_treshold_promise = resolve);
		}

		async pull_new_tasks (now = Date.now()) {
			let collection = await WorkerApp.get_tasks().get_collection();
			this.tasks = await collection
				.find({ "info.expires": { $lt: now }, /*"info.modified": { $lt: now - (1000 * 60) }*/ $or: this.task_query(now) })
				.sort({ "info.expires": 1 })
				.limit(this.PARALLEL_TASK_LIMIT * 10 * 10)
				.toArray();
			this.heartbeat = Date.now();
			console.log("pulled new tasks");
			return null;
		}

		async poll_for_tasks () {

			try {

				if (this.tasks.length < this.PARALLEL_TASK_LIMIT * 25) {
					if (!this.pulling_tasks)
						this.pulling_tasks = this.pull_new_tasks();
					if (this.tasks.length == 0)
						this.pulling_tasks = await this.pulling_tasks;
					if (this.tasks.length == 0) {
						console.log("no tasks, waiting for 2s");
						await Promise.resolve().wait(1000 * 2);
					}
				}

				if (this.queued_tasks.length > this.POLL_THRESHOLD)
					await Promise.resolve().wait(1000 * 2);

				let task = this.tasks.shift();

				if(task)
					await this.enqueue(task);

				//console.log("enqueued,", this.tasks.length, "left while", this.running_tasks, "are running");

			} catch (e) {
				console.log("worker error", e);
			}

			process.nextTick(() => this.poll_for_tasks());

		}

		static get_tasks () {
			return DBUtil.get_store("Task");
		}

		task_query (now = Date.now()) {
			return [{ "info.state": 0 }, { "info.state": 1, "info.modified": { $lt: now - (1000 * this.TASK_TIMEOUT_SECONDS) } }];
		}

		async process ({ _id, info: { name, expires } }) {

			this.heartbeat = Date.now();

			try {

				let now = Date.now();

				let { value } = await WorkerApp.get_tasks().modify(
					{ _id, "info.expires": expires, /*"info.modified": { $lt: now - (1000 * 60) }*/ $or: this.task_query(now) },
					{ $set: { "info.state": 1, "info.modified": now } },
					{ returnOriginal: false }
				);

				if(!value)
					return null;

				MetricsUtil.inc("tasks.started");

				// do special processing stuff or error out
				try {
					let start = process.hrtime();
					//console.log("start", JSON.stringify(value));
					await new (LoadUtil.task(name))(value).start();
					//console.log("end", JSON.stringify(value));
					this.completed++;
					let duration = process.hrtime(start);
						duration = (duration[0] * 1e9 + duration[1]) / 1e6;
					MetricsUtil.update("tasks.duration", duration);
					MetricsUtil.update(`tasks.type.${name}`, duration);
				} catch (e) {

					await WorkerApp.get_tasks().update({ _id }, { $set: { "info.modified": Date.now() } });
					this.errors++;
					MetricsUtil.inc("tasks.errors");

					// log error & slow down requests
					let error = e.error;
					try { error = JSON.parse(error); } catch (e) {}
					console.log(name, e.name != "StatusCodeError" ? e : JSON.stringify({ name: e.name, statusCode: e.statusCode, error, href: e.response.request.href }));
					// increases wait time to up to 5m
					// ++this.running_tasks;
					// setTimeout(() => --this.running_tasks, 5 * 60 * 1000 / this.PARALLEL_TASK_LIMIT * this.errors);
				}

			} catch (e) {
				console.log("shouldn't happen", e);
				await this.process({ _id, info: { name, expires } });
			}

			MetricsUtil.inc("tasks.completed");

			this.heartbeat = Date.now();

		}

	}

	module.exports = WorkerApp;
