
	"use strict";

	module.exports = new Proxy({}, {
		get: (P, key) => {
			const r = require(`./${key}`);
			console.log(P, key, r);
			return r;
		}
	});
