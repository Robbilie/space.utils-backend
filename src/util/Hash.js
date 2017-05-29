
	"use strict";

	const crypto = require("crypto");

	module.exports = function Hash (obj) {
		return crypto
			.createHash("md5")
			.update(JSON.stringify(obj && obj.constructor.name === "Array" ? obj : Object.entries(obj).sort(([a], [b]) => a > b ? 1 : -1)))
			.digest("hex");
	};
