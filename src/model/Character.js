
	"use strict";

	const IdAndName 				= require("model/IdAndName");
	const { PatchUtil } 			= require("util");

	class Character extends IdAndName {

		getCorporation () {}

		static lookups () {
			return {
				"corporation":
					"corporation",
				"corporation.alliance":
					"corporation.alliance"
			};
		}

	}

	PatchUtil.model(Character);
	
	module.exports = Character;