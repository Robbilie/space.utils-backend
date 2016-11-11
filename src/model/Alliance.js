
	"use strict";

	const { PatchUtil } 	= require("util/");
	const { Entity } 		= require("model/");

	class Alliance extends Entity {

		getExecutor () {}

		getCorporations () {}

		getMembers () {
			return this.getStore().getMembers(this);
		}

	}

	Alliance.types = {
		id: 			Number,
		name: 			String,
		shortName: 		String,
		executor: 		"Corporation",
		corporations: 	"CorporationList",
		updated: 		Number
	};

	PatchUtil.model(Alliance);

	module.exports = Alliance;
