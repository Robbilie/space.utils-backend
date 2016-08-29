
	"use strict";

	module.exports = new Proxy({}, { get: (P,key) => require(`./${key}`) });
