
	"use strict";

	const { DBUtil } = require("util/");
	const { ObjectID } = require("mongodb");

	const storage = {
		tasks: new Map()
	};

	class BaseTask {

		constructor (worker, { _id, info, data }) {
			this.worker = worker;
			this._id = _id;
			this.info = info;
			this.data = data;
		}

		get_worker () {
			return this.worker;
		}

		enqueue_reference (...args) {
			this.get_worker().enqueue_reference(...args);
		}

		get__id () {
			return this._id;
		}

		get_info () {
			return this.info;
		}

		set_info (info) {
			this.info = Object.assign({}, this.info, info);
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

		update ({ state = 0, expires, modified, page } = {}, oplog = true) {
			let info = Object.assign({ state, page }, expires ? { expires: (expires / 1000)|0 } : {}, modified ? { modified: (modified / 1000)|0 } : {});
			this.set_info(info);
			return BaseTask.get_tasks().update(
				{ _id: this.get__id() },
				{ $set: Object.entries(info).filter(([name, value]) => value != undefined && value != null).reduce((p, [name, value]) => { p[`info.${name}`] = value; return p; }, {}) },
				{},
				oplog
			);
		}

		tick (options = {}) {
			return this.update(Object.assign({ state: 1, modified: Date.now() }, options), false);
		}
		
		destroy (oplog = true) {
			return BaseTask.get_tasks().destroy({ _id: this.get__id() }, oplog);
		}

		static create (data = {}, faf = false) {
			return this.create_task(this.name.slice(0, -4), data, faf);
		}

		static create_task (name = this.name.slice(0, -4), data = {}, faf = false) {
			return new Promise(async (resolve) => {

				let _id = new ObjectID();

				if (!faf)
					storage.tasks.set(_id.toString(), resolve);

				let response = await BaseTask.get_tasks().update(
					Object.assign(
						{ "info.name": name },
						Object.entries(data).reduce((p, [name, value]) => { p[`data.${name}`] = value; return p; }, {})
					),
					//{ data, "info.name": name },
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
					{ upsert: true }
				);

				// if fire and forget or not and its no new task, just resolve
				if(faf || (!faf && !response.upsertedCount)) {
					if(!faf && !response.upsertedCount) {
						//console.log("task not upsert-ed", name, JSON.stringify(data), response);
					}
					resolve();
				}

			});
		}

		static watch () {
			this.get_tasks().get_continuous_updates({}, undefined, async ({ op, o, o2 }) => {
				// giant BLA BLA BLA of finding the _id to call from the map
				//console.log(JSON.stringify({ op, o, o2 }));
				let tid;
				switch (op) {
					case "d":
						tid = o._id.toString();
						break;
					case "u":
						if(o && o.set && o.set["info-state"] && o.set["info-state"] == 0) {
							tid = o2._id.toString();
						} else {
							let collection = await this.get_tasks().get_collection();
							let task = await collection.findOne({ _id: o2._id });
							if (task && task.info.state == 0)
								tid = o2._id.toString();
						}
						break;
				}
				if(tid && storage.tasks.get(tid)) {
					storage.tasks.get(tid)();
					storage.tasks.delete(tid);
				}
			});
		}

	}

	storage.watcher = BaseTask.watch();

	module.exports = BaseTask;
