
	"use strict";

	const Route = function (path, cb) {
		let regex = path;
		const vars = path.match(/:([a-zA-Z0-9])*/g);
		if(path.constructor.name == "String") {
			if(vars)
				regex = vars.reduce((p, c) => p.replace(RegExp(c), "([a-zA-Z0-9]*)"), path);
			regex = RegExp("^" + regex + "$");
		}
		return function (route, app) {
			console.log(regex);
			let match = route.match(regex);
			console.log(route, match);
			if(match) {
				let values = match.slice(1);
				let params = vars ? vars.reduce((p, c, i) => { p[c.slice(1)] = values[i]; return p; }, {}) : {};
				cb({ app, params, route });
				return true;
			} else {
				return match;
			}
		};
	};

	const Router = function (routes) {
		return function (url, app) {
			routes.some(route => route(url, app));
		};
	};
	