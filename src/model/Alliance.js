
	"use strict";

	const { PatchUtil } 	= require("util/");
	const { Entity } 		= require("model/");

	class Alliance extends Entity {

		get_executor () {}

		get_corporations () {}

		get_members () {
			return this.getStore().get_members(this);
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
