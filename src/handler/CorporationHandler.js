
	"use strict";

	const { EntityHandler } 	= require("handler/");
	const { CorporationStore } 	= require("store/");

	class CorporationHandler extends EntityHandler {

		static post_corporations_filter (...args) {
			return super.post_filter(...args);
		}

		static get_corporations_corporation_id (...args) {
			return super.get_by_id(...args);
		}

		static get_corporations_corporation_id_alliance ({ swagger: { params: { corporation_id } } }, res) {
			/*CorporationStore
				.find_or_create(corporation_id.value)
				.get_alliance()
			 	.then(data => res.json(data));*/
		}

		static get_corporations_corporation_id_ceo ({ swagger: { params: { corporation_id } } }, res) {
			/*CorporationStore
				.find_or_create(corporation_id.value)
				.get_ceo()
			 	.then(data => res.json(data));*/
		}

	}

	module.exports = CorporationHandler;
	