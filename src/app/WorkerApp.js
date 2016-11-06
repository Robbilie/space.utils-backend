
	"use strict";

	const { DBUtil, LoadUtil } 			= require("util/");
	const { Task } 						= require("model/");

	class WorkerApp {

		constructor () {
			this.taskTypes = { ["XML"]: { limit: 30, timestamps: [] }, ["CREST"]: { limit: 150, timestamps: [] } };
			this.shuttingDown = false;
			this.lastTS = undefined;

			try {
				this.init();
			} catch (e) {
				console.log(e, new Error());
			}
		}

		async init () {

			// get stores
			this.tasks 		= await DBUtil.getStore("Task");

			if(typeof(gc) != "undefined")
				this.gcInterval = setInterval(() => gc(), 1000 * 10);

			await this.startTaskCursor();

			// load all tasks
			/*
			await this.tasks
				.all()
				.then(all => all.forEach(async (task) => this.scheduleTask(await task.get_id(), (await task.getInfo()).timestamp, (await task.getInfo()).timestamp + (Math.random() * 3 * 1000))));
			*/

			/*
			this.pollInterval = setInterval(() => this.tasks.getCollection().find({ "info.timestamp": { $lt: Date.now() }, $or: [
				{ "info.state": 0 },
				{ "info.state": 1, "info.modified": { $lt: Date.now() - (1000 * 5) } }
			] }).sort({ "info.timestamp": 1 }).limit(200).each((err, doc) => {
				//console.log(err, doc);
				if (err)
					throw err;
				if(doc)
					this.process(doc._id, doc.info.timestamp);
			}), 200);
			*/

			this.pollForTasks();

		}

		async pollForTasks () {

			let timeout = Promise.resolve().wait(200);

			await this
				.getTasks()
				.getCollection()
				.find({
					"info.timestamp": {
						$lt: Date.now()
					},
					$or: [
						{
							"info.state": 0
						},
						{
							"info.state": 1,
							"info.modified": {
								$lt: Date.now() - (1000 * 5)
							}
						}
					]
				})
				.sort({ "info.timestamp": 1 })
				.limit(200)
				.toArray()
				.then(docs => Promise.all(docs.map(doc => this.process(doc._id, doc.info.timestamp))));

			timeout.then(() => this.pollForTasks());

		}

		startTaskCursor () {
			return this.tasks.getUpdates({ op: "i", "o.info.timestamp": 0 }, this.lastTS).then(updates => updates.each((err, data) => {
				if(err)
					return console.log(err, new Error(), "restarting cursor…") || setImmediate(() => this.startTaskCursor());
				this.lastTS = data.ts;
				//this.taskUpdate(data);
				this.process(data.o._id, data.o.info.timestamp);
			}));
		}

		getTasks () {
			return this.tasks;
		}

		getCursor () {
			return this.cursor;
		}

		scheduleTask (_id, timestamp1, timestamp2 = timestamp1) {
			setTimeout(() => this.process(_id, timestamp1), Math.max(timestamp2 - Date.now(), 0));
		}

		taskUpdate (data) {
			if(data.op == "i") {
				this.scheduleTask(data.o._id, data.o.info.timestamp);
			} else if(data.op == "u") {
				if(data.o.$set && data.o.$set.info && data.o.$set.info.state == 0) {
					this.scheduleTask(data.o2._id, data.o.$set.info.timestamp);
				} else {
					DBUtil.getStore("Task")
						.then(store => store.findBy_id(data.o2._id))
						.then(async (task) => (!await task.isNull()) && (await task.getInfo()).state == 0 ? this.scheduleTask(data.o2._id, (await task.getInfo()).timestamp) : undefined)
						.catch(e => console.log(e, new Error()));
				}
			}
		}

		async process (_id, timestamp) {

			try {

				if (this.shuttingDown)
					return;

				// update state and check if still valid
				let task = await this.getTasks().findAndModify(
					{
						_id,
						"info.timestamp": timestamp,
						$or: [
							{ "info.state": 0 },
							{ "info.state": 1, "info.modified": { $lt: Date.now() - (1000 * 5) } }
						]
					},
					[],
					{
						$set: {
							"info.state": 1,
							"info.modified": Date.now()
						}
					},
					{
						new: true
					}
				);

				// task has already been taken by another worker
				if (await task.isNull()) {
					return;
				}

				try {
					// do special processing stuff
					new (LoadUtil.task((await task.getInfo()).name))(this, task);
				} catch (e) {
					console.log((await task.getInfo()).name, e, new Error());
				}

			} catch (e) {
				console.log(e, new Error());
			}

		}

		enqueueTimestamp (type, ts, fromDb = false) {
			if(!this.taskTypes[type])
				return;
			this.taskTypes[type].timestamps.push(ts);
			if(!fromDb)
				this.ratelimits.insert({ type: type, timestamp: ts });
			this.taskTypes[type].timestamps = this.taskTypes[type].timestamps.sort();
			return setTimeout(() => this.taskTypes[type].timestamps = this.taskTypes[type].timestamps.filter(t => t != ts), ts - Date.now() + 1000);
		}

		enqueue (type, ts = Date.now()) {
			return new Promise((resolve) => {
				if(this.taskTypes[type].timestamps.length < this.taskTypes[type].limit) {
					this.enqueueTimestamp(type, ts);
					return resolve();
				}

				return Promise
					.resolve()
					.wait(ts - this.taskTypes[type].timestamps[this.taskTypes[type].timestamps.length - this.taskTypes[type].limit] || 0)
					.then(c => this.enqueue(type))
					.then(r => resolve())
					.catch(e => console.log(e, new Error()));
			});
		}

	}

	module.exports = WorkerApp;
	