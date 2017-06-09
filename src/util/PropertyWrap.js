
	"use strict";

	function PropertyWrap (p) {
		return new Proxy(p, {
			get: (P, n) => PropertyWrap(d => p(d)[n])
		});
	}

	module.exports = PropertyWrap;
	module.exports._ = PropertyWrap(d => d);
