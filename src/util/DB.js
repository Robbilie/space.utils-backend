
	"use strict";

	const { MongoClient } = require("mongodb");
	const { PromiseWrap } = require("util/");

	const config = {
		url: process.env.MONGO_URL,
		db: process.env.MONGO_DB,
		settings: {
			ignoreUndefined: true/*,
			reconnectTries: Number.MAX_VALUE*/
		}
	};

	function get_db (args) {
		return new_db(args).catch(e => console.log("DB ERROR", e) || get_db(args));
	}

	function new_db ({ url, db, settings }) {
		console.log(`~ Connecting to ${url}/${db}`);
		return MongoClient.connect(`${url}/${db}`, settings).then(database => console.log(`~ Connected to ${url}/${db}`) || database);
	}

	module.exports = PromiseWrap(get_db(config));
