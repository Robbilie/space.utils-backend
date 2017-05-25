
	"use strict";

	const { MongoClient } = require("mongodb");

	const config = {
		url: process.env.MONGO_URL,
		db: process.env.MONGO_DB,
		settings: {
			ignoreUndefined: true
		}
	};

	function get_db (args) {
		return new_db(args).catch(e => console.log("DB ERROR", e) || get_db(args));
	}

	function new_db ({ url, db, settings }) {
		return MongoClient.connect(`${url}/${db}`, settings)
	}

	module.exports = ((dbPromise) => new Proxy({}, {
		get: (_, collectionName) => new Proxy({}, {
			get: (_, methodName) => (...args) => dbPromise.then(db => db.collection(collectionName)[methodName](...args))
		})
	}))(get_db(config));
