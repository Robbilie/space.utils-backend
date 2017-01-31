
	"use strict";

	const { Entity } = require("model/");

	class Alliance extends Entity {

		get_executor_corporation () {}

		get_corporations () {}

	}

	module.exports = Alliance;

	/* TYPE DEFINITION */

	const { Corporation, CorporationList } = require("model/");

	Alliance.types = {
		id: 					Number,
		name: 					String,
		ticker: 				String,
		executor_corporation: 	Corporation,
		date_founded: 			Number,
		corporations: 			CorporationList
	};

	const { PatchUtil } = require("util/");

	PatchUtil.model(Alliance);
