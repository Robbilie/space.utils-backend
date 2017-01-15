
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
			poolSize: 100,
			socketOptions: {
				//autoReconnect: false,
				keepAlive: 1,
				reconnectTries: Number.MAX_VALUE,
				socketTimeoutMS: 10 * 1000,
				connectTimeoutMS: 10 * 1000
			},
			replset: {
				keepAlive: 1,
				socketTimeoutMS: 10 * 1000,
				connectTimeoutMS: 10 * 1000
			},
			reconnectTries: 10,
			reconnectInterval: 500
		}
	};

	class DBUtil {

		static get_connection (field, db) {
			if(!storage[field])
				storage[field] = MongoClient.connect(`${process.env.MONGO_URL}/${db}?replicaSet=rs0&socketTimeoutMS=${10 * 1000}&connectTimeoutMS=${10 * 1000}`, settings)
					.then(db => db.on("error", e => console.log("DB Error:", e)))
					.catch(e => console.log("DB Connection Error", e) || !(delete storage[field]) || DBUtil.get_connection(field, db));
			return storage[field];
		}

		static get_db () {
			return DBUtil.get_connection("db", process.env.MONGO_DB);
		}

		static get_oplog () {
			return DBUtil.get_connection("oplog", "local");
		}

		static get_collection (name) {
			//if(!collections.get(name))
			//	collections.set(name, DBUtil.get_db().then(db => db.collection(name)));
			//return collections.get(name);
			console.log("coll", name);
			return DBUtil.get_db().then(db => db.collection(name));
		}

		static get_store (name) {
			if(!stores.get(name))
				stores.set(name, LoadUtil.store(name));
			return stores.get(name);
		}

		static get_oplog_cursor (properties = {}, timestamp = Timestamp(0, Date.now() / 1000 | 0)) {
			const query = properties;

			if(properties.ns)
				query.ns = process.env.MONGO_DB + "." + properties.ns;
			else
				query.ns = { $regex: new RegExp("^" + process.env.MONGO_DB, "i") };

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
						.collection("oplog.rs")
						.find(query)
						.batchSize(10000)
						.addCursorFlag('tailable', true)
						.addCursorFlag('awaitData', true)
						.addCursorFlag('oplogReplay', true)
						.addCursorFlag('noCursorTimeout', true)
						.setCursorOption('numberOfRetries', Number.MAX_VALUE);
					cursor.forEach(() => {}, error => oplogs.delete(index));
					return cursor;
				})());
			return oplogs.get(index);
		}

		static to_id (id) {
			return id.constructor.name == "String" ? new ObjectID(id) : id;
		}

	}

	process.on("SIGINT", () => {
		if(storage.db)
			storage.db.close();
		if(storage.oplog)
			storage.oplog.close();
	});

	module.exports = DBUtil;
