
	"use strict";

	const { DBUtil } 			= require("util/");
	const { ObjectId } 			= require("mongodb");

	const storage 					= {
		tasks: 		new Map(),
		stream: 	null,
		taskCollection: null,
		lastTS: undefined
	};

	class BaseTask {

		constructor (worker, task) {
			this.worker = worker;
			this.task = task;

			this.start();
		}

		getType () {
			return "debug";
		}

		getData () {
			return this.task.getData();
		}

		getInfo () {
			return this.task.getInfo();
		}

		async enqueue () {
			return this.worker.enqueue((await this.getInfo()).type);
		}

		async dataToForm () {
			let query = {};
			let data = await this.getData();
			for(let i in data)
				query[i] = (data[i] && typeof data[i] == "object" ? data[i].join(",") : data[i]);
			return query;
		}

		async update (changes = {}) {
			return this.worker.getTasks().update(
				{ 
					_id: await this.task.get_id()
				}, 
				{ 
					$set: { 
						info: Object.assign(await this.getInfo(), changes)
					} 
				}
			);
		}

		async destroy () {
			return this.worker.getTasks().destroy({ _id: await this.task.get_id() });
		}

		static create (data = {}, info = {}) {
			if(!storage.stream)
				storage.stream = BaseTask.stream();
			return storage.stream.then(stream => stream(data, info));
		}

		static stream () {
			return DBUtil.getCollection("tasks")
				.then(tasks => {
					storage.taskCollection = tasks;
				})
				.then(() => BaseTask.tail())
				.then(() =>
					(data, info) => new Promise(resolve => {
						let _id = new ObjectId();

						storage.tasks.set(_id.toString(), resolve);

						storage.taskCollection.save({
							_id,
							data,
							info: {
								type: 		info.type 		|| this.getType(),
								timestamp: 	info.timestamp 	|| 0,
								state: 		info.state 		|| 0,
								name: 		info.name 		|| this.name
							}
						});
					})
				);
		}

		static tail () {
			return DBUtil
				.getStore("Task")
				.then(tasks => tasks.getUpdates({}, storage.lastTS)
					.then(cursor => cursor.each(async (err, log) => {
						if(err)
							return console.log(err, "restarting cursor…") || BaseTask.tail();
						storage.lastTS = log.ts;
						let tid;
						if(log.op == "d") {
							tid = log.o._id.toString();
						}
						if(log.op == "u") {
							if(log.o.$set.info && log.o.$set.info.state) {
								if(log.o.$set.info.state == 2)
									tid = log.o2._id.toString();
							} else {
								let task = await tasks.findBy_id(log.o2._id);
								if(!await task.isNull() && (await task.getInfo()).state == 2)
								tid = (await task.get_id()).toString();
							}
						}
						if(tid && storage.tasks.get(tid)) {
							storage.tasks.get(tid)();
							storage.tasks.delete(tid);
						}
					}))
				);
		}

	}

	module.exports = BaseTask;
