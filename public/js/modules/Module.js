
	"use strict";

	class Module {

		constructor (parent) {
			this.parent 	= parent;
			this.classList 	= [this.constructor.name];
		}

		getParent () {
			return this.parent;
		}

		getApp () {
			return this.getParent().getApp();
		}

		render () {
			return $(["div", { className: this.classList.join(" ") }]);
		}

	}
	