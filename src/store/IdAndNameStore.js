
	"use strict";

	const PatchUtil 				= require("util/PatchUtil");
	const Store 					= require("store/Store");

	class IdAndNameStore extends Store {

		getById () {}

		getByName () {}

	}

	PatchUtil.store(IdAndNameStore);

	module.exports = IdAndNameStore;