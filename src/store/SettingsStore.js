
	"use strict";

	const PatchUtil 				= require("util/PatchUtil");
	const Store 					= require("store/Store");

	class SettingsStore extends Store {

		getById () {}

	}

	PatchUtil.store(SettingsStore);

	module.exports = SettingsStore;