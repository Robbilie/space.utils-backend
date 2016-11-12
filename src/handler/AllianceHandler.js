
	"use strict";

	const { EntityHandler } 	= require("handler/");
	const { AllianceStore } 	= require("store/");

	class AllianceHandler extends EntityHandler {

		static get_executor () {
			return ({ swagger: { params: { alliance_id } } }, { json }) =>
				AllianceStore
					.find_or_create(alliance_id.value)
					.get_executor()
					.serialize()
					.then(json);
		}

		static get_corporations () {
			return ({ swagger: { params: { alliance_id } } }, { json }) =>
				AllianceStore
					.find_or_create(alliance_id.value)
					.get_corporations()
					.serialize()
					.then(json);
		}

	}

	module.exports = AllianceHandler;
