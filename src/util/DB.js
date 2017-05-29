
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

	module.exports = ((promise) => new Proxy(promise, {
		get: (dbPromise, collectionName) => collectionName === "then" ?
			(...args) => dbPromise.then(...args) :
			new Proxy(dbPromise.then(db => db.collection(collectionName)), {
				get: (collectionPromise, methodName) => methodName === "then" ?
					(...args) => collectionPromise.then(...args) :
					(...args) => collectionPromise.then(collection => collection[methodName](...args))
			})
	}))(get_db(config));
