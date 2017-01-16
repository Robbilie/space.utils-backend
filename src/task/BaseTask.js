
	"use strict";

	const { DBUtil } = require("util/");
	const { ObjectID } = require("mongodb");

	const storage = {
		tasks: new Map()
	};

	class BaseTask {

		constructor ({ _id, info, data }) {
			this._id = _id;
			this.info = info;
			this.data = data;
		}

		get__id () {
			return this._id;
		}

		get_info () {
			return this.info;
		}

		get_data () {
			return this.data;
		}

		get_name () {
			return this.info.name;
		}

		static get_tasks () {
			return DBUtil.get_store("Task");
		}

		get_collection () {
			return DBUtil.get_collection(this.get_name().toLowerCase().pluralize());
		}

		get_store () {
			return DBUtil.get_store(this.get_name());
		}

		update ({ state = 0, expires, modified } = {}) {
			return BaseTask.get_tasks().update(
				{
					_id: this.get__id()
				},
				{
					$set: { info: Object.assign({}, this.get_info(), { state, expires, modified }) }/*{
						"info.state": 		state,
						"info.expires": 	expires,
						"info.modified": 	modified
					}*/
				},
				{ w: 0 }
			);
		}
		
		destroy () {
			return BaseTask.get_tasks().destroy({ _id: this.get__id() });
		}

		static create (data = {}, faf = false) {
			return this.create_task(this.name.slice(0, -4), data, faf);
		}

		static async create_task (name = this.name.slice(0, -4), data = {}, faf = false) {

			let _id = new ObjectID();

			const finish = {};
			let p = new Promise((res) => finish.cb = res);

			if(!faf) {
				storage.tasks.set(_id.toString(), finish.cb);
			}

			let response = await BaseTask.get_tasks().update(
				{ data, "info.name": name },
				{
					$setOnInsert: {
						_id,
						data,
						info: {
							name,
							state: 0,
							expires: 0,
							modified: 0
						}
					}
				},
				{ upsert: true, w: 0 }
			);

			// if fire and forget or not and its no new task, just resolve
			if(faf || (!faf && !response.upsertedCount)) {
				if(!faf && !response.upsertedCount) {
					//console.log("task not upsert-ed", name, JSON.stringify(data));
				}
				finish.cb();
			}

			return p;

		}

		static watch () {
			this.get_tasks().get_continuous_updates({}, undefined, async ({ op, o, o2 }) => {
				// giant BLA BLA BLA of finding the _id to call from the map
				let tid;
				switch (op) {
					case "d":
						tid = o._id.toString();
						break;
					case "u":
						if(o.$set.info && o.$set.info.state && o.$set.info.state != 1) {
							tid = o2._id.toString();
						} else {
							let task = await this.get_tasks().find_by__id(o2._id);
							if(!await task.is_null() && (await task.get_info()).state != 1)
								tid = (await task.get__id()).toString();
						}
						break;
				}
				if(storage.tasks.get(tid)) {
					storage.tasks.get(tid)();
					storage.tasks.delete(tid);
				}
			});
		}

	}

	storage.watcher = BaseTask.watch();

	module.exports = BaseTask;
