
	"use strict";

	const { DBUtil } 	= require("util/");
	const { Base } 		= require("model/");
	
	class Entity extends Base {

		get_id () {}

		get_name () {}

		get_settings () {
			return DBUtil
				.getStore("Settings")
				.then(async (store) => store.findById(await this.getId()));
		}

		get_updated () {}
		
	}

	module.exports = Entity;

	/* TYPE DEFINITION */

	Entity.types = {
		id: 		Number,
		name: 		String,
		updated: 	Number
	};

	const { PatchUtil } = require("util/");

	PatchUtil.model(Entity);
	