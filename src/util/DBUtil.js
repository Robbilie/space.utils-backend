
	"use strict";

	const { 
		ObjectID, 
		MongoClient,
		Timestamp } 				= require("mongodb");
	const config 					= require("util/../../config/");
	const LoadUtil 					= require("util/LoadUtil");

	const storage 					= {
		db: 		undefined,
		oplog: 		undefined,
		stores: 	{},
		oplogs: 	{}
	};

	class DBUtil {

		static getConnection (field, db) {
			return new Promise(resolve => {
				if(storage[field]) {
					resolve(storage[field]);
				} else {
					MongoClient
						.connect(`mongodb://${config.database.host}:${config.database.port}/${db}`)
						.then(con => {
							storage[field] = con;
							resolve(storage[field]);
						})
						.catch(e => {
							console.log(e);
							console.log("Reconnecting…");
							DBUtil.getConnection(field, db).then(r => resolve(r));
						});
				}
			});
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
				.then(db => {
					return Promise.resolve(
						storage.stores[storeName] || 
						((storage.stores[storeName] = new (LoadUtil.store(storeName))(db)) === !storage.stores[storeName] || storage.stores[storeName])
					);
				});
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
			// return already if cursor already exists
			if(storage.oplogs[index])
				return Promise.resolve(storage.oplogs[index]);
			return DBUtil
				.getOplog()
				.then(oplog => {
					// async, couldve been set by now, if not create and set in storage
					if(!storage.oplogs[index]) {
						let cursor = oplog
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
							);
						storage.oplogs[index] = cursor;
					}
					return Promise.resolve(storage.oplogs[index]);
				});
		}

		static to_id (id) {
			return id.constructor.name == "String" ? new ObjectID(id) : id;
		}

	}

	process.on("SIGINT", e => {
		if(storage.db)
			storage.db.close();
		if(storage.oplog)
			storage.oplog.close();
	});

	module.exports = DBUtil;