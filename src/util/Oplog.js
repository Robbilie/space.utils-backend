
	"use strict";

	const { Timestamp } = require("mongodb");

	const { DB } = require("util/");

	class Oplog {

		constructor () {
			this.oplogs = new Map();
		}

		updates (options, last_ts, fn) {
			const local_storage = { last_ts };
			this.get_oplog_cursor(options, local_storage.last_ts).then(updates => updates.forEach(
				log => !(local_storage.last_ts = log.ts) || fn(log),
				error => console.log(error, "restarting", JSON.stringify(options), "cursor…") || this.updates(options, local_storage.last_ts, fn)
			));
		}

		get_oplog_cursor (properties = {}, timestamp = Timestamp(0, Date.now() / 1000 | 0)) {
			const query = properties;

			if(properties.op !== undefined)
				query.op = properties.op.constructor.name === "String" ? properties.op : { $in: properties.op };

			// generate key so you don't regen the same cursor twice
			const index = JSON.stringify(query);
			// add timestamp afterwards otherwise index would differ
			query.ts = { $gt: timestamp };

			if(this.oplogs.has(index) === false) {
				this.oplogs.set(index, (async (i, q) => {
					let cursor = await DB
						.collection("oplog")
						.find(q)
						.batchSize(10000)
						.addCursorFlag('tailable', true)
						.addCursorFlag('awaitData', true);
					cursor.forEach(() => {}, error => this.oplogs.delete(i));
					return cursor;
				})(index, query));
			}
			return this.oplogs.get(index);
		}

		log ({ op, ns, ts = Timestamp(0, Date.now() / 1000 | 0), o, o2 } = {}) {
			DB.collection("oplog").insertOne({ op, ns, ts, o: op === "u" ? this.strip(o) : o, o2: op === "u" ? this.strip(o2) : o2 });
		}

		insert (ns, o, ts) {
			return this.log({ op: "i", ns, o, ts });
		}

		update (ns, o2, o, ts) {
			return this.log({ op: "u", ns, o, o2, ts });
		}

		destroy (ns, o, ts) {
			return this.log({ op: "d", ns, o, ts });
		}

		strip (obj) {
			switch (!obj || !obj.constructor || obj.constructor.name) {
				case "Object":
					let res = {};
					for (let i in obj) {
						if (obj.hasOwnProperty(i)) {
							res[(i[0] === "$" ? i.slice(1) : i).replace(/\./g, "-")] = this.strip(obj[i]);
						}
					}
					return res;
				case "Array":
					return obj.map(this.strip);
				default:
					return obj;
			}
		}

	}

	module.exports = new Oplog();
