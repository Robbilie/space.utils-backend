
	"use strict";

	const {
		DB,
		LoadUtil,
		Metrics } 			= require("util/");
	const { BaseTask } 		= require("task/");
	const { BaseApp } 		= require("app/");

	class WorkerApp extends BaseApp {

		async init () {

			// gc frequently
			if (typeof(gc) !== "undefined")
				setInterval(() => {
					gc();
					let { rss, heapTotal, heapUsed } = process.memoryUsage();
					Metrics.update("process.rss", rss);
					Metrics.update("process.heapTotal", heapTotal);
					Metrics.update("process.heapUsed", heapUsed);
				}, 1000 * 10);

			// task queue
			this.PARALLEL_TASK_LIMIT = parseInt(process.env.PARALLEL_TASK_LIMIT);
			this.TASK_TIMEOUT_SECONDS = parseInt(process.env.TASK_TIMEOUT_SECONDS);
			this.EXTENDED_METRICS = process.env.EXTENDED_METRICS === "true";
			this.reference_queue = [];
			this.reference_queue_max = parseInt(process.env.REFERENCE_QUEUE_MAX);
			//this.reference_queue_interval = setInterval(() => this.work_reference_queue(), 10 * 1000);
			this.wait_queue = [];

			this.start_heartbeat();

			// start some basic tasks
			WorkerApp.create_base_tasks();

			// start polling for old tasks that have to be fetched
			this.work_tasks();

		}

		static create_base_tasks () {
			["Alliances", "Factions", "Wars", "Types", "Systems", "NPCCorporations"].forEach(name => BaseTask.create_task(name, {}, true));
		}

		work_tasks () {
			new Array(this.PARALLEL_TASK_LIMIT).fill(0).forEach((e, i) => this.next(i));
		}

		next (lane) {
			this.process_next(lane)
				.catch(e => (e.code === 50 ? null : console.log("shouldn't happen", e.toString(), e)) || true)
				.then(should_wait => !this.wait_queue.push(should_wait) || this.wait_queue.pop() ? Promise.resolve().wait(5 * 1000) : Promise.resolve())
				.then(() => process.nextTick(() => this.next(lane)));
		}

		async process_next (lane) {

			let should_wait = false;

			const now = Date.now();

			const atomic_start = process.hrtime();

			const { value } = await DB.collection("tasks").findOneAndUpdate(
				{ "info.expires": { $lt: now }, "info.modified": { $lt: now - (this.TASK_TIMEOUT_SECONDS * 1000) } }
				/*{ $or: [
				 { "info.state": 0, "info.expires": { $lt: (now / 1000)|0 } },
				 { "info.state": 1, "info.modified": { $lt: ((now / 1000)|0) - this.TASK_TIMEOUT_SECONDS } }
				 ] }*/,
				{ $set: { "info.state": 1, "info.modified": now } },
				{
					sort: { "info.expires": 1, "info.modified": 1 },
					returnOriginal: false,
					//maxTimeMS: 20
				}
			);

			const atomic_duration = process.hrtime(atomic_start);
			Metrics.update("tasks.atomic_duration", (atomic_duration[0] * 1e9 + atomic_duration[1]) / 1e6);

			this.heartbeat = Date.now();

			if (!value)
				return true;

			const { _id, info: { name } } = value;

			try {

				const start = process.hrtime();
				const t = new (LoadUtil.task(name))(this, value);

				await t.start();

				let duration = process.hrtime(start);
				duration = (duration[0] * 1e9 + duration[1]) / 1e6;
				Metrics.update("tasks.duration", duration);
				Metrics.update(`tasks.type.${name}`, duration);

			} catch (e) {

				await DB.collection("tasks").updateOne({ _id }, { $set: { "info.modified": Date.now() } });

				Metrics.inc("tasks.errors");
				let error = e.error;
				if (e.name === "StatusCodeError" && e.statusCode !== 403)
					console.log(name, JSON.stringify({ name: e.name, statusCode: e.statusCode, error, href: e.response.request.href }));
				else if (e.name === "StatusCodeError" && e.statusCode === 403)
					console.log(name, JSON.stringify({ name: e.message, statusCode: e.statusCode, response: e.response, href: e.response.request.href }));
				else if (e.statusCode !== undefined)
					console.log(name, JSON.stringify({ name: e.message, statusCode: e.statusCode, error: e.response.body, href: e.response.url }));
				else if (e.message === "Error: ESOCKETTIMEDOUT")
					console.log(name, JSON.stringify({ name: e.message, href: e.options.url }));
				else
					console.log(name, e);

				should_wait = true;

			}

			Metrics.inc("tasks.completed");

			this.heartbeat = Date.now();

			return should_wait;

		}

		enqueue_reference (name, ...args) {
			//this.reference_queue.push([name, args]);
			//if (this.reference_queue.length >= this.reference_queue_max)
			//	setImmediate(() => this.work_reference_queue());

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
			const queue = this.reference_queue;
			this.reference_queue = [];
			queue.forEach(([name, args]) => setImmediate(() => LoadUtil.store(name).find_or_create(...args, true)));
			//console.log("worked reference queue");
		}

	}

	module.exports = WorkerApp;

	process.on("exit", () => console.log("got exit"));
	process.on("SIGINT", () => console.log("got SIGINT"));
