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
			if (typeof(gc) !== "undefined")
				setInterval(() => {
					gc();
					let { rss, heapTotal, heapUsed } = process.memoryUsage();
					MetricsUtil.update("process.rss", rss);
					MetricsUtil.update("process.heapTotal", heapTotal);
					MetricsUtil.update("process.heapUsed", heapUsed);
					if (rss > (175 * 1000000))
						console.log("possible memory leak, these are running:", Object.entries(this.running_task_ids));
				}, 1000 * 10);

			// task queue
			this.PARALLEL_TASK_LIMIT = parseInt(process.env.PARALLEL_TASK_LIMIT);
			this.TASK_TIMEOUT_SECONDS = parseInt(process.env.TASK_TIMEOUT_SECONDS);
			this.EXTENDED_METRICS = process.env.EXTENDED_METRICS === "true";
			this.running_tasks = 0;
			this.running_task_ids = {};
			this.tasks = [];
			this.reference_queue = [];
			this.reference_queue_max = parseInt(process.env.REFERENCE_QUEUE_MAX);

			this.start_heartbeat();
			this.start_logging();

			// start some basic tasks
			WorkerApp.create_base_tasks();

			// start polling for old tasks that have to be fetched
			this.work_tasks();

		}

		start_heartbeat () {
			// liveness probe from k8s
			this.heartbeat = Date.now();
			http.createServer((req, res) => {
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
			}).listen(parseInt(process.env.APP_PORT));
		}

		start_logging () {

			// some debug logs
			this.errors 		= 0;
			this.completed 		= 0;

			/*
			this.interval = RPSUtil.monotonic_loop(difference => {
				console.log("tasks:", ...[this.errors, this.completed].map(x => (x / difference).toLocaleString()));
				console.log(this.running_tasks, "out of", this.PARALLEL_TASK_LIMIT, "running");
				this.errors 		= 0;
				this.completed 		= 0;
			});

			setInterval(() => console.log("~~~~~~~~~~~~~~~~~~~~"), 10 * 1000);
			*/

		}

		static create_base_tasks () {
			BaseTask.create_task("Alliances", {}, true);
			BaseTask.create_task("Factions", {}, true);
			BaseTask.create_task("Wars", {}, true);			// ~265 "pages"
			BaseTask.create_task("Types", {}, true);		// 32 pages
			BaseTask.create_task("Systems", {}, true);
		}

		work_tasks () {
			for (let i = 0; i < this.PARALLEL_TASK_LIMIT; i++)
				this.next();
		}

		next () {
			this.process_next()
				.catch(e => console.log("shouldn't happen", e) || true)
				.then(should_wait => should_wait ? Promise.resolve().wait(5 * 1000) : Promise.resolve())
				.then(() => process.nextTick(() => this.next()));
		}

		static get_tasks () {
			return DBUtil.get_store("Task");
		}

		async process_next () {

			let tss = [Date.now()];

			let should_wait = false;

			let now = Date.now();

			let atomic_start = process.hrtime();

			tss.push(Date.now());

			let { value } = await WorkerApp.get_tasks().modify(
				{ "info.expires": { $lt: now }, "info.modified": { $lt: now - (this.TASK_TIMEOUT_SECONDS * 1000) } }
				/*{ $or: [
				 { "info.state": 0, "info.expires": { $lt: (now / 1000)|0 } },
				 { "info.state": 1, "info.modified": { $lt: ((now / 1000)|0) - this.TASK_TIMEOUT_SECONDS } }
				 ] }*/,
				{ $set: { "info.state": 1, "info.modified": now } },
				{
					sort: { "info.expires": 1, "info.modified": 1 },
					returnOriginal: false,
					maxTimeMS: 20
				}
			);

			tss.push(Date.now());

			let atomic_duration = process.hrtime(atomic_start);
			MetricsUtil.update("tasks.atomic_duration", (atomic_duration[0] * 1e9 + atomic_duration[1]) / 1e6);

			tss.push(Date.now());

			this.heartbeat = Date.now();

			if (!value)
				return true;

			let { _id, info: { name } } = value;

			tss.push(Date.now());

			if (this.EXTENDED_METRICS === true)
				MetricsUtil.inc("tasks.started");

			this.running_task_ids[_id.toString()] = Date.now();

			tss.push(Date.now());

			try {

				let start = process.hrtime();
				let t = new (LoadUtil.task(name))(this, value);

				tss.push(Date.now());

				await t.start();

				tss.push(Date.now());

				this.completed++;
				let duration = process.hrtime(start);
				duration = (duration[0] * 1e9 + duration[1]) / 1e6;
				MetricsUtil.update("tasks.duration", duration);
				if (this.EXTENDED_METRICS === true)
					MetricsUtil.update(`tasks.type.${name}`, duration);

				tss.push(Date.now());

			} catch (e) {

				await WorkerApp.get_tasks().update({ _id }, { $set: { "info.modified": Date.now() } });

				this.errors++;
				MetricsUtil.inc("tasks.errors");
				let error = e.error;
				if (e.name === "StatusCodeError")
					console.log(name, JSON.stringify({ name: e.name, statusCode: e.statusCode, error, href: e.response.request.href }));
				else if (e.message === "Error: ESOCKETTIMEDOUT")
					console.log(name, JSON.stringify({ name: e.message, href: e.options.url }));
				else
					console.log(name, e);

				should_wait = true;

			}

			MetricsUtil.inc("tasks.completed");

			delete this.running_task_ids[_id.toString()];

			this.heartbeat = Date.now();

			tss.push(Date.now());

			//console.log("worker", ...tss.map((t, i, a) => t - (a[i - 1] || t)));

			return should_wait;

		}

		enqueue_reference (name, ...args) {
			setImmediate(() => {
				clearTimeout(this.reference_queue_timeout);
				this.reference_queue_timeout = setTimeout(() => this.work_reference_queue(), 10 * 1000);
				this.reference_queue.push([name, args]);
				if (this.reference_queue.length >= this.reference_queue_max) {
					console.log("queue full, dereferencing");
					this.work_reference_queue();
				}
			});
		}

		work_reference_queue () {
			let queue = this.reference_queue;
			this.reference_queue = [];
			queue.forEach(([name, args]) => DBUtil.get_store(name).find_or_create(...args, true));
		}

	}

	module.exports = WorkerApp;

	process.on("exit", () => console.log("got exit"));
	process.on("SIGINT", () => console.log("got SIGINT"));
