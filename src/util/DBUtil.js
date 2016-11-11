
	"use strict";

	const { 
		ObjectID, 
		MongoClient,
		Timestamp
	} = require("mongodb");
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
				storage[field] = MongoClient.connect(`${process.env.MONGO_URL}/${db}`).catch(e => delete storage[field]);
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

		/********/

		static get_store (storeName) {
			return DBUtil
				.getDB()
				.then(db => storage.stores.get(storeName) || storage.stores.set(storeName, new (LoadUtil.store(storeName))(db, LoadUtil.model(storeName))).get(storeName))
				.catch(e => console.log(storeName, e, new Error()));
		}

		static get_oplog_cursor (properties = {}, timestamp = Timestamp(0, Date.now() / 1000 | 0)) {
			const query = properties;
				query.ns = properties.ns ? process.env.MONGO_DB + "." + properties.ns : { $regex: new RegExp("^" + process.env.MONGO_DB, "i") };
			if(properties.op)
				query.op = properties.op.constructor.name == "String" ? properties.op : { $in: properties.op };
			// generate key so you don't regen the same cursor twice
			const index = JSON.stringify(query);
			// add timestamp afterwards otherwise index would differ
			query.ts = { $gt: timestamp };

			if(!storage.oplogs.get(index))
				storage.oplogs.set(index, DBUtil
					.getOplog()
					.then(oplog => oplog
						.collection("oplog.rs")
						.find(query)
						.batchSize(10000)
						.addCursorFlag('tailable', true)
						.addCursorFlag('awaitData', true)
						.addCursorFlag('oplogReplay', true)
						.addCursorFlag('noCursorTimeout', true)
						.setCursorOption('numberOfRetries', Number.MAX_VALUE)
					)
					.then(cursor => cursor.each(e => e ? storage.oplogs.delete(index) : null) || cursor)
				);
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
