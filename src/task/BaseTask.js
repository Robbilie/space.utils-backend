
	"use strict";

	const DBUtil 					= require("util/DBUtil");

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
				let tasks = await DBUtil.getStore("Task");

				let cursor = await tasks.getUpdates();
				const stream = cursor.stream();

				const cb = log => {
					if(
						(log.op == "d" && log.o._id.toString() == task.get_id().toString()) ||
						(log.op == "u" && log.o2._id.toString() == task.get_id().toString() && log.o.$set.info.state == 0)
					) {
						stream.removeListener("data", cb);
						console.log("resolve");
						resolve();
					}
				};

				stream.on("data", cb);

				const task = await tasks.insert(
					{
						data: data,
						info: {
							type: 		info.type 		|| typeof(Object.getPrototypeOf(this).prototype) != "undefined" ? Object.getPrototypeOf(this).prototype.constructor.getType() : undefined,
							timestamp: 	info.timestamp 	|| 0,
							state: 		info.state 		|| 0,
							name: 		info.name 		|| this.prototype.constructor.name
						}
					}
				);
			});
		}

	};

	module.exports = BaseTask;
