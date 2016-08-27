
	"use strict";

	const { PatchUtil } = require("util");
	const { _Entity } = require("model");

	class _Corporation extends _Entity {

		getCeo () {}

		getAlliance () {}

	}

	PatchUtil._model(_Corporation);

	module.exports = _Corporation;
	