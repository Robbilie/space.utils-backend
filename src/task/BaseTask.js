
	"use strict";

	const DBUtil 					= require("util/DBUtil");
	const {ObjectId} 				= require("mongodb");

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

		enqueue () {
			return this.worker.enqueue(this.getInfo().type);
		}

		dataToForm () {
			let query = {};
			for(let i in this.getData())
				query[i] = (this.getData()[i] && typeof this.getData()[i] == "object" ? this.getData()[i].join(",") : this.getData()[i]);
			return query;
		}

		update (changes = {}) {
			return this.worker.getTasks().findAndModify(
				{ 
					_id: this.task.get_id()
				}, 
				[], 
				{ 
					$set: { 
						info: Object.assign(this.getInfo(), changes) 
					} 
				}, 
				{ 
					new: true 
				}
			);
		}

		delete () {
			return this.worker.getTasks().delete({ _id: this.task.get_id() });
		}

		static create (data = {}, info = {}) {
			return new Promise(async (resolve, reject) => {
				try {
					let tasks = await DBUtil.getStore("Task");
					
					let _id = new ObjectId();

					BaseTask.waitForTask(_id.toString()).then(resolve).catch(e => console.log(e));
					
					let task = await tasks.insert(
						{
							_id,
							data: data,
							info: {
								type: 		info.type 		|| typeof(Object.getPrototypeOf(this).prototype) != "undefined" ? Object.getPrototypeOf(this).prototype.constructor.getType() : undefined,
								timestamp: 	info.timestamp 	|| 0,
								state: 		info.state 		|| 0,
								name: 		info.name 		|| this.prototype.constructor.name
							}
						}
					);

				} catch (e) { console.log(e)}
			});
		}

		static waitForTask (id, {} = $(1, {id}, "String")) {
			return new Promise(async resolve => {
				try {
					if(!storage.stream) {
						let tasks = await DBUtil.getStore("Task");
						let cursor = await tasks.getUpdates();
					 	storage.stream = cursor.stream();
					 	storage.stream.on("data", async log => {
					 		let tid;
					 		if(log.op == "d") {
					 			tid = log.o._id.toString();
					 		}
					 		if(log.op == "u") {
					 			if(log.o.$set.info && log.o.$set.info.state == 0) {
					 				tid = log.o2._id.toString();
					 			} else {
				 					tid = await DBUtil.getStore("Task").then(store => store.getBy_id(log.o2._id)).then(task => task && task.getInfo().state == 0 ? task.get_id().toString() : undefined);
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

	};

	module.exports = BaseTask;
