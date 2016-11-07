
	"use strict";

	const { PatchUtil, DBUtil } 	= require("util/");
	const { Base } 					= require("model/");
	
	class Entity extends Base {

		getId () {}

		getName () {}

		getSettings () {
			return DBUtil
				.getStore("Settings")
				.then(async (store) => store.findById(await this.getId()));
		}

		getUpdated () {}
		
	}

	Entity.types = {
		id: 		Number,
		name: 		String,
		updated: 	Number
	};

	PatchUtil.model(Entity);

	module.exports = Entity;
	