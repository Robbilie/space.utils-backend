
	"use strict";

	const { ObjectID, MongoClient, Timestamp } = require("mongodb");
	const { LoadUtil } = require("util/");

	const storage = { db: undefined, oplog: undefined };

	const oplogs 		= new Map();
	const stores 		= new Map();
	const collections 	= new Map();

	const settings = {
		db: {
			ignoreUndefined: true,
			//bufferMaxEntries: 0
		},
		server: {
			//poolSize: 50
		}
	};

	class DBUtil {

		static get_connection (field, db) {
			if(!storage[field])
				storage[field] = MongoClient.connect(`${process.env.MONGO_URL}/${db}`/*?replicaSet=rs0&socketTimeoutMS=${10 * 1000}&connectTimeoutMS=${10 * 1000}`*/, settings)
					.then(db => db.on("error", e => console.log("DB Error:", e)))
					.catch(e => console.log("DB Connection Error", e) || !(delete storage[field]) || DBUtil.get_connection(field, db));
			return storage[field];
		}

		static get_db () {
			return DBUtil.get_connection("db", process.env.MONGO_DB);
		}

		static get_oplog () {
			//return DBUtil.get_connection("oplog", "local");
			return DBUtil.get_connection("oplog", process.env.MONGO_DB);
		}

		static get_collection (name) {
			//if(!collections.get(name))
			//	collections.set(name, DBUtil.get_db().then(db => db.collection(name)));
			//return collections.get(name);
			//console.log("coll", name);
			return DBUtil.get_db().then(db => db.collection(name));
		}

		static get_store (name) {
			if(!stores.get(name))
				stores.set(name, LoadUtil.store(name));
			return stores.get(name);
		}

		static get_oplog_cursor (properties = {}, timestamp = Timestamp(0, Date.now() / 1000 | 0)) {
			const query = properties;

			/*
			if(properties.ns)
				query.ns = process.env.MONGO_DB + "." + properties.ns;
			else
				query.ns = { $regex: new RegExp("^" + process.env.MONGO_DB, "i") };
			*/

			if(properties.op)
				query.op = properties.op.constructor.name == "String" ? properties.op : { $in: properties.op };

			// generate key so you don't regen the same cursor twice
			const index = JSON.stringify(query);
			// add timestamp afterwards otherwise index would differ
			query.ts = { $gt: timestamp };

			if(!oplogs.get(index))
				oplogs.set(index, (async () => {
					let oplog = await DBUtil.get_oplog();
					let cursor = oplog
						.collection("oplog")
						//.collection("oplog.rs")
						.find(query)
						.batchSize(10000)
						.addCursorFlag('tailable', true)
						.addCursorFlag('awaitData', true);
						//.addCursorFlag('oplogReplay', true);
						//.addCursorFlag('noCursorTimeout', true)
						//.setCursorOption('numberOfRetries', Number.MAX_VALUE);
					cursor.forEach(() => {}, error => oplogs.delete(index));
					return cursor;
				})());
			return oplogs.get(index);
		}

		static to_id (id) {
			return id.constructor.name == "String" ? new ObjectID(id) : id;
		}

		static oplog ({ op, ns, ts = Timestamp(0, Date.now() / 1000 | 0), o, o2 } = {}) {
			DBUtil.get_oplog().then(oplog => {
				//console.log(JSON.stringify({ op, ns, ts, o, o2 }));
				oplog.collection("oplog").insertOne({ op, ns, ts, o: op == "u" ? DBUtil.strip(o) : o, o2: op == "u" ? DBUtil.strip(o2) : o2 });
			});
		}

		static strip (obj) {
			switch (!obj || !obj.constructor || obj.constructor.name) {
				case "Object":
					let res = {};
					for (let i in obj) {
						res[(i[0] == "$" ? i.slice(1) : i).replace(/\./g, "-")] = DBUtil.strip(obj[i]);
					}
					return res;
				case "Array":
					return obj.map(DBUtil.strip);
				default:
					return obj;
			}
		}

	}

	process.on("SIGINT", () => {
		if(storage.db)
			storage.db.close();
		if(storage.oplog)
			storage.oplog.close();
	});

	module.exports = DBUtil;
