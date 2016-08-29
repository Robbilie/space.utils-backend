
	"use strict";

	const { PatchUtil } 			= require("util/");
	const { Store } 				= require("store/");

	class SettingsStore extends Store {

		findById () {}

	}

	PatchUtil.store(SettingsStore);

	module.exports = SettingsStore;