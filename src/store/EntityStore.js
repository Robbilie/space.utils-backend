
	"use strict";

	const { Store } 		= require("store/");
	const { PatchUtil } 	= require("util/");

	class EntityStore extends Store {

		get_pk () {
			return "id";
		}

		find_by_pk (pk) {
			return this.find_or_create(pk);
		}

		find_by_id () {}

		find_by_name () {}

	}

	PatchUtil.store(EntityStore);

	module.exports = EntityStore;
