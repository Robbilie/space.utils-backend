
	"use strict";

	const { PatchUtil, DBUtil } 	= require("util");
	const { Base } 					= require("model");
	
	class Entity extends Base {

		getId () {}

		getName () {}

		getSettings () {
			return DBUtil
				.getStore("Settings")
				.then(async (store) => store.findById(await this.getId()));
		}
		
	}

	PatchUtil.model(Entity);

	module.exports = Entity;
	