
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
		stores: 	new Map(),
		oplogs: 	new Map()
	};

	class DBUtil {

		static getConnection (field, db) {
			if(!storage[field])
				storage[field] = MongoClient.connect(
					`mongodb://${config.database.host}:${config.database.port}/${db}`,
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
			return DBUtil.getConnection("db", config.database.name);
		}

		static getOplog () {
			return DBUtil.getConnection("oplog", config.database.oplog);
		}

		static getStore (storeName) {
			return DBUtil
				.getDB()
				.then(db => storage.stores.get(storeName) || ((storage.stores.set(storeName, new (LoadUtil.store(storeName))(db))) === !storage.stores.get(storeName) || storage.stores.get(storeName)))
				.catch(e => console.log(storeName, e));
		}

		static getCollection (collectionName) {
			return DBUtil.getDB().then(db => db.collection(config.database.prefix + collectionName));
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

			if(!storage.oplogs.get(index))
				storage.oplogs.set(index, DBUtil
					.getOplog()
					/*
					.then(oplog => oplog
						.collection("oplog.rs")
						.find(query)
						.addCursorFlag('tailable', true)
						.addCursorFlag('awaitData', true)
						.addCursorFlag('oplogReplay', true)
						.addCursorFlag('noCursorTimeout', true)
						.setCursorOption('numberOfRetries', Number.MAX_VALUE)
					)
					*/
					.then(db => new Promise(async resolve => {

						const createCursor = (ts = Timestamp(0, Date.now() / 1000 | 0)) => db
							.collection("oplog.rs")
							.find(Object.assign(query, { ts: { $gt: ts } }))
							.addCursorFlag('tailable', true)
							.addCursorFlag('awaitData', true)
							.addCursorFlag('oplogReplay', true)
							.addCursorFlag('noCursorTimeout', true)
							.setCursorOption('numberOfRetries', Number.MAX_VALUE);

						const storage = {
							cursor: null,
							methods: [],
							lastTS: undefined
						};

						const startCursor = () => {
							storage.cursor = createCursor(storage.lastTS);
							storage.cursor.each((err, data) => {
								if(err) {
									console.log("cursor err", err);
									storage.methods.forEach(cb => cb(err));
									return startCursor();
								}
								storage.lastTS = Timestamp(0, data.ts.i);
								storage.methods.forEach(cb => cb(null, data));
							});
						};

						startCursor();

						return resolve({
							each: onData => storage.methods.push(onData)
						});
					}))
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