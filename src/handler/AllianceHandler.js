
	"use strict";

	const { EntityHandler } 	= require("handler/");
	const { AllianceStore } 	= require("store/");

	class AllianceHandler extends EntityHandler {

		static async get_executor ({ swagger: { params: { alliance_id } } }, { json }) {
			json(await AllianceStore
				.find_or_create(alliance_id.value)
				.get_executor()
				.serialize());
		}

		static async get_corporations ({ swagger: { params: { alliance_id } } }, { json }) {
			json(await AllianceStore
				.find_or_create(alliance_id.value)
				.get_corporations()
				.serialize());
		}

	}

	module.exports = AllianceHandler;
