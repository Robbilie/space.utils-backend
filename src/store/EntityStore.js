
	"use strict";

	const { Store } 		= require("store/");

	class EntityStore extends Store {

		static get_pk () {
			return "id";
		}

		static find_by_pk (pk) {
			return this.find_or_create(pk);
		}

		static find_by_id (id, {} = $(1, { id }, "Number")) {
			return this.findOne({ id });
		}

		static find_by_name (name, {} = $(1, { name }, "String")) {
			return this.findOne({ name });
		}

	}

	module.exports = EntityStore;
