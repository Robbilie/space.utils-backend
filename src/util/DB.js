
	"use strict";

	const { MongoClient } = require("mongodb");
	const { PromiseWrap } = require("util/");

	const config = {
		url: process.env.MONGO_URL,
		db: process.env.MONGO_DB,
		settings: {
			keepAlive: true,
			ignoreUndefined: true,
			//reconnectTries: Number.MAX_VALUE,
			compression: { compressors: ["snappy"] },
		}
	};

	function get_db (args) {
		return new_db(args).catch(e => console.log("DB ERROR", e) || get_db(args));
	}

	function new_db ({ url, db, settings }) {
		console.log(`~ Connecting to ${url}/${db}`);
		return MongoClient.connect(`${url}/${db}?compressors=snappy`, settings).then(client => console.log(`~ Connected to ${url}/${db}`) || client.db(db));
	}

	module.exports = PromiseWrap(get_db(config));
