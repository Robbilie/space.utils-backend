
	"use strict";

	const { Store } 		= require("store/");
	const { PatchUtil } 	= require("util/");

	class EntityStore extends Store {

		getPK () {
			return "id";
		}

		findByPK (pk) {
			return this.findOrCreate(pk);
		}

		findById () {}

		findByName () {}

	}

	PatchUtil.store(EntityStore);

	module.exports = EntityStore;