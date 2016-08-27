
	"use strict";

	const { PatchUtil } = require("util");
	const { _Entity } = require("model");

	class _Alliance extends _Entity {

		getExecutor () {}

	}

	PatchUtil._model(_Alliance);

	module.exports = _Alliance;
