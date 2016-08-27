
	"use strict";

	const { PatchUtil } = require("util");
	const { _Entity } = require("model");

	class _Character extends _Entity {

		getCorporation () {}

	}

	PatchUtil._model(_Character);

	module.exports = _Character;
	