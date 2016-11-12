
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
			return this.id;
		}

		get_info () {
			return this.info;
		}

		get_data () {
			return this.data;
		}

		static get_tasks () {
			return DBUtil.get_collection("tasks");
		}

		get_collection () {
			return DBUtil.get_collection(this.name.slice(0, -4).toLowerCase().pluralize());
		}

		async update (options = {}) {
			let tasks = await BaseTask.get_tasks();

			await tasks.update({ _id: this.get__id() }, { $set: { info: Object.assign(this.get_info(), options) } });

			if(options.state == 2)
				tasks.update({ _id: this.get__id() }, { "info.state": 0 });
		}
		
		async destroy () {
			let tasks = await BaseTask.get_tasks();
			await tasks.remove({ _id: this.get__id() });
		}

		static create (data = {}, faf = false) {
			return this.create_task(this.name.slice(0, -4), data, faf);
		}

		static create_task (name = this.name.slice(0, -4), data = {}, faf = false) {
			return BaseTask.get_tasks().then(async tasks => {

				let _id = new ObjectID();

				const finish = {};
				let p = new Promise((res) => finish.cb = res);

				if(!faf) {
					storage.tasks.set(_id.toString(), finish.cb);
				}

				let response = await tasks.update(
					{ data, "info.name": name },
					{
						$setOnInsert: {
							_id,
							data,
							info: {
								name,
								state: 0,
								timestamp: 0,
								modified: 0
							}
						}
					},
					{ upsert: true }
				);

				// if fire and forget or not and its no new task, just resolve
				if(faf || (!faf && !response.nUpserted)) {
					if(!faf && !response.nUpdated)
						console.log("task not upsert-ed", name, JSON.stringify(data));
					finish.cb();
				}

				return p;

			});
		}

		static async watch () {
			let tasks = await DBUtil.get_collection("tasks");
			tasks.get_continuous_updates({}, undefined, async ({ op, o, o2 }) => {
				// giant BLA BLA BLA of finding the _id to call from the map
				let tid;
				if(op == "d") {
					tid = o._id.toString();
				}
				if(op == "u") {
					if(o.$set.info && o.$set.info.state) {
						if(o.$set.info.state == 2)
							tid = o2._id.toString();
					} else {
						let task = await tasks.findBy_id(o2._id);
						if(!await task.isNull() && (await task.getInfo()).state == 2)
						tid = (await task.get__id()).toString();
					}
				}
				if(tid && storage.tasks.get(tid)) {
					storage.tasks.get(tid)();
					storage.tasks.delete(tid);
				}
			});
		}

		/******/

		async dataToForm () {
			let query = {};
			let data = await this.getData();
			for(let i in data)
				query[i] = (data[i] && typeof data[i] == "object" ? data[i].join(",") : data[i]);
			return query;
		}

	}

	storage.watcher = BaseTask.watch();

	module.exports = BaseTask;
