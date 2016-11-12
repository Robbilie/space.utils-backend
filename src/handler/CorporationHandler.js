
	"use strict";

	const { EntityHandler } 	= require("handler/");
	const { CorporationStore } 	= require("store/");

	class CorporationHandler extends EntityHandler {

		static async get_alliance ({ swagger: { params: { corporation_id } } }, { json }) {
			json(await CorporationStore
				.find_or_create(corporation_id.value)
				.get_alliance()
				.serialize());
		}

		static async get_ceo ({ swagger: { params: { corporation_id } } }, { json }) {
			json(await CorporationStore
				.find_or_create(corporation_id.value)
				.get_ceo()
				.serialize());
		}

	}

	module.exports = CorporationHandler;
	