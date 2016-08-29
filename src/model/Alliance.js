
	"use strict";

	const { PatchUtil } 	= require("util/");
	const { Entity } 		= require("model/");

	class Alliance extends Entity {

		getExecutor () {}

		getCorporations () {}

		getMembers () {
			return this.getStore().getMembers(this);
		}

	}

	PatchUtil.model(Alliance);

	module.exports = Alliance;
