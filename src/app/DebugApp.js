
	"use strict";

	class DebugApp {

		constructor () {
			try {
				this.init();
			} catch (e) {
				console.log(e, new Error());
			}
		}

		async init () {

		}

	}

	module.exports = DebugApp;
