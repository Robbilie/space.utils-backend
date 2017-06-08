
	"use strict";

	module.exports = function PropertyWrap (p = d => d) {
		return new Proxy(p, {
			get: (P, n) => PropertyWrap(d => p(d)[n])
		});
	};
