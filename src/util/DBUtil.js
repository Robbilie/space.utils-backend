
	"use strict";

	const { 
		ObjectID, 
		MongoClient,
		Timestamp
	} = require("mongodb");
	const { LoadUtil } 				= require("util/");
	const config 					= require("util/../../config/");

	const storage 					= {
		db: 		undefined,
		oplog: 		undefined,
		stores: 	{},
		oplogs: 	{}
	};

	class DBUtil {

		static getConnection (field, db) {
			if(!storage[field])
				storage[field] = MongoClient.connect(
					`mongodb://${config.database.host}:${config.database.port}/${db}`,
					{
						server: {
							auto_reconnect: true,
							reconnectTries: 2000,
							reconnectInterval: 1000
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
			return DBUtil.getConnection("db", config.database.name);
		}

		static getOplog () {
			return DBUtil.getConnection("oplog", config.database.oplog);
		}

		static getStore (storeName) {
			return DBUtil
				.getDB()
				.then(db => storage.stores[storeName] || ((storage.stores[storeName] = new (LoadUtil.store(storeName))(db)) === !storage.stores[storeName] || storage.stores[storeName]))
				.catch(e => console.log(storeName, e));
		}

		static getOplogCursor (properties = {}) {
			const query = properties;
				query.ns = properties.ns ? config.database.name + "." + properties.ns : { $regex: new RegExp("^" + config.database.name, "i") };
			if(properties.op)
				query.op = properties.op.constructor.name == "String" ? properties.op : { $in: properties.op };
			// generate key so you dont regen the same cursor twice
			const index = JSON.stringify(query);
			// add timestamp afterwards otherwise index would differ
			query.ts = { $gt: Timestamp(0, Date.now() / 1000 | 0) };

			if(!storage.oplogs[index])
				storage.oplogs[index] = DBUtil
					.getOplog()
					.then(oplog => oplog
						.collection("oplog.rs")
						.find(
							query,
							{
								tailable: 			true,
								awaitdata: 			true,
								oplogReplay: 		true,
								noCursorTimeout: 	true,
								numberOfRetries: 	Number.MAX_VALUE
							}
						));
			return storage.oplogs[index];
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