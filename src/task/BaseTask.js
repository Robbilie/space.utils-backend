
	"use strict";

	const { DB, Oplog } = require("util/");
	const { ObjectID } 	= require("mongodb");
	const ws  			= require("ws");

	const storage = {
		tasks: new Map()
	};

	class BaseTask {

		static getName () {
			return this.name.slice(0, -4);
		}

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

		getName () {
			return this.info.name;
		}

		async update ({ state = 0, expires, modified, page, hash } = {}, oplog = true) {
			let info = Object.assign({ state, page }, expires ? { expires } : {}, modified ? { modified } : {}, hash ? { hash } : {});
			this.set_info(info);

			let where = { _id: this.get__id() };
			let data = { $set: Object
				.entries(info)
				.filter(([name, value]) => value !== undefined && value !== null)
				.reduce((p, [name, value]) => { p[`info.${name}`] = value; return p; }, {}) };

			await DB.collection("tasks").updateOne(where, data);
			if (oplog === true)
				await Oplog.update("tasks", where, data);
		}

		tick (options = {}) {
			return this.update(Object.assign({ state: 1, modified: Date.now() }, options), false);
		}

		async destroy (oplog = true) {
			await DB.collection("tasks").deleteOne({ _id: this.get__id() });
			if (oplog === true)
				await Oplog.destroy("tasks", { _id: this.get__id() });
		}

		static create (data = {}, faf = false) {
			return this.create_task(this.name.slice(0, -4), data, faf);
		}

		static create_task (name = this.name.slice(0, -4), data = {}, faf = false) {
			return new Promise(async (resolve) => {

				let _id = new ObjectID();

				if (faf === false)
					storage.tasks.set(_id.toString(), resolve);

				let doc = BaseTask.create_doc(name, data, { _id });
				console.log(doc, Date.now());

				let response = await DB.collection("tasks").updateOne(
					Object.assign(
						{ "info.name": name },
						Object.entries(data).reduce((p, [name, value]) => { p[`data.${name}`] = value; return p; }, {})
					),
					{ $setOnInsert: doc },
					{ upsert: true }
				);

				// if fire and forget or not and its no new task, just resolve
				if(faf === true || (faf === false && response.upsertedCount === 0)) {
					if(faf === false && response.upsertedCount === 0) {
						//console.log("task not upsert-ed", name, JSON.stringify(data), response);
					}
					resolve();
				}

			});
		}

		static create_doc (name, data, extras = {}) {
			return { ...extras, data, info: { name, state: 0, expires: 0, modified: 0 } };
		}

		static watch () {
			const reconnect = () => console.log("reconnecting ws") || setTimeout(() => BaseTask.watch(), 1000);
			const socket = new ws(process.env.TASKOPLOG_URL);
			socket.on("message", tid => {
				if(storage.tasks.has(tid)) {
					console.log(tid, Date.now());
					storage.tasks.get(tid)();
					storage.tasks.delete(tid);
				}
			});
			socket.on("error", reconnect);
			socket.on("close", reconnect);
			/*
			Oplog.updates({ ns: "tasks" }, undefined, async ({ op, o, o2 }) => {
				// giant BLA BLA BLA of finding the _id to call from the map
				//console.log(JSON.stringify({ op, o, o2 }));
				if (storage.tasks.size === 0)
					return;
				let tid;
				switch (op) {
					case "d":
						tid = o._id.toString();
						break;
					case "u":
						if(o !== undefined && o.set !== undefined && o.set["info-state"] === 0) {
							tid = o2._id.toString();
						} else {
							console.log("DB TASK _ID SHOULD NOT HAPPEN");
							let task = await DB.collection("tasks").findOne({ _id: o2._id });
							if (task && task.info.state === 0)
								tid = o2._id.toString();
						}
						break;
				}
				if(tid !== undefined && storage.tasks.get(tid)) {
					storage.tasks.get(tid)();
					storage.tasks.delete(tid);
				}
			});
			*/
		}

	}

	storage.watcher = BaseTask.watch();

	module.exports = BaseTask;
