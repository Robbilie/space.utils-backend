
	"use strict";

	const { MongoClient } = require("mongodb");
	const { ProxyWrap } = require("util/");

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

	module.exports = ProxyWrap(get_db(config));
