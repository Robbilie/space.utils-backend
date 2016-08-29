
	"use strict";

	const { DBUtil } 			= require("util/");
	const { ObjectId } 			= require("mongodb");

	const storage 					= {
		tasks: 		{},
		stream: 	undefined
	};

	class BaseTask {

		constructor (worker, task) {
			this.worker = worker;
			this.task = task;

			this.start();
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

					BaseTask.waitForTask(_id.toString()).then(e => console.log(this.prototype.constructor.name, "cb", Date.now() - d) || resolve(e)).catch(e => console.log(e));
					
					await tasks.insert(
						{
							_id,
							data: data,
							info: {
								type: 		info.type 		|| typeof(Object.getPrototypeOf(this).prototype) != "undefined" && Object.getPrototypeOf(this).prototype.constructor.getType ? Object.getPrototypeOf(this).prototype.constructor.getType() : undefined,
								timestamp: 	info.timestamp 	|| 0,
								state: 		info.state 		|| 0,
								name: 		info.name 		|| this.prototype.constructor.name
							}
						}
					);

				} catch (e) { console.log(e); }
			});
		}

		static waitForTask (id, {} = $(1, {id}, "String")) {
			return new Promise(async resolve => {
				try {
					if(!storage.stream) {
						const tasks = await DBUtil.getStore("Task");
						let cursor = await tasks.getUpdates();
					 	storage.stream = cursor.stream();
					 	storage.stream.on("data", async log => {
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
					 		if(tid && storage.tasks[tid]) {
					 			storage.tasks[tid]();
					 			delete storage.tasks[tid];
					 		}
					 	});
					}

					storage.tasks[id] = resolve;
				} catch (e) { console.log(e)}
			});
		}

	}

	module.exports = BaseTask;
