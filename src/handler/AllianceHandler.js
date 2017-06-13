
	"use strict";

	const { EntityHandler } 	= require("handler/");
	const { AllianceStore } 	= require("store/");

	class AllianceHandler extends EntityHandler {

		static post_alliances_filter (...args) {
			return super.post_filter(...args);
		}

		static get_alliances_alliance_id (...args) {
			return super.get_by_id(...args);
		}

		static get_alliances_alliance_id_executor_corporation ({ swagger: { params: { alliance_id } } }, res) {
			/*AllianceStore
				.find_or_create(alliance_id.value)
				.get_executor_corporation()
			 	.then(data => res.json(data));*/
		}

		static get_alliances_alliance_id_corporations ({ swagger: { params: { alliance_id } } }, res) {
			/*AllianceStore
				.find_or_create(alliance_id.value)
				.get_corporations()
			 	.then(data => res.json(data));*/
		}

	}

	module.exports = AllianceHandler;
