
	"use strict";

	const { PatchUtil } = require("util");
	const { _Base } = require("model");
	
	class _Entity extends _Base {

		getId () {}

		getName () {}
		
	}

	PatchUtil._model(_Entity);

	module.exports = _Entity;
	