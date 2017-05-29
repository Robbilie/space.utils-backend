
	"use strict";

	const { Base } 		= require("model/");
	
	class Entity extends Base {

		get_id () {}

		get_name () {}
		
	}

	module.exports = Entity;

	/* TYPE DEFINITION */

	Entity.types = {
		id: 		Number,
		name: 		String
	};

	const { PatchUtil } = require("util/");

	PatchUtil.model(Entity);
	