
	"use strict";

	const { Base } 					= require("model");
	const { PatchUtil } 			= require("util");

	class Settings extends Base {

		getId () {}

		getOption (key) {
			return this.data.options[key];
		}

		setOption (key, value) {
			return this
				.update({ $set: { ["options." + key]: value } })
				.then(() => !Object.assign(this.data.options, { [key]: value }) || this.data.options );
		}

	}

	PatchUtil.model(Settings);

	module.exports = Settings;
	