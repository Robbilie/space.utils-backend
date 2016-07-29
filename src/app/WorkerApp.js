
	"use strict";

	const DBUtil 					= require("util/DBUtil");
	const LoadUtil 					= require("util/LoadUtil");
	const Task 						= require("model/Task");

	class WorkerApp {

		constructor () {
			this.taskTypes = { ["XML"]: { limit: 30, timestamps: [] } };

			try {
				this.init();
			} catch (e) {
				console.log(e);
			}
		}

		async init () {

			// get stores
			this.tasks 		= await DBUtil.getStore("Task");
			this.ratelimits = await DBUtil.getStore("Ratelimit");

			// get task updates
			let taskCursor = await this.tasks.getUpdates();
			let taskStream = taskCursor.stream();
				taskStream.on("data", data => this.taskUpdate(data));

			// get ratelimits
			let rateCursor = await this.ratelimits.getUpdates();
			let rateStream = rateCursor.stream();
				rateStream.on("data", data => this.enqueueTimestamp(data.o.type, data.o.timestamp, true));

			// load all tasks
			let tasks = await this.tasks.all();
				tasks.forEach(task => this.scheduleTask(task, task.getInfo().timestamp + (Math.random() * 3 * 1000)));

		}

		getTasks () {
			return this.tasks;
		}

		getCursor () {
			return this.cursor;
		}

		scheduleTask (task, timestamp) {
			setTimeout(this.process.bind(this, task.get_id(), JSON.stringify(task.getInfo())), Math.max(timestamp - Date.now(), 0));
		}

		taskUpdate (data) {
			if(data.op == "i") {
				this.scheduleTask(new Task(data.o), data.o.info.timestamp);
			} else if(data.op == "u") {
				if(data.o.$set && data.o.$set.info) {
					if(data.o.$set.info.state == 0) {
						this.scheduleTask(new Task({ _id: data.o2._id, info: data.o.$set.info }), data.o.$set.info.timestamp);
					}
				}
			}
		}

		async process (_id, info_string) {
			// parse info
			let info = JSON.parse(info_string);

			// update state and check if still valid
			let task = await this.getTasks().findAndModify(
				{ 
					_id, 
					"info.timestamp": info.timestamp, 
					"info.state": 0 
				}, 
				[], 
				{ 
					$set: { 
						info: Object.assign(info, { state: 1 }) 
					} 
				}, 
				{ 
					new: true 
				}
			);
			// task has already been taken by another worker
			if(!task)
				return;

			try {
				// do special processing stuff
				new (LoadUtil.task(info.name))(this, task);
			} catch (e) {
				console.log(e);
			}

		}

		enqueueTimestamp (type, ts, fromDb = false) {
			this.taskTypes[type].timestamps.push(ts);
			if(!fromDb)
				this.ratelimits.insert({ type: type, timestamp: ts });
			this.taskTypes[type].timestamps = this.taskTypes[type].timestamps.sort();
			return setTimeout(() => this.taskTypes[type].timestamps = this.taskTypes[type].timestamps.filter(t => t != ts), Date.now() - ts + 1000);
		}

		enqueue (type, ts = Date.now()) {
			return new Promise((resolve) => {
				if(this.taskTypes[type].timestamps.length < this.taskTypes[type].limit) {
					this.enqueueTimestamp(type, ts);
					return resolve();
				}

				return Promise
					.resolve()
					.wait(ts - this.taskTypes[type].timestamps[this.taskTypes[type].timestamps.length - this.taskTypes[type].limit] + 1000 || 0)
					.then(c => this.enqueue(type))
					.then(r => resolve());
			});
		}

	}

	module.exports = WorkerApp;