
	"use strict";

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

	};

	module.exports = BaseTask;