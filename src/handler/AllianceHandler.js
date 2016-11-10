
	"use strict";

	const { EntityHandler } 	= require("handler/");
	const { Alliance } 			= require("model/");

	class AllianceHandler extends EntityHandler {

		static get_executor () {
			return ({ swagger: { params: { alliance_id } } }, { json }) =>
				Alliance
					.find_or_create(alliance_id.value)
					.get_executor()
					.toJSON()
					.then(json);
		}

		static get_corporations () {
			return ({ swagger: { params: { alliance_id } } }, { json }) =>
				Alliance
					.find_or_create(alliance_id.value)
					.get_corporations()
					.toJSON()
					.then(json);
		}

	}

	module.exports = AllianceHandler;
