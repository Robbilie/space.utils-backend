
	"use strict";

	class BaseHandler {

		static getMethods () {
			return (Object.getPrototypeOf(this).name === "" ?
				[] : Object.getOwnPropertyNames(Object.getPrototypeOf(this))
			).concat(Object.getOwnPropertyNames(this)).filter(name => !Object.getOwnPropertyNames(Function.prototype).includes(name));
		}

		static getName () {
			return this.name.slice(0, -7);
		}

	}

	module.exports = BaseHandler;
