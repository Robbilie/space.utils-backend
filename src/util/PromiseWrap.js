
	"use strict";

	const cache = new WeakMap();

	function PromiseWrap (p) {
		/*
		if (cache.has(p) === false)
			cache.set(p, new Proxy(p, {
				get: (promise, name) => name === "then" ?
					(...args) => promise.then(...args) :
					(...args) => PromiseWrap(promise.then(object => object[name](...args)))
			}));
		return cache.get(p);
		*/
		return new Proxy(p, {
			get: (promise, name) => name === "then" ?
				(...args) => promise.then(...args) :
				(...args) => PromiseWrap(promise.then(object => object[name](...args)))
		});
	}

	module.exports = PromiseWrap;
