
	"use strict";

	const IdAndName 				= require("model/IdAndName");
	const PatchUtil 				= require("util/PatchUtil");

	class Corporation extends IdAndName {

		getAlliance () {}

		getCeo () {}

		static lookups () {
			return {
				"alliance":
					"alliance",
				"ceo": {
					from: "characters"
				}
			};
		}

	}
	
	PatchUtil.model(Corporation, [], { Ceo: "Character" });

	module.exports = Corporation;