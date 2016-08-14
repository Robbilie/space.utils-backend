
	"use strict";

	const PatchUtil 				= require("util/PatchUtil");
	const DBUtil 					= require("util/DBUtil");
	const Store 					= require("store/Store");

	class IdAndNameStore extends Store {

		getById () {}

		getByName () {}

		getSettings () {
			return DBUtil
				.getStore("Settings")
				.then(store => store.getById(this.getId()));
		}

	}

	PatchUtil.store(IdAndNameStore, ["getSettings"]);

	module.exports = IdAndNameStore;