
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

		static getConnection (field, db) {
			if(!storage[field])
				storage[field] = MongoClient.connect(
					`mongodb://${config.mongo.host}:${config.mongo.port}/${db}`,
					{
						server: {
							reconnectTries: 2000,
							reconnectInterval: 1000,
							socketOptions: {
								autoReconnect: true,
								connectTimeoutMS: 1000 * 60 * 30,
								socketTimeoutMS: 1000 * 60 * 30
							}
						},
						mongos: {
							socketOptions: {
								autoReconnect: true,
								connectTimeoutMS: 1000 * 60 * 30,
								socketTimeoutMS: 1000 * 60 * 30
							}
						},
						replSet: {
							socketOptions: {
								autoReconnect: true,
								connectTimeoutMS: 1000 * 60 * 30,
								socketTimeoutMS: 1000 * 60 * 30
							}
						},
						db: {
							numberOfRetries: 2000,
							retryMiliSeconds: 1000
						}
					}
				);
			return storage[field];
		}

		static getDB () {
			return DBUtil.getConnection("db", config.mongo.db);
		}

		static getOplog () {
			return DBUtil.getConnection("oplog", config.mongo.oplog);
		}

		static getStore (storeName) {
			return DBUtil
				.getDB()
				.then(db => storage.stores.get(storeName) || storage.stores.set(storeName, new (LoadUtil.store(storeName))(db, LoadUtil.model(storeName))).get(storeName))
				.catch(e => console.log(storeName, e, new Error()));
		}

		static getCollection (collectionName) {
			return DBUtil.getDB().then(db => db.collection(config.mongo.prefix + collectionName));
		}

		static getOplogCursor (properties = {}, timestamp = Timestamp(0, Date.now() / 1000 | 0)) {
			const query = properties;
				query.ns = properties.ns ? config.mongo.db + "." + properties.ns : { $regex: new RegExp("^" + config.mongo.db, "i") };
			if(properties.op)
				query.op = properties.op.constructor.name == "String" ? properties.op : { $in: properties.op };
			// generate key so you dont regen the same cursor twice
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