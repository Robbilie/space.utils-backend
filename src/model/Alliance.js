
	"use strict";

	const IdAndName 				= require("model/IdAndName");
	const PatchUtil 				= require("util/PatchUtil");

	class Alliance extends IdAndName {

		getExecutor () {}

		getCorporations () {}

		getMembers () {}

		static getAliases () {
			return { Executor: "Corporation", Members: "Character" };
		}

	}

	PatchUtil.model(Alliance, [], Alliance.getAliases());

	module.exports = Alliance;