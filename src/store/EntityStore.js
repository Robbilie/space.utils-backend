
	"use strict";

	const { IDStore } 		= require("store/");

	class EntityStore extends IDStore {

		static find_by_name (name, {} = $(1, { name }, "String")) {
			return this.findOne({ name });
		}

	}

	module.exports = EntityStore;
