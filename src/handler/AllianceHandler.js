
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

		static async get_alliances_alliance_id_executor_corporation ({ swagger: { params: { alliance_id } } }, res) {
			/*res.json(await AllianceStore
				.find_or_create(alliance_id.value)
				.get_executor_corporation());*/
		}

		static async get_alliances_alliance_id_corporations ({ swagger: { params: { alliance_id } } }, res) {
			/*res.json(await AllianceStore
				.find_or_create(alliance_id.value)
				.get_corporations());*/
		}

	}

	module.exports = AllianceHandler;
