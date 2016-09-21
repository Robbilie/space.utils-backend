
	"use strict";

	const { DBUtil } 			= require("util/");
	const { ObjectId } 			= require("mongodb");

	const storage 					= {
		tasks: 		new Map(),
		stream: 	undefined
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
			return new Promise(async resolve => {
				try {
					
					let tasks = await DBUtil.getStore("Task");
					
					let _id = new ObjectId();

					const d = Date.now();

					BaseTask.waitForTask(_id.toString()).then(e => (this.name == "KillmailJsonTask" ? null : console.log(this.name, "cb", Date.now() - d)) || resolve(e)).catch(e => console.log(e, new Error()));
					
					await tasks.insert(
						{
							_id,
							data: data,
							info: {
								type: 		info.type 		|| this.getType(),
								timestamp: 	info.timestamp 	|| 0,
								state: 		info.state 		|| 0,
								name: 		info.name 		|| this.name
							}
						}
					);

				} catch (e) { console.log(e, new Error()); }
			});
		}

		static waitForTask (id, {} = $(1, {id}, "String")) {
			return new Promise(resolve => {
				if(!storage.stream)
					storage.stream = DBUtil
						.getStore("Task")
						.then(tasks => tasks
							.getUpdates()
							.then(cursor => cursor
								.each(async (err, log) => {
									if(err)
										return console.log(err);
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
								})
							)
						);

				storage.tasks.set(id, resolve);
			});
		}

	}

	module.exports = BaseTask;
