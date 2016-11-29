
	"use strict";

	const { ObjectID, MongoClient, Timestamp } = require("mongodb");
	const { LoadUtil } 				= require("util/");

	const storage 					= {
		db: 		undefined,
		oplog: 		undefined,
		stores: 	new Map(),
		oplogs: 	new Map()
	};

	class DBUtil {

		static get_connection (field, db) {
			if(!storage[field])
				storage[field] = MongoClient.connect(`${process.env.MONGO_URL}/${db}`).catch(e => !(delete storage[field]) || get_connection(field, db));
			return storage[field];
		}

		static get_db () {
			return DBUtil.get_connection("db", process.env.MONGO_DB);
		}

		static get_oplog () {
			return DBUtil.get_connection("oplog", "local");
		}

		static get_collection (collectionName) {
			return DBUtil.get_db().then(db => db.collection(collectionName));
		}

		static get_store (storeName) {
			return LoadUtil.store(storeName);
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

			if(!storage.oplogs.get(index))
				storage.oplogs.set(index, (async () => {
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
					cursor.forEach(() => {}, error => storage.oplogs.delete(index));
					return cursor;
				})());
			return storage.oplogs.get(index);
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
