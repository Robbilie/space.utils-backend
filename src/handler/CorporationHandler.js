
	"use strict";

	const { EntityHandler } 	= require("handler/");
	const { Corporation } 		= require("model/");

	class CorporationHandler extends EntityHandler {

		static get_alliance () {
			return ({ swagger: { params: { corporation_id } } }, { json }) =>
				Corporation
					.find_or_create(corporation_id.value)
					.get_alliance()
					.toJSON()
					.then(json);
		}

		static get_ceo () {
			return ({ swagger: { params: { corporation_id } } }, { json }) =>
				Corporation
					.find_or_create(corporation_id.value)
					.get_ceo()
					.toJSON()
					.then(json);
		}

	}

	module.exports = CorporationHandler;
	