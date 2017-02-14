
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

		update ({ state = 0, expires = this.get_info().expires * 1000, modified = this.get_info().modified * 1000, page = this.get_info().page } = {}, oplog = true) {
			let info = { state, expires: expires / 1000, modified: modified / 1000, page };
			this.set_info(info);
			return BaseTask.get_tasks().update(
				{ _id: this.get__id() },
				{ $set: Object.entries(info).filter(([name, value]) => !!value).reduce((p, [name, value]) => { p[`info.${name}`] = value; return p; }, {}) },
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

		static async create_task (name = this.name.slice(0, -4), data = {}, faf = false) {

			let _id = new ObjectID();

			const finish = {};
			let p = new Promise((res) => finish.cb = res);

			if(!faf) {
				storage.tasks.set(_id.toString(), finish.cb);
			}

			//console.log("exists", await BaseTask.get_tasks().findOne({ data, "info.name": name }));

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
				{ upsert: true }
			);

			// if fire and forget or not and its no new task, just resolve
			if(faf || (!faf && !response.upsertedCount)) {
				if(!faf && !response.upsertedCount) {
					//console.log("task not upsert-ed", name, JSON.stringify(data), response);
				}
				finish.cb();
			}

			return p;

		}

		static watch () {
			this.get_tasks().get_continuous_updates({}, undefined, async ({ op, o, o2 }) => {
				// giant BLA BLA BLA of finding the _id to call from the map
				console.log(JSON.stringify({ op, o, o2 }));
				let tid;
				switch (op) {
					case "d":
						tid = o._id.toString();
						break;
					case "u":
						//if(o && o.$set && o.$set.info && o.$set.info.state && o.$set.info.state != 1) {
						if(o && o.set && o.set["info-state"] && o.set["info-state"] != 1) {
							tid = o2._id.toString();
						} else {
							let task = await this.get_tasks().find_by__id(o2._id);
							if(!await task.is_null() && (await task.get_info()).state != 1)
								tid = (await task.get__id()).toString();
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
