
	"use strict";

	const cache = new WeakMap();

	module.exports = function ProxyWrap (p) {
		if (cache.has(p) === false)
			cache.set(p, new Proxy(p, {
				get: (promise, name) => name === "then" ?
					(...args) => promise.then(...args) :
					(...args) => ProxyWrap(promise.then(object => object[name](...args)))
			}));
		return cache.get(p);
	};
