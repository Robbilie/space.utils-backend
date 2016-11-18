
	"use strict";

	const { EntityHandler } 	= require("handler/");
	const { AllianceStore } 	= require("store/");

	class AllianceHandler extends EntityHandler {

		static async get_executor_corporation ({ swagger: { params: { alliance_id } } }, res) {
			res.json(await AllianceStore
				.find_or_create(alliance_id.value)
				.get_executor_corporation()
				.serialize());
		}

		static async get_corporations ({ swagger: { params: { alliance_id } } }, res) {
			res.json(await AllianceStore
				.find_or_create(alliance_id.value)
				.get_corporations()
				.serialize());
		}

	}

	module.exports = AllianceHandler;
